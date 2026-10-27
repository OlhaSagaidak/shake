# Progress

## Milestone 1 — Setup (in progress, Oct 26)

### Done
- Expo app in `app/` (SDK 58, TypeScript) set up for iOS, Android and web. Typecheck, `expo-doctor` and web export all pass.
- Test screen (`app/App.tsx`): take or choose a dog photo → POST to backend `/analyze` → shows the answer, round-trip time and model time.
- Backend `backend/app.py`: FastAPI on Modal (0.25 CPU, scales to zero after 2 idle min). It calls Muse Spark Open on a **Modal Shared Endpoint** (OpenAI-compatible, billed per token).
  - The model ID lives in one constant, `MUSE_SPARK_MODEL` = `meta-models/muse-spark-open-1026`, overridable via the secret.
  - It reads `MUSE_ENDPOINT_URL` and `MUSE_PROXY_TOKEN` from the Modal secret `shake-muse`.
- `backend/test_call.py`: latency test from the laptop.
- Python 3.12 (Homebrew) + venv at `backend/.venv` with the `modal` CLI.

### Notes
- Muse Spark Open is 816B parameters (42B active). Self-hosting it on Modal GPUs isn't realistic with $100 of credits, so we use Modal's managed Shared Endpoint instead. It still runs on Modal, which keeps the open-weight bonus prize story.

### Waiting on Olya
- Modal account + `modal token new`, Shared Endpoint for Muse Spark Open, proxy token, secret `shake-muse`.

### Next
- `modal deploy backend/app.py`, run `test_call.py` with a dog photo, record response times here.
- Put the backend URL in `app/.env`, then run in Expo Go on Olya's phone.

### Response times
- (not measured yet)
