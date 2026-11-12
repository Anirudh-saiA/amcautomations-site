'use client'

import Link from 'next/link'
import SplitReveal from './SplitReveal'
import LoopVideo from './LoopVideo'

/* window 3: a big "CONTENT" word splits at the middle and reveals the video product */
export default function SplitVideo() {
  return (
    <SplitReveal id="video" word="AI CONTENT|STUDIO" vw={13} cap={230} tone="black" kicker="AI Content Studio" title="Send one long video. Get shorts back.">
      <div className="sp-copy">
        <span className="kicker">AI Content Studio</span>
        <h2>Send one long video. Get shorts back.</h2>
        <p>A podcast, a webinar or a long talk has a dozen posts hiding inside it. We find the strongest moments, cut them into captioned vertical shorts and build carousels from the same recording. You approve every one before it goes out.</p>
        <ul className="ticks">
          <li>Best moments found across the whole recording</li>
          <li>Captions, framing and a call to action added</li>
          <li>Carousels from the same video</li>
          <li>You review and approve each piece</li>
        </ul>
        <div className="sp-actions">
          <Link className="btn blue" href="/ai-content-studio">See how it works</Link>
          <a className="btn ghost dark" href="#contact">Send us your video</a>
        </div>
      </div>
      <LoopVideo name="ai-content-studio" label="A long podcast recording is scanned, then cut into short vertical clips and a carousel" />
    </SplitReveal>
  )
}
