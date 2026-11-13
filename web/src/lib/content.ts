/* All site copy, ported from the original static site (index.html, system.html, youtube.html). */

export const SITE = {
  name: 'amc.automations',
  person: 'Atharva Bhutada',
  email: 'atharva@amcautomations.in',
  emails: ['atharva@amcautomations.in', 'anirudh@amcautomations.in'],
  whatsapp: 'https://wa.me/917075969025?text=Hi%20Atharva%2C%20I%20saw%20amc.automations%20and%20want%20to%20book%20a%20call',
  approval: 'A person approves what goes out.',
}

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/ai-content-studio', label: 'AI Content Studio' },
  { href: '/ai-commerce-operations', label: 'AI Commerce Operations' },
  { href: '/about', label: 'About' },
]

/* ---------- home ---------- */
export const OUTPUTS = [
  {
    n: '01', tone: 'blue', name: 'Outbound', title: 'Drop in a company. Get the email sequence.',
    steps: ['Research', 'Outcome', 'Email', 'Day 3', 'Day 7', 'Day 15'],
    demo: 'Paste a company website and the engine writes one outcome, one question and follow-ups on day 3, 7 and 15.',
    note: 'The demo uses sample text so you can see the format.',
  },
  {
    n: '02', tone: 'orange', name: 'AI Content Studio', title: 'Drop in one long video. Get shorts out.',
    steps: ['Watch', 'Find moments', 'Track speaker', 'Captions', 'Cut 5 shorts'],
    demo: 'Paste a video link and see what each short comes with: a hook, a cut range, captions, speaker tracking and an end card.',
    note: 'The topics change with every run.',
  },
  {
    n: '03', tone: 'green', name: 'Posts', title: 'Drop in one idea. Get a carousel out.',
    steps: ['Read idea', 'Write cover', 'One point per slide', 'Check layout', 'Pack 5 slides'],
    demo: 'Type an idea and it becomes the cover. The other slides show the layout: one point per slide, the same every time.',
    note: 'Same layout every time.',
  },
]

export const REAL_EMAIL = {
  to: 'Founder Name',
  subject: 'fewer "where is my order" messages for Brand',
  lines: [
    'Hi Name,',
    'Since Shark Tank, you\'ve probably seen how order spikes also bring spikes in "where is my order" messages.',
    'The outcome I\'d aim for at Brand: your team stops answering delivery questions by hand. Customers get tracking updates on WhatsApp before they think to ask.',
    'You approve every message before it goes live, and you can switch it off at any point.',
    'Would a 15-minute call be worth it?',
  ],
  bullets: [
    'Each email names one thing about the company',
    'One outcome, one question, no attachments',
    'Follow-ups go out on day 3, 7 and 15',
  ],
}

export const ENGINES = [
  { tag: '01 · Flagship', title: 'Outbound that runs itself', tone: 'blue', big: true,
    text: 'Every morning it finds prospects that fit, writes each one a personal email, follows up on day 3, 7 and 15, and tells you who replied. Nobody tracks follow-ups by hand.' },
  { tag: '02 · WhatsApp', title: 'Agents that answer at 2 AM', tone: 'green', big: false,
    text: 'Support, bookings, COD confirmation, lead qualifying, fee reminders. On Meta\'s official API, so your number stays safe.' },
  { tag: '03 · Voice', title: 'AI sales caller', tone: 'orange', big: false,
    text: 'Calls every new lead within minutes, qualifies, handles common objections, books the meeting and updates your CRM.' },
  { tag: '04 · Content', title: 'A week of content from one prompt', tone: 'blue', big: false,
    text: 'Scripts, edits, captions and a scheduled week, for brands and creators who post daily.' },
  { tag: '+ Anything else', title: 'Your weird workflow', tone: 'beige', big: false,
    text: 'Invoices, reports, CRM hygiene, handoffs between tools. If a person does it the same way every time, it can run on its own.' },
]

/* ---------- services ---------- */
export const BUILD_STEPS = [
  { title: 'Discovery call', text: 'You show us the work that eats your team\'s week.' },
  { title: 'Design the flow', text: 'You get the exact steps in writing before anything is built.' },
  { title: 'Build and test', text: 'Built in n8n or Claude Code, then run on your real data.' },
  { title: 'Handover', text: 'You approve it, it goes live, and support stays open after.' },
]

