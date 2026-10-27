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
- **Hackathon credits count as money.** Ask before anything that would use a lot of Meta Model API, Baseten, Modal, or Fireworks credits (batch jobs, long loops, load tests, training runs). Normal small test calls during development are fine.

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

### Hosting: Modal (decided)
- **Modal is the single infrastructure provider.** Host everything server-side there:
  - FastAPI backend that the app talks to
  - **Muse Spark Open (`meta-models/muse-spark-open-1026`) served through Modal Endpoints**
  - SAM 3.1 on a Modal serverless GPU (if on-device tracking is too slow)
  - Training the small sit/down/stand classifier on Olya's own clips
- **Why this matters:** serving Muse Spark Open on partner-provided inference (Modal) makes Shake eligible for the "Best Build on Meta Open Weight Models" bonus prize. Don't move the main model to the Meta Model API without asking Olya.
- **Proof for judges:** document in the README that Muse Spark Open runs on Modal, and keep the Modal deployment config in the repo.
- **Fallback:** if Modal latency or rate limits are a problem, Baseten can serve Muse Spark Open instead. Ask Olya before switching.
- **Credits:** Modal credits are limited ($100). Use GPUs only when needed, scale to zero when idle, and ask before long training runs or load tests (see payment rules above).
- **Stack:** React Native (Expo) app, local on-device database for profiles and history, on-device speech recognition and text-to-speech, Python FastAPI backend on Modal.

### Platforms and distribution (mobile + web)
- **Set up the Expo project for iOS, Android, and web from day 1.** Choose libraries that work on all three (camera, mic, speech recognition, text-to-speech, local storage), or put platform-specific code behind one shared interface. Flag any feature that can't work on web.
- **Web version is the main "try it" link** for judges, Community Vote, and Most Viral. It must run in phone browsers (iOS Safari and Android Chrome) with camera and mic access over HTTPS. Host it for free on Modal next to the backend, or on another free static host.
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
- Expo project for iOS, Android, and web; Modal account and FastAPI backend deployed.
- One test call to Muse Spark Open (`meta-models/muse-spark-open-1026`) on Modal with a dog photo; measure response time.
- **Done when:** the app on Olya's phone (Expo Go) sends a photo to the backend and shows the model's answer, and the response time is written in `PROGRESS.md`.

### Milestone 2 — Core loop (Oct 28–29)
- Live camera, cue word detection, fast path (dog tracking + marker sound), slow path (Muse Spark Open confirms the behavior).
- Start with Sit, then Down and Watch me.
- **Done when:** a real dog sits after "Sit" and the click plays within about 1 second, on Olya's phone, several times in a row. Latency is measured and recorded.

### Milestone 3 — Dog profiles (Oct 30)
- Local database, add/edit dog (only name required), photo, profile fields, custom cue words per command with the look-alike warning.
- **Done when:** Olya can add two dogs with different cue words, close the app, reopen it, and everything is still there.

### Milestone 4 — Training flow (Oct 31)
- Dog home with the 10 commands and progress bars, command detail, session briefing, camera check, session timer (recommended lengths, 25-minute cap), session summary, level up/down rules, reinforcement mode.
- **Done when:** Olya can run a full session from dog home to summary, and progress updates correctly.

### Milestone 5 — Smart coaching (Nov 1)
- Repeated cue detection and tips, struggling and "let's make it easier," fatigue detection and early ending, "Coach" wake word and Q&A with paused timer.
- Build the coach as an agent with clear tools (`play_marker`, `say_tip`, `change_level`, `end_session`, `update_progress`) for the Best Agentic Use-Case bonus prize.
- **Done when:** each behavior can be triggered on purpose in a test session and responds correctly.

### Milestone 6 — Ship it (Nov 2)
- Web version deployed (free hosting), Android APK built, demo mode (pre-recorded clip through the real pipeline), debug overlay for the demo video, README with links and "Muse Spark Open runs on Modal."
- Test the web link on an iPhone and an Android phone; fix bugs only, no new features.
- **Done when:** a friend can open the web link on their own phone and run a session without help.

### Stretch (only if ahead of schedule)
- Train a small sit/down/stand classifier on Olya's clips on Modal.
- Muse Image illustrated session recap (3-panel comic) for the Best Creative Build bonus prize.
- Remaining 7 commands fully tuned.

### After Nov 2 (Olya, not Claude Code)
- **Nov 3:** record the demo video, prepare X posts.
- **Nov 4:** submit early (well before 9:00 PM ET), post the demo on X and submit the link for Most Viral.

## Working rules

- All project code must be written during the hackathon (from Oct 26). Use open-source libraries only under their licenses.
- Don't use YouTube or other scraped videos as training or test data. Use Olya's own recordings or properly licensed datasets.
- Never commit API keys or secrets. Keep them in `.env` (git-ignored).
- Keep `PROGRESS.md` updated at the end of each work session.
