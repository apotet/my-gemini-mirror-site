"""Read an externally pinned, explicitly approved, local designer input package.

The caller verifies the owner's approval and screens the *visible* screenshots for
sensitive data before pinning the manifest. Hash validation and image metadata
removal cannot identify PII, credentials or confidential text visible in pixels.
No paths, input text, image bytes or parser errors are included in diagnostics.
"""

from contextlib import contextmanager
from dataclasses import dataclass, field
import hashlib
import hmac
from io import BytesIO
import os
from pathlib import Path
import re
import stat
import warnings

from . import policy


class IntakeError(ValueError):
    """Static error code safe to include in a coarse operator ledger."""

    def __init__(self, code):
        self.code = code
        super().__init__(code)


@dataclass(frozen=True)
class TextAttachment:
    label: str = field(repr=False)
    path: str = field(repr=False)
    sha256: str
    source_sha: str
    text: str = field(repr=False)


@dataclass(frozen=True)
class ImageAttachment:
    label: str = field(repr=False)
    path: str = field(repr=False)
    sha256: str
    source_sha: str
    mime_type: str
    data: bytes = field(repr=False)
    width: int
    height: int


@dataclass(frozen=True)
class PackageMetadata:
    manifest_sha256: str
    raw_bytes: int
    pixels: int


@dataclass(frozen=True)
class Package:
    task_id: str = field(repr=False)
    round_id: str = field(repr=False)
    source_sha: str
    brief: str = field(repr=False)
    context: tuple[TextAttachment, ...]
    images: tuple[ImageAttachment, ...]
    metadata: PackageMetadata


_SHA1 = re.compile(r'[a-f0-9]{40}')
_SHA256 = re.compile(r'[a-f0-9]{64}')
_LABEL = re.compile(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,63}')
_COMPONENT = re.compile(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,127}')
_MANIFEST_KEYS = {'version', 'task_id', 'round_id', 'source_sha', 'brief', 'context', 'images'}
_ATTACHMENT_KEYS = {'label', 'path', 'sha256', 'source_sha'}
_IMAGE_FORMATS = {'image/png': 'PNG', 'image/jpeg': 'JPEG'}


def _matches(value, pattern):
    return isinstance(value, str) and pattern.fullmatch(value) is not None


def _checked_text(data):
    try:
        text = policy.checked_text_bytes(data)
        policy.safe_value(text)
        return text
    except (ValueError, RecursionError):
        raise IntakeError('text_rejected') from None


def _parts(path):
    if not isinstance(path, str):
        raise IntakeError('invalid_path')
    parts = path.split('/')
    if not parts or not all(_matches(part, _COMPONENT) for part in parts):
        raise IntakeError('invalid_path')
    return parts


@contextmanager
def _open_directory(directory):
    """Walk each path component on pinned directory descriptors, never through links."""
    current = None
    try:
        root = Path(directory)
        if not root.is_absolute():
            root = Path.cwd() / root
        if root.anchor != '/' or '..' in root.parts:
            raise IntakeError('invalid_package_directory')
        flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
        current = os.open(root.anchor, flags)
        for part in root.parts[1:]:
            child = os.open(part, flags, dir_fd=current)
            os.close(current)
            current = child
    except (AttributeError, NotImplementedError, OSError, TypeError, ValueError):
        if current is not None:
            os.close(current)
        raise IntakeError('invalid_package_directory') from None
    try:
        yield current
    finally:
        os.close(current)


def _read_file(root_fd, path, expected, limit, remaining=None):
    parts = _parts(path)
    directory_fd = root_fd
    file_fd = None
    try:
        flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
        for part in parts[:-1]:
            inner = os.open(part, flags, dir_fd=directory_fd)
            if directory_fd != root_fd:
                os.close(directory_fd)
            directory_fd = inner
        # O_NONBLOCK makes rejection safe even if the leaf is a pipe.
        file_fd = os.open(
            parts[-1],
            os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | os.O_CLOEXEC,
            dir_fd=directory_fd,
        )
        info = os.fstat(file_fd)
        if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
            raise IntakeError('invalid_attachment_file')
        if info.st_size > limit:
            raise IntakeError('file_size_limit')
        if remaining is not None and info.st_size > remaining:
            raise IntakeError('total_raw_limit')
        bound = min(limit, remaining) if remaining is not None else limit
        result = bytearray()
        while len(result) <= bound:
            chunk = os.read(file_fd, min(65536, bound + 1 - len(result)))
            if not chunk:
                break
            result.extend(chunk)
        if len(result) > bound:
            raise IntakeError('total_raw_limit' if bound < limit else 'file_size_limit')
        if not hmac.compare_digest(hashlib.sha256(result).hexdigest(), expected):
            raise IntakeError('file_hash_mismatch')
        return bytes(result)
    except (NotImplementedError, OSError):
        raise IntakeError('invalid_attachment_file') from None
    finally:
        if file_fd is not None:
            os.close(file_fd)
        if directory_fd != root_fd:
            os.close(directory_fd)


