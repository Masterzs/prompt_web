import { Prompt } from '../types'

function replaceDomain(u: string, from: string, to: string) {
  try {
    const url = new URL(u)
    if (url.hostname.includes(from)) {
      url.hostname = to
      return url.toString()
    }
    return u
  } catch {
    return u
  }
}

function toNitter(u: string, qFallback: string) {
  try {
    const url = new URL(u)
    if (url.hostname.includes('twitter.com') || url.hostname.includes('x.com')) {
      if (url.pathname.startsWith('/search')) {
        const q = url.searchParams.get('q') || qFallback
        return `https://nitter.net/search?f=tweets&q=${encodeURIComponent(q)}`
      }
      url.hostname = 'nitter.net'
      return url.toString()
    }
    return `https://nitter.net/search?f=tweets&q=${encodeURIComponent(qFallback)}`
  } catch {
    return `https://nitter.net/search?f=tweets&q=${encodeURIComponent(qFallback)}`
  }
}

function toInvidious(u: string, qFallback: string) {
  try {
    const url = new URL(u)
    if (url.hostname.includes('youtube.com')) {
      url.hostname = 'yewtu.be'
      return url.toString()
    }
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1)
      return `https://yewtu.be/watch?v=${id}`
    }
    return `https://yewtu.be/results?search_query=${encodeURIComponent(qFallback)}`
  } catch {
    return `https://yewtu.be/results?search_query=${encodeURIComponent(qFallback)}`
  }
}

function toLibreddit(u: string, qFallback: string) {
  const replaced = replaceDomain(u, 'reddit.com', 'libredd.it')
  if (replaced === u) {
    return `https://libredd.it/search?q=${encodeURIComponent(qFallback)}`
  }
  return replaced
}

function toSearch(q: string, site?: string) {
  const query = site ? `${q} site:${site}` : q
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
}

export function getPublicSourceUrl(prompt: Prompt) {
  const q = prompt.title || ''
  const src = prompt.sourceUrl || ''
  switch (prompt.platform) {
    case 'twitter':
      return toNitter(src, q)
    case 'youtube':
      return toInvidious(src, q)
    case 'reddit':
      return toLibreddit(src, q)
    case 'github':
      return src
    case 'weibo':
      return toSearch(q, 'weibo.com')
    case 'zhihu':
      return toSearch(q, 'zhihu.com')
    case 'xiaohongshu':
      return toSearch(q, 'xiaohongshu.com')
    case 'wechat':
      return toSearch(q, 'mp.weixin.qq.com')
    default:
      return toSearch(q)
  }
}