export const SERVICES_FAQ = [
  { q: 'Do I need to change my tools?', a: 'No. The build connects the tools you already use: WhatsApp, Gmail, Sheets, your CRM, your calendar.' },
  { q: 'Who owns it once it\'s built?', a: 'You do. It runs on your accounts and your keys. Nothing is locked to us.' },
  { q: 'What if it breaks?', a: 'Every build ships with the checks that catch problems early, and support stays open after handover.' },
  { q: 'How is it priced?', a: 'By scope, after the call, in writing. You know the full number before anything starts.' },
]

/* ---------- systems ---------- */
export const LOG = {
  range: '26 Sep to 8 Oct',
  stats: [
    { n: '304', label: 'prospects found' },
    { n: '317', label: 'emails sent' },
    { n: '4', label: 'replies' },
    { n: '7', label: 'bounces caught' },
  ],
  bars: [
    { n: '323', label: 'approved by a person before sending' },
    { n: '286', label: 'prospects with a personal opening line' },
    { n: '28', label: 'low-lead warnings raised by the engine' },
  ],
}

export const VIDEO_STYLES = [
  { id: 'mikey', title: 'Talking head', text: 'Bold word captions. Sample edit, not client work.' },
  { id: 'kendall', title: 'Split screen', text: 'Explainer visual on top, speaker below. Sample edit.' },
  { id: 'rahim', title: 'Podcast clip', text: 'Two speakers, close-ups and a two-shot. Sample edit.' },
  { id: 'james', title: 'Fast cut', text: 'Hard cuts and push-ins on a hook. Sample edit.' },
  { id: 'dinner', title: 'Story style', text: 'On-screen text cards on the story beats. Sample edit.' },
]

export const ALSO_RUNNING = [
  { title: 'Comment to DM', text: 'A keyword comment on a post sends the link to the commenter\'s inbox, and the contact is saved.' },
  { title: 'Morning dashboard', text: 'One screen with new leads, queued, sent and failed. It updates at 6 AM.' },
]

/* ---------- agencies ---------- */
export const AGENCY = {
  features: [
    { n: '01', title: 'Finds the strongest moments', text: 'It reads the full video and opens every Short on its best moment, not a slow intro.' },
    { n: '02', title: 'Edits them for you', text: 'Captions, explainer visuals, reframing for vertical and a call to action at the end.' },
    { n: '03', title: 'Runs on your machine', text: 'Installed on your agency\'s own computer. Client footage stays with you.' },
  ],
  flow: [
    { who: 'Client', title: 'Video comes in', text: 'The client\'s long recording, same as today.' },
    { who: 'Editor', title: 'Sets direction', text: 'Tone, style, the angle and the call to action.' },
    { who: 'System', title: 'Makes the Shorts', text: 'Picks moments, cuts, captions, adds visuals and the CTA.' },
    { who: 'Editor', title: 'Reviews', text: 'Checks each Short and tweaks what needs it.' },
    { who: 'Editor', title: 'Delivers', text: 'Sends to the client under your agency\'s name.' },
  ],
  forWho: [
    { title: 'Agencies with around five editors', text: 'You have more client work than hands, and hiring is slow and costly.' },
    { title: 'Teams that cut Shorts from long videos', text: 'Podcasts, talking heads, interviews, course and expert content.' },
    { title: 'Owners who want to keep their footage in house', text: 'It runs on your machine, under your control.' },
  ],
  notFor: 'Large studios with their own pipeline, or one-off edits.',
  faq: [
    { q: 'Does it replace my editors?', a: 'No. They set direction and review. It removes the repetitive cutting so each one handles more clients.' },
    { q: 'Where does it run?', a: 'On your agency\'s own computer. Footage does not leave your machine.' },
    { q: 'Can it match a client\'s style?', a: 'Yes. Style comes from the direction your editor gives.' },
    { q: 'Can I see it first?', a: 'Yes. Send one long video and see the Shorts it makes.' },
  ],
}

