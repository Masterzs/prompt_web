/**
 * 数据验证工具
 * 提供各种数据验证和清理功能
 */

import { Prompt } from '../types'

/**
 * 验证 Prompt 数据
 */
export function validatePrompt(data: unknown): data is Prompt {
  if (!data || typeof data !== 'object') {
    return false
  }

  const prompt = data as Record<string, unknown>

  // 必需字段检查
  if (
    typeof prompt.id !== 'string' ||
    typeof prompt.title !== 'string' ||
    typeof prompt.content !== 'string' ||
    typeof prompt.platform !== 'string' ||
    typeof prompt.category !== 'string' ||
    typeof prompt.sourceUrl !== 'string' ||
    typeof prompt.createdAt !== 'string' ||
    typeof prompt.updatedAt !== 'string'
  ) {
    return false
  }

  // 数组字段检查
  if (!Array.isArray(prompt.tags)) {
    return false
  }

  // 可选字段类型检查
  if (prompt.description !== undefined && typeof prompt.description !== 'string') {
    return false
  }

  if (prompt.author !== undefined && typeof prompt.author !== 'string') {
    return false
  }

  if (prompt.location !== undefined && !Array.isArray(prompt.location)) {
    return false
  }

  if (prompt.imageUrl !== undefined && typeof prompt.imageUrl !== 'string') {
    return false
  }

  return true
}

/**
 * 清理和验证 Prompt 数组
 */
export function validatePrompts(data: unknown): Prompt[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.filter(validatePrompt)
}

/**
 * 清理字符串输入（防止 XSS）
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // 移除潜在的脚本标签
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * 验证搜索查询
 */
export function validateSearchQuery(query: string): {
  valid: boolean
  cleaned: string
  error?: string
} {
  if (typeof query !== 'string') {
    return { valid: false, cleaned: '', error: '搜索关键词必须是字符串' }
  }

  const cleaned = sanitizeString(query)

  // 长度限制
  if (cleaned.length > 200) {
    return { valid: false, cleaned: '', error: '搜索关键词过长（最多200字符）' }
  }

  // 检查是否包含危险字符
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i,
  ]

  if (dangerousPatterns.some(pattern => pattern.test(cleaned))) {
    return { valid: false, cleaned: '', error: '搜索关键词包含非法字符' }
  }

  return { valid: true, cleaned }
}

/**
 * 验证分页参数
 */
export function validatePagination(
  page: unknown,
  pageSize: unknown
): { valid: boolean; page: number; pageSize: number; error?: string } {
  const pageNum = typeof page === 'number' ? page : Number(page)
  const sizeNum = typeof pageSize === 'number' ? pageSize : Number(pageSize)

  if (isNaN(pageNum) || pageNum < 1) {
    return { valid: false, page: 1, pageSize: 100, error: '页码无效' }
  }

  if (isNaN(sizeNum) || sizeNum < 1 || sizeNum > 500) {
    return {
      valid: false,
      page: 1,
      pageSize: 100,
      error: '每页数量必须在1-500之间',
    }
  }

  return { valid: true, page: Math.floor(pageNum), pageSize: Math.floor(sizeNum) }
}

/**
 * 验证分类
 */
export function validateCategory(category: unknown): boolean {
  const validCategories = [
    'writing',
    'drawing',
    'script',
    'code',
    'video',
    'marketing',
    'education',
    'business',
    'creative',
    'productivity',
    'other',
  ]

  return typeof category === 'string' && validCategories.includes(category)
}

/**
 * 验证平台
 */
export function validatePlatform(platform: unknown): boolean {
  const validPlatforms = [
    'twitter',
    'youtube',
    'github',
    'reddit',
    'discord',
    'wechat',
    'weibo',
    'zhihu',
    'xiaohongshu',
    'other',
  ]

  return typeof platform === 'string' && validPlatforms.includes(platform)
}

/**
 * 清理 URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return ''
  }

  try {
    const parsed = new URL(url)
    // 只允许 http 和 https 协议
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return ''
    }
    return parsed.toString()
  } catch {
    // 如果不是完整 URL，检查是否是相对路径
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return url
    }
    return ''
  }
}

