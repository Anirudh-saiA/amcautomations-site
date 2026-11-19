import Script from 'next/script'

/* Microsoft Clarity (free heatmaps and session replays): loads only when NEXT_PUBLIC_CLARITY_ID is set in Vercel */
export default function Clarity() {
  const id = process.env.NEXT_PUBLIC_CLARITY_ID
  if (!id || !/^[a-z0-9]{8,12}$/.test(id)) return null
  return (
    <Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${id}");`}</Script>
  )
}