/* ---------- youtube ---------- */
export const YT = {
  steps: [
    { n: '01', title: 'Send your channel', text: 'Share your channel link and we look at your videos and pick where to start.' },
    { n: '02', title: 'Send your recordings', text: 'Drop raw videos in a shared folder. No new video this week? Shorts come from your older ones.' },
    { n: '03', title: 'Approve and it goes live', text: 'You see everything before it posts. Then it is scheduled and uploaded.' },
  ],
  faq: [
    { q: 'Do I have to change how I record?', a: 'No. Keep recording the way you do now.' },
    { q: 'Who owns the videos?', a: 'You do. Everything is posted on your channel.' },
    { q: 'Can I approve before anything goes live?', a: 'Yes. Nothing is posted without your OK.' },
    { q: 'What if I don\'t record a new video one month?', a: 'Shorts are cut from your older videos, so your channel keeps posting.' },
  ],
  /* clips available in the repo; the original page also lists w01-w12 files that are not in the repo */
  work: [
    { id: 'ari/a01', title: 'Talking head', text: 'Bold word captions and a hook line up top.', tag: 'Shorts' },
    { id: 'ari/a02', title: 'Podcast clip', text: 'Two speakers, hook headline, close-ups and a two-shot.', tag: 'Podcast' },
    { id: 'ari/a03', title: 'Interview clip', text: 'Hook text, word captions and a tight reframe.', tag: 'Shorts' },
    { id: 'ari/a04', title: 'Expert short', text: 'Word-by-word captions on a talking head, jump cuts.', tag: 'Shorts' },
    { id: 'sample-mikey', title: 'Fast cut', text: 'Hard cuts and push-ins on the hook.', tag: 'Shorts' },
    { id: 'sample-kendall', title: 'Split screen', text: 'Explainer cards over the speaker, captions below.', tag: 'Shorts' },
    { id: 'sample-rahim', title: 'Podcast clip', text: 'Two speakers, close-ups and a two-shot.', tag: 'Podcast' },
    { id: 'sample-dinner', title: 'Story style', text: 'On-screen text cards on the story beats.', tag: 'Shorts' },
  ],
}

export const CAROUSEL = ['car-01', 'car-02', 'car-03', 'car-04']


/* ---------- home: the four products ---------- */
export const PRODUCTS = [
  { tag: '01 · Outbound', title: 'Outbound that runs itself', tone: 'blue',
    text: 'Every morning it finds prospects that fit, writes each one a personal email, follows up on day 3, 7 and 15, and tells you who replied. Nobody tracks follow-ups by hand.' },
  { tag: '02 · AI Content Studio', title: 'One long video in. Shorts out.', tone: 'orange',
    text: 'Cuts a long video into vertical shorts: the strongest moments, speaker in frame, captions and a call card. You approve each short.' },
  { tag: '03 · Posts', title: 'One idea in. A full carousel out.', tone: 'green',
    text: 'Turns a single idea into a five-slide post in the same layout every time, ready to schedule across the week.' },
  { tag: '04 · Automation', title: 'Customer care and refunds on autopilot', tone: 'blue',
    text: 'Answers questions at 2 AM, confirms orders and handles refund requests by your rules. A person only sees the edge cases.' },
]

/* PLACEHOLDER numbers for the home page strip. Replace with real figures before going live. */
export const STATS = [
  { n: 1200, s: '+', t: 'hours of busywork handed back to teams' },
  { n: 250, s: 'k', t: 'follow-ups and messages sent on autopilot' },
  { n: 48, s: '', t: 'brands running an agent with us' },
  { n: 24, s: 'h', t: 'to hear back on what can be automated' },
]


/* ---------- home: technologies we build with ---------- */
export const TECH: { n: string; k: string; tone: string; f?: string }[] = [
  { n: 'n8n', k: 'Workflow engine', tone: 'orange', f: 'n8n' },
  { n: 'Claude Code', k: 'AI builder', tone: 'blue', f: 'claude' },
  { n: 'WhatsApp API', k: "Meta's official API", tone: 'green', f: 'whatsapp' },
  { n: 'Gmail', k: 'Email and follow-ups', tone: 'orange', f: 'gmail' },
  { n: 'Google Sheets', k: 'Data and reports', tone: 'green', f: 'googlesheets' },
  { n: 'Google Calendar', k: 'Booking', tone: 'blue', f: 'googlecalendar' },
  { n: 'Supabase', k: 'Database', tone: 'green', f: 'supabase' },
  { n: 'Next.js', k: 'Web apps', tone: 'blue', f: 'nextdotjs' },
  { n: 'Shopify', k: 'Online stores', tone: 'green', f: 'shopify' },
  { n: 'WooCommerce', k: 'WordPress stores', tone: 'blue', f: 'woocommerce' },
  { n: 'Razorpay', k: 'Payments', tone: 'blue', f: 'razorpay' },
  { n: 'HubSpot', k: 'CRM', tone: 'orange', f: 'hubspot' },
  { n: 'Zoho', k: 'CRM and books', tone: 'orange', f: 'zoho' },
  { n: 'Your CRM', k: 'Whichever you use', tone: 'orange' },
  { n: 'Webhooks', k: 'Anything with an API', tone: 'blue' },
]
