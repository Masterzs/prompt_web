import { Prompt } from '../types'

/**
 * 搜索提示词
 * @param prompts 提示词列表
 * @param query 搜索关键词
 * @returns 匹配的提示词列表
 */
export function searchPrompts(prompts: Prompt[], query: string): Prompt[] {
  const searchTerm = query.toLowerCase().trim()
  if (!searchTerm) return prompts

  return prompts.filter(prompt => {
    const searchableText = [
      prompt.title,
      prompt.content,
      prompt.description || '',
      prompt.author || '',
      prompt.platform,
      prompt.category,
      ...prompt.tags
    ].join(' ').toLowerCase()

    return searchableText.includes(searchTerm)
  })
}

/**
 * 根据标签筛选提示词
 * @param prompts 提示词列表
 * @param tags 标签列表
 * @returns 匹配的提示词列表
 */
export function getPromptsByTag(prompts: Prompt[], tags: string[]): Prompt[] {
  if (tags.length === 0) return prompts

  return prompts.filter(prompt => {
    return tags.some(tag => prompt.tags.includes(tag))
  })
}

/**
 * 获取所有标签
 * @param prompts 提示词列表
 * @returns 标签列表（去重并按使用频率排序）
 */
export function getAllTags(prompts: Prompt[]): string[] {
  const tagCount: Record<string, number> = {}
  
  prompts.forEach(prompt => {
    prompt.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })

  return Object.entries(tagCount)
    .sort(([,a], [,b]) => b - a)
    .map(([tag]) => tag)
}

/**
 * 根据分类筛选提示词
 * @param prompts 提示词列表
 * @param category 分类
 * @returns 匹配的提示词列表
 */
export function getPromptsByCategory(prompts: Prompt[], category: string): Prompt[] {
  return prompts.filter(prompt => prompt.category === category)
}

/**
 * 根据平台筛选提示词
 * @param prompts 提示词列表
 * @param platform 平台
 * @returns 匹配的提示词列表
 */
export function getPromptsByPlatform(prompts: Prompt[], platform: string): Prompt[] {
  return prompts.filter(prompt => prompt.platform === platform)
}

/**
 * 根据难度筛选提示词
 * @param prompts 提示词列表
 * @param difficulty 难度
 * @returns 匹配的提示词列表
 */
export function getPromptsByDifficulty(prompts: Prompt[], difficulty: string): Prompt[] {
  return prompts.filter(prompt => prompt.difficulty === difficulty)
}

/**
 * 根据语言筛选提示词
 * @param prompts 提示词列表
 * @param language 语言
 * @returns 匹配的提示词列表
 */
export function getPromptsByLanguage(prompts: Prompt[], language: string): Prompt[] {
  return prompts.filter(prompt => prompt.language === language)
}

/**
 * 获取热门提示词（按使用次数排序）
 * @param prompts 提示词列表
 * @param limit 限制数量
 * @returns 热门提示词列表
 */
export function getPopularPrompts(prompts: Prompt[], limit: number = 10): Prompt[] {
  return [...prompts]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit)
}

/**
 * 获取高评分提示词
 * @param prompts 提示词列表
 * @param limit 限制数量
 * @returns 高评分提示词列表
 */
export function getTopRatedPrompts(prompts: Prompt[], limit: number = 10): Prompt[] {
  return [...prompts]
    .filter(prompt => prompt.rating && prompt.rating >= 4)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit)
}

/**
 * 获取最新提示词
 * @param prompts 提示词列表
 * @param limit 限制数量
 * @returns 最新提示词列表
 */
export function getLatestPrompts(prompts: Prompt[], limit: number = 10): Prompt[] {
  return [...prompts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * 获取相关提示词
 * @param prompts 提示词列表
 * @param currentPrompt 当前提示词
 * @param limit 限制数量
 * @returns 相关提示词列表
 */
export function getRelatedPrompts(prompts: Prompt[], currentPrompt: Prompt, limit: number = 5): Prompt[] {
  return prompts
    .filter(prompt => prompt.id !== currentPrompt.id)
    .filter(prompt => {
      // 共享标签
      const sharedTags = prompt.tags.filter(tag => currentPrompt.tags.includes(tag))
      // 相同分类
      const sameCategory = prompt.category === currentPrompt.category
      // 相同平台
      const samePlatform = prompt.platform === currentPrompt.platform
      
      return sharedTags.length > 0 || sameCategory || samePlatform
    })
    .sort((a, b) => {
      // 按相关性排序
      const aSharedTags = a.tags.filter(tag => currentPrompt.tags.includes(tag)).length
      const bSharedTags = b.tags.filter(tag => currentPrompt.tags.includes(tag)).length
      const aSameCategory = a.category === currentPrompt.category ? 1 : 0
      const bSameCategory = b.category === currentPrompt.category ? 1 : 0
      const aSamePlatform = a.platform === currentPrompt.platform ? 1 : 0
      const bSamePlatform = b.platform === currentPrompt.platform ? 1 : 0
      
      const aScore = aSharedTags + aSameCategory + aSamePlatform
      const bScore = bSharedTags + bSameCategory + bSamePlatform
      
      return bScore - aScore
    })
    .slice(0, limit)
}