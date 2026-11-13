import { ImageResponse } from 'next/og'

export const alt = 'AMC Automations: AI · Media · Commerce automation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FAF7F2', color: '#1E1C18', padding: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="84" height="84" viewBox="0 0 64 64">
            <path d="M11 47 L32 17 L53 47" fill="none" stroke="#1E1C18" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="47" r="9.5" fill="#3B74EE" />
            <circle cx="32" cy="17" r="9.5" fill="#EE7A2E" />
            <circle cx="53" cy="47" r="9.5" fill="#1F9D57" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.5 }}>AMC Automations</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3.5 }}>
          <span>AI · Media ·</span>
          <span style={{ color: '#3B74EE' }}>Commerce.</span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 28, color: '#3A3732' }}>
          <span>We build the automations your team does by hand</span>
        </div>
      </div>
    ),
    size,
  )
}