def _canonical_image(raw, mime_type, remaining_pixels):
    try:
        from PIL import Image, ImageFile, ImageOps
    except (ImportError, OSError):
        raise IntakeError('image_decoder_unavailable') from None

    if ImageFile.LOAD_TRUNCATED_IMAGES:
        raise IntakeError('image_decoder_unavailable')

    expected = _IMAGE_FORMATS[mime_type]
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            with Image.open(BytesIO(raw), formats=(expected,)) as image:
                width, height = image.size
                if image.format != expected or width <= 0 or height <= 0:
                    raise IntakeError('invalid_image')
                if width * height > remaining_pixels:
                    raise IntakeError('pixel_limit')
                if getattr(image, 'n_frames', 1) != 1:
                    raise IntakeError('invalid_image')
                # Normalize ordinary 1–8-bit PNG screenshots only. Pillow can
                # downsample 16-bit RGB while opening, before exposing its mode.
                if expected == 'PNG' and (len(raw) < 33 or raw[24] not in (1, 2, 4, 8)):
                    raise IntakeError('unsupported_image_encoding')
                image.verify()
            with Image.open(BytesIO(raw), formats=(expected,)) as image:
                if image.mode not in ('1', 'L', 'LA', 'P', 'RGB', 'RGBA'):
                    raise IntakeError('unsupported_image_encoding')
                image.load()
                mode = 'RGBA' if ('A' in image.getbands() or 'transparency' in image.info) else 'RGB'
                # Preserve the intended orientation, but do not copy EXIF, ICC,
                # PNG text chunks, thumbnails, or source encoder metadata.
                with ImageOps.exif_transpose(image) as oriented:
                    with oriented.convert(mode) as pixels:
                        with Image.new(mode, pixels.size) as clean:
                            clean.paste(pixels)
                            output = BytesIO()
                            clean.save(output, format='PNG')
                            return output.getvalue(), clean.width, clean.height
    except IntakeError:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise IntakeError('pixel_limit') from None
    except Exception:
        # Plugin, verify, header, EXIF and codec errors may embed source content.
        raise IntakeError('invalid_image') from None


def _parse_manifest(raw):
    text = _checked_text(raw)
    try:
        obj = policy.strict_json(text)
    except (ValueError, RecursionError):
        raise IntakeError('invalid_manifest') from None
    if (
        not isinstance(obj, dict) or set(obj) != _MANIFEST_KEYS
        or type(obj['version']) is not int or obj['version'] != 1
        or not _matches(obj['task_id'], _LABEL) or not _matches(obj['round_id'], _LABEL)
        or not _matches(obj['source_sha'], _SHA1)
        or not isinstance(obj['brief'], str) or not obj['brief'].strip()
        or not isinstance(obj['context'], list)
        or not isinstance(obj['images'], list) or not obj['images']
    ):
        raise IntakeError('invalid_manifest')
    try:
        # Re-screen the decoded inline brief: JSON can escape control characters
        # and split recognizable strings in the original serialized manifest.
        _checked_text(obj['brief'].encode('utf-8'))
    except UnicodeError:
        raise IntakeError('text_rejected') from None

    labels = set()
    paths = {'manifest.json'}
    for kind in ('context', 'images'):
        required = _ATTACHMENT_KEYS | ({'mime_type'} if kind == 'images' else set())
        for item in obj[kind]:
            if (
                not isinstance(item, dict) or set(item) != required
                or not _matches(item['label'], _LABEL)
                or not _matches(item['sha256'], _SHA256)
                or not _matches(item['source_sha'], _SHA1)
                or (kind == 'images' and (
                    not isinstance(item['mime_type'], str) or item['mime_type'] not in _IMAGE_FORMATS
                ))
            ):
                raise IntakeError('invalid_manifest')
            _parts(item['path'])
            # Casefold also keeps names unambiguous on case-insensitive volumes.
            label, path = item['label'].lower(), item['path'].lower()
            if label in labels or path in paths:
                raise IntakeError('duplicate_attachment')
            labels.add(label)
            paths.add(path)
    return obj


def load_package(directory, manifest_sha256, max_raw_file_bytes, max_pixels, max_total_raw_bytes=None) -> Package:
    """Load approved files only; never open a network connection.

    max_raw_file_bytes applies to every source file incl. manifest; max_pixels
    applies to the total decoded area of all images. max_total_raw_bytes bounds
    all original attachment bytes, excluding the separately bounded manifest;
    if not specified it conservatively equals max_raw_file_bytes. The caller
    also bounds the serialized outbound request. Every attachment source SHA
    is separately pinned and may differ from the target's revision.
    """
    if not _matches(manifest_sha256, _SHA256):
        raise IntakeError('invalid_manifest_hash')
    if max_total_raw_bytes is None:
        max_total_raw_bytes = max_raw_file_bytes
    if any(type(limit) is not int or limit <= 0 for limit in (max_raw_file_bytes, max_pixels, max_total_raw_bytes)):
        raise IntakeError('invalid_limits')
    with _open_directory(directory) as root_fd:
        raw_manifest = _read_file(root_fd, 'manifest.json', manifest_sha256, max_raw_file_bytes)
        manifest = _parse_manifest(raw_manifest)
        raw_bytes = 0
        pixels = 0
        context = []
        images = []
        for item in manifest['context']:
            raw = _read_file(
                root_fd, item['path'], item['sha256'], max_raw_file_bytes, max_total_raw_bytes - raw_bytes,
            )
            context.append(TextAttachment(**item, text=_checked_text(raw)))
            raw_bytes += len(raw)
        for item in manifest['images']:
            raw = _read_file(
                root_fd, item['path'], item['sha256'], max_raw_file_bytes, max_total_raw_bytes - raw_bytes,
            )
            image, width, height = _canonical_image(raw, item['mime_type'], max_pixels - pixels)
            images.append(ImageAttachment(
                item['label'], item['path'], item['sha256'], item['source_sha'],
                'image/png', image, width, height,
            ))
            raw_bytes += len(raw)
            pixels += width * height
        return Package(
            manifest['task_id'], manifest['round_id'], manifest['source_sha'], manifest['brief'],
            tuple(context), tuple(images), PackageMetadata(manifest_sha256, raw_bytes, pixels),
        )
