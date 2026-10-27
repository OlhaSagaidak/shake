# Shake — AI Dog Training Coach

## ⚠️ Rules that always apply (read first)

### Payments: only Olya pays for anything
- **Never make any payment of any kind.** No purchases, subscriptions, plan upgrades, paid tiers, top-ups, domain registrations, app store fees, or paid API plans.
- **Never enter payment details** (card numbers, billing info) anywhere, and never create accounts that require them.
- **Never add a paid service, paid API key, or paid dependency** without asking first.
- **If something needs to be paid for:** stop that part of the work and tell Olya:
  1. what needs to be paid for,
  2. why it's needed,
  3. the cost, if known,
  4. any free alternatives.
  Then wait. Olya decides what to do and makes any payment herself.
- **Hackathon credits count as money.** The $150 Meta Model API credits are the project's only AI budget and last only for the 10-day window. Ask before anything that would use a lot of them (batch jobs, long loops, load tests). Normal small test calls during development are fine.
- **No Modal, Baseten, or Fireworks.** Olya decided on a $0 setup with no payment card anywhere. Modal requires a card on file, and Muse Spark Open on Modal is billed per token. Don't create accounts, endpoints, or deployments on any of them.

### Token and usage limits: pause, don't pay
- If you reach a usage or token limit, **pause the work.** Do not buy extra usage, switch to paid overage, or continue in any way that adds charges beyond the plan.
- Before pausing, leave a short note in `PROGRESS.md`: what's done, what's in progress, and the next step, so work can resume cleanly after the limit resets.
- Keep work efficient: avoid re-reading large files unnecessarily and don't run long, repeated loops without need.

## Project overview

Shake is a mobile app for the Meta Global AI Developer Hackathon (Oct 26 – Nov 4, 2026; submissions due Nov 4, 9:00 PM ET). It runs a normal dog training session while an AI coach watches and listens live: it hears the owner's cue, watches the dog, marks success (click or "Yes!"), says when to give a treat, gives tips, and answers questions mid-session.

The full product plan lives in the "Shake — Product Plan" doc. Key points:

- **Dog profiles:** one per dog. Only the name is required. Optional: photo, age, breed/size, energy level, favorite rewards, quirks, fears or triggers, history, physical limits, known words.
- **10 commands:** Watch me, Sit, Down, Stay, Come, Touch, Leave it, Drop it, Place, Paw.
- **Custom cue words:** each command has a default word; the owner can set their own per dog (e.g. "Spit it out" for Drop it). Warn when two cues sound alike.
- **Progress:** 5 levels per command (Learning, Fading the lure, Verbal cue, Duration and distance, Mastered). Move up at 80%+ success over the last two sessions with 10+ attempts; move down under 50%. After Mastered, offer short reinforcement sessions; "refresh due" after 14 days without practice.
- **Session length:** recommended 15 min (under 6 months), 25 min (6 months to 7 years), 20 min (8+ years). Custom length allowed, hard cap 25 min. Warn at 1 minute left; end early on fatigue signs; always end on an easy success.
- **Briefing before each session:** what to say, how long to wait, what to look for, keep the dog fully in frame, keep the room quiet, how the coach helps.
- **Mid-session Q&A:** wake word "Coach" or an "Ask coach" button; pause the trial timer while answering.
- **Positive reinforcement only.** No corrections or punishment.

## Architecture

> ⚠️ **Model ID:** The Meta docs use `meta-models/muse-spark-open`. For this hackathon, always use **`meta-models/muse-spark-open-1026`** instead. Keep the model ID in one config constant (e.g. `MUSE_SPARK_MODEL` in `.env` / config), never hard-coded in multiple places, and replace the docs' ID whenever copying example code.

- **Fast path (under 1 second):** on-device speech recognition for this dog's cue words, wake word, and release word; SAM 3.1 to segment and track the dog; marker sound played locally.
- **Slow path (1–3 seconds):** Muse Spark Open confirms behavior, judges quality, spots fatigue, writes tips, answers questions, writes session summaries.
- **Muse Image:** illustrated dog avatar and level-up badges.

### Hosting: $0, no payment card (decided)
- **All AI runs through the Meta Model API** on Olya's $150 hackathon credits:
  - **Muse Spark** (model ID from config, see above): behavior confirmation from camera frames, fatigue, tips, Q&A, summaries
  - **SAM 3.1:** dog segmentation/tracking (unless a lightweight on-device method is fast enough)
  - **Muse Image:** dog avatar and level-up badges
