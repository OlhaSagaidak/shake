"""Send a dog photo to the deployed backend and print the answer and timings.

Usage: backend/.venv/bin/python backend/test_call.py <backend-url> <photo.jpg> [runs]
"""

import base64
import json
import sys
import time
import urllib.request

url, photo = sys.argv[1].rstrip("/"), sys.argv[2]
runs = int(sys.argv[3]) if len(sys.argv) > 3 else 3

with open(photo, "rb") as f:
    body = json.dumps({"image_base64": base64.b64encode(f.read()).decode()}).encode()

for i in range(runs):
    start = time.perf_counter()
    req = urllib.request.Request(f"{url}/analyze", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.load(resp)
    total = round((time.perf_counter() - start) * 1000)
    print(f"run {i + 1}: total {total} ms, model {data['model_ms']} ms")
    print(f"  {data['answer']}")
