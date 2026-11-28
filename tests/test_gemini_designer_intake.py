"""Offline designer attachment intake checks; only benign generated fixtures."""

import copy
import hashlib
import json
from io import BytesIO
import os
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.github'))
from agent_runtime import designer_intake

try:
    from PIL import Image, ImageFile, ImageOps, PngImagePlugin
except ImportError:
    Image = None


def sha256(data):
    return hashlib.sha256(data).hexdigest()


@unittest.skipUnless(Image is not None, 'vetted Pillow is an optional designer intake runtime dependency')
class DesignerIntake(unittest.TestCase):
    FILE_LIMIT = 64 * 1024
    PIXEL_LIMIT = 1000

    def setUp(self):
        self.temp = TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'approved-package'
        self.root.mkdir()
        (self.root / 'attachments').mkdir()
        self.target = 'a' * 40
        self.exemplar = 'b' * 40
        self.text = 'Typography sample: line spacing and stanza breaks.'
        self.png = self.sample_png()
        self.context = self.file('attachments/layout.txt', self.text.encode(), 'layout-notes', self.target)
        self.mobile = self.file('attachments/mobile.png', self.png, 'mobile-light', self.exemplar, 'image/png')
        self.manifest = {
            'version': 1,
            'task_id': 'tcpip-design',
            'round_id': 'round-1',
            'source_sha': self.target,
            'brief': 'Compare the breathing room of the pictured headings.',
            'context': [self.context],
            'images': [self.mobile],
        }

    def sample_png(self):
        with Image.new('RGBA', (12, 8), (12, 34, 56, 190)) as image:
            image.putpixel((0, 0), (99, 20, 47, 255))
            t = PngImagePlugin.PngInfo()
            t.add_text('Description', 'Benign source note, not included with pixels.')
            buf = BytesIO()
            image.save(buf, 'PNG', pnginfo=t, dpi=(150, 150))
            return buf.getvalue()

    def file(self, path, content, label, source, mime_type=None):
        (self.root / path).write_bytes(content)
        entry = {'path': path, 'label': label, 'source_sha': source, 'sha256': sha256(content)}
        if mime_type:
            entry['mime_type'] = mime_type
        return entry

    def manifest_digest(self, candidate=None, raw=None):
        data = raw if raw is not None else json.dumps(self.manifest if candidate is None else candidate, ensure_ascii=False).encode()
        (self.root / 'manifest.json').write_bytes(data)
        return sha256(data)

    def load(self, digest=None, max_bytes=FILE_LIMIT, max_pixels=PIXEL_LIMIT, directory=None, max_total=None):
        pin = self.manifest_digest() if digest is None else digest
        return designer_intake.load_package(self.root if directory is None else directory, pin, max_bytes, max_pixels, max_total)

    def fails(self, code, *args, **kwargs):
        with self.assertRaises(designer_intake.IntakeError) as caught:
            self.load(*args, **kwargs)
        self.assertEqual(caught.exception.code, code)
        self.assertEqual(str(caught.exception), code)
        self.assertEqual(repr(caught.exception), f'IntakeError({code!r})')

    def test_preserves_pixels_and_provenance_without_metadata_or_loggable_inputs(self):
        pin = self.manifest_digest()
        package = self.load(pin)
        self.assertEqual(package.source_sha, self.target)
        self.assertEqual(package.brief, self.manifest['brief'])
        self.assertEqual(package.task_id, 'tcpip-design')
        self.assertEqual(package.round_id, 'round-1')
        self.assertEqual(package.context[0].text, self.text)
        self.assertEqual(package.context[0].label, 'layout-notes')
        image = package.images[0]
        self.assertEqual(image.label, 'mobile-light')
        self.assertEqual(image.source_sha, self.exemplar, 'exemplar and target can differ')
        self.assertEqual(image.sha256, sha256(self.png), 'the approval pins the original bytes')
        self.assertEqual(image.mime_type, 'image/png')
        self.assertEqual((image.width, image.height), (12, 8))
        self.assertEqual(package.metadata.manifest_sha256, pin)
        self.assertEqual(package.metadata.pixels, 96)
        self.assertEqual(package.metadata.raw_bytes, len(self.png) + len(self.text.encode()))
        with Image.open(BytesIO(self.png)) as orig, Image.open(BytesIO(image.data)) as clean:
            self.assertEqual(clean.format, 'PNG')
            self.assertFalse(clean.info, 'source note and DPI should be removed')
            self.assertNotEqual(orig.info, clean.info)
            self.assertEqual(orig.tobytes(), clean.tobytes())
        rendered = repr(package)
        for private in [self.text, self.manifest['brief'], 'attachments/layout.txt', 'mobile-light', 'tcpip-design', 'round-1', 'PNG\r']:
            self.assertNotIn(private, rendered)
        self.assertEqual(self.load(pin).images[0].data, image.data, 'canonical bytes should be reproducible')

    def test_normal_jpeg_becomes_a_metadata_free_png(self):
        out = BytesIO()
        with Image.new('RGB', (8, 7), (30, 160, 70)) as jpg:
            jpg.save(out, 'JPEG', dpi=(160, 160))
        data = out.getvalue()
        self.manifest['images'] = [self.file('attachments/card.jpg', data, 'desktop-dark', self.target, 'image/jpeg')]
        result = self.load().images[0]
        self.assertEqual((result.width, result.height), (8, 7))
        with Image.open(BytesIO(data)) as orig, Image.open(BytesIO(result.data)) as clean:
            self.assertEqual(clean.format, 'PNG')
            self.assertFalse(clean.info)
            self.assertEqual(clean.tobytes(), orig.tobytes())

    def test_manifest_and_each_file_are_checked_against_pinned_raw_bytes(self):
        digest = self.manifest_digest()
        self.fails('invalid_manifest_hash', 'not-sha256')
        self.fails('file_hash_mismatch', '0' * 64)
        (self.root / self.context['path']).write_text('A different harmless example.')
        self.fails('file_hash_mismatch', digest)
        (self.root / self.context['path']).write_text(self.text)
        (self.root / self.mobile['path']).write_bytes(self.png + b'extra benign data')
        self.fails('file_hash_mismatch', digest)
        self.fails('file_size_limit', digest, max_bytes=16)
        self.fails('invalid_limits', digest, max_pixels=True)

    def test_strict_schema_each_label_and_source(self):
        valid = self.manifest_digest()
        self.assertEqual(self.load(valid).images[0].source_sha, self.exemplar)
        for changed in ['version', 'label', 'source_sha', 'mime_type', 'unknown', 'empty images']:
            candidate = copy.deepcopy(self.manifest)
            image = candidate['images'][0]
            if changed == 'version':
                candidate[changed] = True
            elif changed == 'label':
                image[changed] = 'arbitrary title with a space'
            elif changed == 'source_sha':
                image[changed] = 'a' * 39
            elif changed == 'mime_type':
                image[changed] = 'image/webp'
            elif changed == 'unknown':
                candidate[changed] = {}
            else:
                candidate['images'] = []
            with self.subTest(changed=changed):
                self.fails('invalid_manifest', self.manifest_digest(candidate))
        dup = copy.deepcopy(self.manifest)
        dup['images'][0]['label'] = self.context['label'].upper()
        self.fails('duplicate_attachment', self.manifest_digest(dup))
        self.fails('invalid_manifest', self.manifest_digest(raw=b'{"version": 1, "version": 1}'))

    def test_no_unpinned_directory_or_nonregular_attachment_can_be_opened(self):
        digest = self.manifest_digest()
        parent = self.root.parent
        symlink = parent / 'linked-package'
        symlink.symlink_to(self.root, target_is_directory=True)
        self.fails('invalid_package_directory', digest, directory=symlink)
        path = self.root / self.mobile['path']
        old = path.with_name('real-mobile.png')
        path.rename(old)
        path.symlink_to(old)
        self.fails('invalid_attachment_file', digest)
        path.unlink()
        os.link(old, path)
        self.fails('invalid_attachment_file', digest)
        path.unlink()
        os.mkfifo(path)
        self.fails('invalid_attachment_file', digest)
        path.unlink()
        (self.root / 'attachments').rename(self.root / 'real-attachments')
        (self.root / 'attachments').symlink_to(self.root / 'real-attachments', target_is_directory=True)
        self.fails('invalid_attachment_file', digest)
        candidate = copy.deepcopy(self.manifest)
        candidate['images'][0]['path'] = 'attachments//mobile.png'
        self.fails('invalid_path', self.manifest_digest(candidate))

    def test_rejects_opaque_text_controls_and_a_screening_refusal_without_echo(self):
        broken = copy.deepcopy(self.manifest)
        broken['brief'] = 'Friendly note with a control character: \x01'
        self.fails('text_rejected', self.manifest_digest(broken))
        self.manifest['context'] = [self.file('attachments/layout.txt', b'\xff', 'layout-notes', self.target)]
        self.fails('text_rejected')
        self.manifest['context'] = [self.file('attachments/layout.txt', self.text.encode(), 'layout-notes', self.target)]
        safe_value = designer_intake.policy.safe_value
        def vet(text):
            if text == self.text:
                raise ValueError('IRRELEVANT ENGINE DIAGNOSTIC')
            return safe_value(text)
        with patch.object(designer_intake.policy, 'safe_value', vet):
            self.fails('text_rejected')

    def test_checks_real_format_complete_decode_and_total_pixels(self):
        self.fails('pixel_limit', max_pixels=95)
        extra = self.file('attachments/wide.png', self.png, 'desktop-light', self.target, 'image/png')
        self.manifest['images'].append(extra)
        self.fails('pixel_limit', max_pixels=180)
        self.assertEqual(self.load(max_pixels=192).metadata.pixels, 192)
        self.manifest['images'] = [self.file('attachments/bad.png', self.png[:35], 'mobile-light', self.target, 'image/png')]
        self.fails('invalid_image')
        self.manifest['images'] = [self.file('attachments/card.jpg', self.png, 'mobile-light', self.target, 'image/jpeg')]
        self.fails('invalid_image')

    def test_image_edge_cases_do_not_change_or_accept_unbounded_pixels(self):
        out = BytesIO()
        with Image.new('I;16', (8, 7), 40000) as deep_png:
            deep_png.save(out, 'PNG')
        self.manifest['images'] = [self.file('attachments/deep.png', out.getvalue(),
                                            'mobile-light', self.target, 'image/png')]
        self.fails('unsupported_image_encoding')

        out = BytesIO()
        with Image.new('RGBA', (8, 7), (30, 160, 70, 255)) as a, Image.new('RGBA', (8, 7), (31, 23, 55, 255)) as b:
            a.save(out, 'PNG', save_all=True, append_images=[b], duration=200)
        self.manifest['images'] = [self.file('attachments/motion.png', out.getvalue(),
                                            'mobile-light', self.target, 'image/png')]
        self.fails('invalid_image')

    def test_exif_orientation_is_kept_as_pixels_only(self):
        out = BytesIO()
        with Image.new('RGB', (8, 7), (30, 160, 70)) as jpg:
            jpg.putpixel((0, 0), (250, 20, 90))
            exif = jpg.getexif()
            exif[274] = 6
            jpg.save(out, 'JPEG', exif=exif)
        raw = out.getvalue()
        self.manifest['images'] = [self.file('attachments/rotated.jpg', raw, 'mobile-light', self.target, 'image/jpeg')]
        result = self.load().images[0]
        self.assertEqual((result.width, result.height), (7, 8))
        with Image.open(BytesIO(raw)) as orig, Image.open(BytesIO(result.data)) as clean:
            self.assertFalse(clean.info)
            self.assertEqual(ImageOps.exif_transpose(orig).tobytes(), clean.tobytes())

    def test_size_limit_also_applies_to_each_attachment(self):
        self.manifest['context'] = [self.file('attachments/layout.txt', b'a' * 16384, 'layout-notes', self.target)]
        digest = self.manifest_digest()
        manifest_size = (self.root / 'manifest.json').stat().st_size
        self.fails('file_size_limit', digest, max_bytes=manifest_size)

    def test_cumulative_attachment_limit_is_checked_before_decoding_unapproved_excess(self):
        text_bytes = len(self.text.encode())
        png_bytes = len(self.png)
        expected_total = text_bytes + png_bytes
        self.assertEqual(self.load(max_total=expected_total).metadata.raw_bytes, expected_total)
        with patch.object(designer_intake, '_canonical_image') as decode:
            self.fails('total_raw_limit', max_total=expected_total - 1)
            decode.assert_not_called()
        self.manifest['context'] = [
            self.file('attachments/layout.txt', b'a' * 5000, 'layout-notes', self.target),
            self.file('attachments/colors.txt', b'b' * 5000, 'colors', self.target),
        ]
        self.fails('total_raw_limit', max_bytes=8192)  # no explicit aggregate limit
        self.assertEqual(self.load(max_bytes=8192, max_total=12000).metadata.raw_bytes, 10000 + png_bytes)

    def test_missing_image_decoder_is_a_closed_gate(self):
        digest = self.manifest_digest()
        with patch.dict(sys.modules, {'PIL': None}):
            self.fails('image_decoder_unavailable', digest)
        with patch.object(ImageFile, 'LOAD_TRUNCATED_IMAGES', True):
            self.fails('image_decoder_unavailable', digest)


if __name__ == '__main__':
    unittest.main()
