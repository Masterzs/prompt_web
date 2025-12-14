/**
 * 防爬虫工具
 * 包括请求频率限制、反爬虫检测、数据混淆等功能
 */

// 请求频率限制
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private readonly maxRequests: number
  private readonly timeWindow: number // 毫秒

  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
  }

  /**
   * 检查是否超过频率限制
   * @param identifier 用户标识（IP、session等）
   * @returns 是否允许请求
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // 清理过期记录
    const validRequests = requests.filter(time => now - time < this.timeWindow)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  /**
   * 清理过期记录
   */
  cleanup() {
    const now = Date.now()
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.timeWindow)
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

// 全局频率限制器
const rateLimiter = new RateLimiter(50, 60000) // 每分钟最多20次请求

// 定期清理过期记录
setInterval(() => rateLimiter.cleanup(), 60000)

/**
 * 获取用户标识（基于浏览器指纹）
 */
function getUserIdentifier(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Browser fingerprint', 2, 2)
    }
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|')
    
    // 简单哈希
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  } catch {
    return 'unknown'
  }
}

/**
 * 检测是否为爬虫
 */
function detectBot(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检测常见爬虫 User-Agent
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java/i,
    /headless/i, /phantom/i, /selenium/i
  ]
  
  const userAgent = navigator.userAgent
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  // 检测无头浏览器特征
  if (!navigator.webdriver === false) {
    // 某些无头浏览器会设置 webdriver
    if (navigator.webdriver) return true
  }
  
  // 检测窗口大小异常
  if (window.outerWidth === 0 || window.outerHeight === 0) {
    return true
  }
  
  // 检测插件数量（爬虫通常没有插件）
  if (navigator.plugins.length === 0 && navigator.userAgent.indexOf('Chrome') > -1) {
    return true
  }
  
  return false
}

/**
 * 数据混淆 - 对敏感数据进行简单混淆
 */
export function obfuscateData(data: string): string {
  if (!data) return ''
  
  // 简单的字符替换混淆（仅用于增加爬取难度，不是真正的加密）
  const chars = data.split('')
  return chars.map((char, index) => {
    const code = char.charCodeAt(0)
    // 对每个字符进行轻微偏移
    return String.fromCharCode(code + (index % 3) - 1)
  }).join('')
}

/**
 * 数据还原
 */
export function deobfuscateData(data: string): string {
  if (!data) return ''
  
  const chars = data.split('')
  return chars.map((char, index) => {
    const code = char.charCodeAt(0)
    return String.fromCharCode(code - (index % 3) + 1)
  }).join('')
}

/**
 * 检查请求频率
 */
export function checkRateLimit(): boolean {
  const identifier = getUserIdentifier()
  return rateLimiter.checkLimit(identifier)
}

/**
 * 防爬虫检查
 */
export function antiCrawlCheck(): {
  allowed: boolean
  reason?: string
} {
  // 检测爬虫
  if (detectBot()) {
    return { allowed: false, reason: 'Bot detected' }
  }
  
  // 检查频率限制
  if (!checkRateLimit()) {
    return { allowed: false, reason: 'Rate limit exceeded' }
  }
  
  return { allowed: true }
}

/**
 * 延迟响应（增加爬取难度）
 */
export function addArtificialDelay(min: number = 100, max: number = 300): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 验证请求来源
 */
export function validateRequest(): boolean {
  if (typeof window === 'undefined') return false
  
  // 检查 referrer（如果是从外部直接访问数据接口，可能是爬虫）
  const referrer = document.referrer
  if (!referrer && window.location.pathname.includes('/data/')) {
    return false
  }
  
  return true
}