- **Confirm on day 1** that `meta-models/muse-spark-open-1026` works through the Meta Model API with Olya's credits. If it doesn't, tell Olya and use the Muse Spark model the API offers.
- **Keep the API key secret.** Never put it in the app code. Calls go through a small backend proxy that holds the key.
- **Backend proxy and web hosting:** use a free host that **does not require a payment card** (for example Vercel, Netlify, or Cloudflare free plans, with serverless functions for the proxy). Before creating any account or deploying, confirm the free plan needs no card. If it does, stop and ask Olya.
- **Save credits:** send Muse Spark only 2–3 frames per trial, never a continuous video stream; keep prompts short; cache nothing that isn't needed. Log credits used per session in `PROGRESS.md` so Olya can see the burn rate.
- **Stack:** React Native (Expo) app, local on-device database for profiles and history, on-device speech recognition and text-to-speech, small serverless proxy (Python or TypeScript, whichever the free host supports best) calling the Meta Model API.

### Platforms and distribution (mobile + web)
- **Set up the Expo project for iOS, Android, and web from day 1.** Choose libraries that work on all three (camera, mic, speech recognition, text-to-speech, local storage), or put platform-specific code behind one shared interface. Flag any feature that can't work on web.
- **Web version is the main "try it" link** for judges, Community Vote, and Most Viral. It must run in phone browsers (iOS Safari and Android Chrome) with camera and mic access over HTTPS. Host it on the same free, no-card host as the backend proxy.
- **Android:** build an installable APK for direct download as a bonus option. Do not publish to the Google Play Store.
- **iOS:** use the free Expo Go app for Olya's own testing. **Do not set up TestFlight, the App Store, or anything that needs a paid Apple Developer account** — that's a payment decision for Olya (see payment rules above).
- Use free tiers only for building and hosting. If any build or hosting step requires payment or a paid plan, stop and ask Olya.
- Before submission: test the web link on an iPhone and an Android phone, and put the web link and APK link in the README.
- **Privacy:** video stays on device by default; frames sent for analysis are not stored.
- **Demo mode:** run the full pipeline on a pre-recorded clip as a backup for live judging.

## Build plan — everything ready by Nov 2

**Deadline:** the app is finished, deployed, and tested by **end of day Nov 2**. Nov 3 is for recording the demo video; Nov 4 is for submitting early and posting on X. No new features after Nov 2.

**How to work through the plan:**
- Do milestones in order. Don't start the next one until the current one meets its "Done when" check.
- **At the end of each milestone, stop and ask Olya to test it.** Continue only after she confirms.
- Update `PROGRESS.md` after each milestone: what works, what doesn't, what's next.
- If a milestone is running more than half a day late, tell Olya and suggest what to cut. Cutting scope is better than missing Nov 2.
- **Priority commands:** Sit, Down, and Watch me must work flawlessly. The other 7 use the same pipeline and are added only once these three are solid.

### Milestone 1 — Setup (Oct 27)
1. Create the Expo (React Native) project with iOS, Android, and web targets; confirm it runs in Expo Go on Olya's phone and in a web browser.
2. Set up the repo: `.gitignore` (including `.env`), `README.md` stub, `PROGRESS.md`, and a config file holding `MUSE_SPARK_MODEL=meta-models/muse-spark-open-1026`.
3. Ask Olya to claim the Meta Model API credits and put the API key in `.env` herself. Confirm the model ID works with her credits.
4. Pick the free, no-card host (confirm no card is needed) and ask Olya to create the account herself.
5. Create the backend proxy with a `/health` endpoint and an `/analyze` endpoint that takes an image and a question and calls Muse Spark through the Meta Model API. Deploy it.
6. Test: send one dog photo with "Is this dog sitting, lying down, or standing?" and log the answer and response time.
7. Connect the app: a temporary test screen that takes a photo and shows the backend's answer.
8. Write results (response time, any problems) in `PROGRESS.md`. **Stop and ask Olya to test.**
- **Done when:** the app on Olya's phone (Expo Go) sends a photo to the backend and shows the model's answer, and the response time is written in `PROGRESS.md`.

### Milestone 2 — Core loop (Oct 28–29)
1. Live camera screen with frame access (works on mobile and web).
2. On-device speech recognition listening only for the cue words "Sit," "Down," and "Watch me." Show the detected word on screen for testing.
3. Marker: a click sound and a recorded "Yes!" that play locally with no network delay.
4. Fast path: dog tracking (SAM 3.1 or a lightweight on-device method; test both if time allows) and a simple rule that flags a likely sit from the dog's shape.
5. Slow path: send 2–3 frames plus trial context to Muse Spark (Meta Model API, through the proxy) to confirm the behavior and judge quality. Send a quick warm-up request when the session starts.
6. Trial loop: cue heard → response window (Sit 3 s) → success plays marker + "Treat now," miss stays silent → 3-second reset.
7. Measure latency from behavior to click; show it on screen and log it in `PROGRESS.md`. If it's over about 1 second, tune the fast path before moving on.
8. Repeat steps 4–7 for Down (5 s window) and Watch me (2 s window).
9. **Stop and ask Olya to test** with a real dog.
- **Done when:** a real dog sits after "Sit" and the click plays within about 1 second, on Olya's phone, several times in a row. Latency is measured and recorded.

