# amc.automations

A free template library: 69 practical automation guides across agent teams, tools & repos, Claude Code, prompting, and build & sell.

Every guide includes how it works, a copy-paste prompt (or config, for guides that are genuinely infrastructure), step-by-step build, and an honest note on where it breaks. A Prompts/Tech toggle in the nav switches between the paste-ready prompt only (light) and the full Python build — folder layout, starter kit, code (dark).

## Run locally

It's a single static file.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Works as-is on GitHub Pages, Netlify or Vercel — no build step.

## Status

- Email, waitlist and service-brief forms post to Supabase (`leads` table) and forward to formsubmit.co.
- Guide code has not been run end to end; test each script with your own keys before relying on it.

## Email gate

Every guide shows a free preview: the intro, the flow diagram, "What this does" and "Why it works". The rest — the paste-ready prompt, the build steps, the code, the failure notes — is behind one email, and one email unlocks all guides.

The unlock is remembered per browser (`localStorage`, key `amc_email`) and the address is written to the existing Supabase `leads` table as `kind: "unlock"`. If that write fails, the reader is still let through.
