import Script from 'next/script'

/* Google Analytics 4: loads only when NEXT_PUBLIC_GA_ID (like G-XXXXXXXXXX) is set in Vercel */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}</Script>
    </>
  )
}