### Milestone 3 — Dog profiles (Oct 30)
1. Local database (SQLite on mobile, browser storage on web) behind one shared data layer.
2. Data model: dogs, profile fields, cue words per command, progress per command, sessions and trial results.
3. "My dogs" screen: dog cards with photo, name, overall progress, and a "+" button.
4. Add/edit dog screen: name (required), photo, then "More details" for age, breed/size, energy level, favorite rewards, quirks, fears or triggers, history, physical limits, known words.
5. Custom cue words: default word per command, owner can replace it; owner says it 3 times to test recognition.
6. Look-alike warning when two cue words, the dog's name, or the release word sound similar.
7. Pass the dog's profile and cue words into the coaching prompts and speech recognition.
8. **Stop and ask Olya to test.**
- **Done when:** Olya can add two dogs with different cue words, close the app, reopen it, and everything is still there.

### Milestone 4 — Training flow (Oct 31)
1. Dog home: grid of the 10 commands, each with a 5-step progress bar, level name, and badges ("Refresh due," "Keep it fresh"); "Suggested next" tile on top.
2. Command detail: cue word, level, success rate per session (small chart), tips for this level, "Start session."
3. Session briefing: on-screen text read aloud with text-to-speech; full version the first time, a short reminder afterward with "Show full."
4. One-time click intro (10 clicks + treats) before the dog's first session.
5. Camera check: frame overlay that turns green when the dog is fully visible, background noise meter, tip about phone height.
6. Session timer: recommended length by age (15 / 25 / 20 min), custom length up to 25 min, 1-minute warning, end on an easy command.
7. Session summary: attempts, success rate, repeated cues, level change, one tip, when to practice again.
8. Progress rules: up at 80%+ over the last two sessions with 10+ attempts, down under 50%; reinforcement mode after Mastered, with "refresh due" after 14 days.
9. **Stop and ask Olya to test.**
- **Done when:** Olya can run a full session from dog home to summary, and progress updates correctly.

### Milestone 5 — Smart coaching (Nov 1)
1. Structure the coach as an agent with tools: `play_marker`, `say_tip`, `change_level`, `end_session`, `update_progress`. Log each tool call for the debug overlay (Best Agentic Use-Case bonus prize).
2. Repeated cues: count repeats per trial; tip after 2 repeats in one trial or repeats in 3 trials; flag when the owner switches words.
3. Struggling: tip after 2 misses in a row; "Let's make it easier" and a temporary level drop after 3.
4. Fatigue: detect yawning, sniffing the floor, looking away, lying down without a cue, heavy panting, slower responses; 2+ signs → suggest two easy reps and end.
5. Q&A: "Coach" wake word and "Ask coach" button; pause the trial timer; short answers using the profile and session stats; health or pain questions → suggest stopping and seeing a vet.
6. Test each behavior on purpose (repeat a cue, miss on purpose, ask a question) and fix what fails.
7. **Stop and ask Olya to test.**
- **Done when:** each behavior can be triggered on purpose in a test session and responds correctly.

### Milestone 6 — Ship it (Nov 2)
1. Deploy the web version on free hosting with HTTPS; confirm camera and mic work in iOS Safari and Android Chrome.
2. Build the Android APK and create a download link.
3. Demo mode: run a pre-recorded clip through the real pipeline (backup for live judging).
4. Debug overlay toggle: shows dog tracking, model reasoning, agent tool calls, and latency (for the demo video).
5. README: what Shake is, how to try it (web link, APK link), architecture, Meta tools used (Muse Spark, SAM 3.1, Muse Image via the Meta Model API), how to run locally.
6. Clean up: remove test screens, check no secrets are in the repo or the app bundle, check remaining Meta credits.
7. Full test on an iPhone and an Android phone; fix bugs only, no new features.
8. **Stop and ask Olya to do a final test** with a friend.
- **Done when:** a friend can open the web link on their own phone and run a session without help.

### Stretch (only if ahead of schedule)
1. Tune the remaining 7 commands (Stay, Come, Touch, Leave it, Drop it, Place, Paw).
2. Train a small sit/down/stand classifier on Olya's clips, only on her own computer or a free option with no card (ask Olya first).
3. Muse Image illustrated session recap (3-panel comic) for the Best Creative Build bonus prize.

### After Nov 2 (Olya, not Claude Code)
- **Nov 3:** record the demo video, prepare X posts.
- **Nov 4:** submit early (well before 9:00 PM ET), post the demo on X and submit the link for Most Viral.

## Working rules

- All project code must be written during the hackathon (from Oct 26). Use open-source libraries only under their licenses.
- Don't use YouTube or other scraped videos as training or test data. Use Olya's own recordings or properly licensed datasets.
- Never commit API keys or secrets. Keep them in `.env` (git-ignored).
- Keep `PROGRESS.md` updated at the end of each work session.
