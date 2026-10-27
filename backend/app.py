"""Shake backend: FastAPI on Modal, calling Muse Spark Open on a Modal Shared Endpoint.

Deploy:  modal deploy backend/app.py
Dev:     modal serve backend/app.py
"""

import os
import time

import modal

# The one place the model ID lives. Override with MUSE_SPARK_MODEL in the Modal secret.
MUSE_SPARK_MODEL = os.environ.get("MUSE_SPARK_MODEL", "meta-models/muse-spark-open-1026")

# Modal secret holding MUSE_ENDPOINT_URL (Shared Endpoint base URL, no /v1)
# and MUSE_PROXY_TOKEN ("wk-<id>.ws-<secret>").
SECRET_NAME = "shake-muse"

image = modal.Image.debian_slim(python_version="3.12").pip_install("fastapi[standard]", "openai")
app = modal.App("shake-backend", image=image)

with image.imports():
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from openai import OpenAI
    from pydantic import BaseModel

DOG_PROMPT = (
    "You are Shake, a friendly dog-training coach. Look at this photo. "
    "Is there a dog? If so, describe its posture (sitting, lying down, standing, other) "
    "and where it is looking, in two short sentences."
)


@app.function(
    secrets=[modal.Secret.from_name(SECRET_NAME)],
    cpu=0.25,
    memory=256,
    scaledown_window=120,  # scale to zero after 2 idle minutes
)
@modal.asgi_app()
def api():
    class AnalyzeRequest(BaseModel):
        image_base64: str
        mime_type: str = "image/jpeg"
        prompt: str | None = None

    web = FastAPI(title="Shake backend")
    web.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

    client = OpenAI(
        base_url=os.environ["MUSE_ENDPOINT_URL"].rstrip("/") + "/v1",
        api_key=os.environ["MUSE_PROXY_TOKEN"],
    )

    @web.get("/health")
    def health():
        return {"ok": True, "model": MUSE_SPARK_MODEL}

    @web.post("/analyze")
    def analyze(req: AnalyzeRequest):
        start = time.perf_counter()
        try:
            resp = client.chat.completions.create(
                model=MUSE_SPARK_MODEL,
                max_tokens=150,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": req.prompt or DOG_PROMPT},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:{req.mime_type};base64,{req.image_base64}"},
                            },
                        ],
                    }
                ],
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Model call failed: {e}")
        return {
            "answer": resp.choices[0].message.content,
            "model": MUSE_SPARK_MODEL,
            "model_ms": round((time.perf_counter() - start) * 1000),
        }

    return web
