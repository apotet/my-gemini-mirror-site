"""Single synthetic Hydrogen request; no repository content is transmitted."""
import itertools
import json
import os
import signal
import urllib.error
import urllib.request

NAMES = ("S", "A", "B", "C", "D", "E", "F")
MATRIX = (
    (0, 8, 7, 9, 10, 6, 12),
    (8, 0, 5, 11, 7, 9, 8),
    (7, 5, 0, 6, 13, 8, 9),
    (9, 11, 6, 0, 8, 5, 6),
    (10, 7, 13, 8, 0, 12, 4),
    (6, 9, 8, 5, 12, 0, 7),
    (12, 8, 9, 6, 4, 7, 0),
)
PROMPT = (
    "Solve this fictional optimization problem exactly. Seven locations are "
    "S,A,B,C,D,E,F. The symmetric distance matrix in that order is "
    + json.dumps(MATRIX, separators=(",", ":"))
    + ". Start and end at S, visit each other location exactly once, visit B "
    "before C, and do not travel directly between D and E in either direction. "
    "Minimize total distance. Return only a JSON object with fields route "
    "(array including S at both ends) and total (integer)."
)


def verify(answer):
    if not isinstance(answer, dict) or set(answer) != {"route", "total"}:
        return False
    route, total = answer["route"], answer["total"]
    if (not isinstance(route, list) or len(route) != 8 or route[0] != "S" or
        route[-1] != "S" or sorted(route[1:-1]) != sorted(NAMES[1:]) or
        type(total) is not int):
        return False
    indices = [NAMES.index(name) for name in route]
    if (indices.index(2) > indices.index(3) or
        any({a, b} == {4, 5} for a, b in zip(indices, indices[1:]))):
        return False
    cost = sum(MATRIX[a][b] for a, b in zip(indices, indices[1:]))
    feasible = []
    for middle in itertools.permutations(range(1, 7)):
        if middle.index(2) > middle.index(3):
            continue
        candidate = (0, *middle, 0)
        if any({a, b} == {4, 5} for a, b in zip(candidate, candidate[1:])):
            continue
        feasible.append(sum(MATRIX[a][b] for a, b in zip(candidate, candidate[1:])))
    return total == cost == min(feasible)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, "Redirect forbidden", headers, fp)


def deadline(_signum, _frame):
    raise TimeoutError("Request deadline exceeded")


def main():
    key = os.environ.get("HYDROGEN_KEY", "")
    if not key:
        raise ValueError("Missing Hydrogen credential")
    data = json.dumps({
        "contents": [{"role": "user", "parts": [{"text": PROMPT}]}],
        "generationConfig": {"maxOutputTokens": 2048},
    }).encode()
    if len(data) > 4096:
        raise ValueError("Synthetic request too large")
    req = urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent",
        data=data, method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    signal.signal(signal.SIGALRM, deadline)
    signal.setitimer(signal.ITIMER_REAL, 60)
    try:
        with urllib.request.build_opener(NoRedirect).open(req, timeout=60) as response:
            raw = response.read(65537)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
    if len(raw) > 65536:
        raise ValueError("Response too large")
    result = json.loads(raw)
    usage = result.get("usageMetadata", {})
    if not isinstance(usage, dict):
        usage = {}
    safe_usage = {k: v for k, v in usage.items()
                  if k in ("promptTokenCount", "candidatesTokenCount",
                           "thoughtsTokenCount", "totalTokenCount") and type(v) is int and v >= 0}
    print(json.dumps({"calls": 1, "usage": safe_usage}))
    candidates = result.get("candidates")
    if not isinstance(candidates, list) or len(candidates) != 1:
        raise ValueError("Missing or ambiguous candidate")
    candidate = candidates[0]
    if candidate.get("finishReason") != "STOP":
        raise ValueError("Incomplete response")
    parts = candidate.get("content", {}).get("parts", [])
    if not isinstance(parts, list):
        raise ValueError("Invalid response parts")
    text = "".join(p.get("text", "") for p in parts
                   if isinstance(p, dict) and not p.get("thought") and isinstance(p.get("text"), str))
    answer = json.loads(text)
    if not verify(answer):
        raise ValueError("Incorrect or invalid solution")
    print(json.dumps({"result": "PASS", "route": answer["route"], "total": answer["total"]}))


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as exc:
        print(json.dumps({"result": "FAIL", "http_status": exc.code, "retry": False}))
        raise SystemExit(1) from None
    except Exception as exc:
        print(json.dumps({"result": "FAIL", "error_type": type(exc).__name__, "retry": False}))
        raise SystemExit(1) from None
