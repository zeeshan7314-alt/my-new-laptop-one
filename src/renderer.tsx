import { jsxRenderer } from 'hono/jsx-renderer'
import { html, raw } from 'hono/html'
import { SITE, Meta } from './lib/seo'

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, meta: Meta): Response
  }
}

export const renderer = jsxRenderer(({ children }, c) => {
  const meta = (c as any).get?.('meta') as Meta | undefined
  const m: Meta = meta || { title: SITE.name, description: SITE.tagline, path: '/' }
  const canonical = SITE.baseUrl + m.path
  const jsonLd = (m.jsonLd || []).map(o => JSON.stringify(o)).join('</script><script type="application/ld+json">')
  return html`<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google-site-verification" content="SAHPMQsM3JaAetWDL7VJ6Z8__swyDnrbu82vbPpLlU4">
<meta name="msvalidate.01" content="4D99D1FC1EDDD7ADF3A2230E3C0ABE2D">
<title>${m.title}</title>
<meta name="description" content="${m.description}">
<link rel="canonical" href="${canonical}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:type" content="${m.ogType || 'website'}">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_US">
${m.ogImage ? raw(`<meta property="og:image" content="${m.ogImage}"><meta name="twitter:image" content="${m.ogImage}">`) : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${m.title}">
<meta name="twitter:description" content="${m.description}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>💻</text></svg>">
${jsonLd ? raw(`<script type="application/ld+json">${jsonLd}</script>`) : ''}
<script>
// theme bootstrap (before paint, no FOUC - defaults to light theme unless dark explicitly chosen)
(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();
</script>
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ec9ff',
          400: '#59abff',
          500: '#3388ff',
          600: '#1c68f5',
          700: '#1552e1',
          800: '#1844b6',
          900: '#193d8f',
          950: '#14275c'
        }
      }
    }
  }
}
</script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
</head>
<body class="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 antialiased">
${children}
<script src="/static/app.js" defer></script>
</body>
</html>`
})
