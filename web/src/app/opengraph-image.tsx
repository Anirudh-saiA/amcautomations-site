import { ImageResponse } from 'next/og'

export const alt = 'amc.automations: AI content and commerce automations'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#1E1C18', color: '#FFFFFF', padding: 72 }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>amc.automations</div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 88, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
          <span>Busywork,</span>
          <span style={{ color: '#3B74EE' }}>on autopilot.</span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 28, color: '#A6A29A' }}>
          <span>AI Content Studio</span>
          <span>·</span>
          <span>AI Commerce Operations</span>
        </div>
      </div>
    ),
    size,
  )
}
