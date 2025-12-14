export interface Prompt {
  id: string
  title: string
  content: string
  description?: string
  platform: Platform
  category: Category
  tags: string[]
  sourceUrl: string
  author?: string
  createdAt: string
  updatedAt: string
  usageCount?: number
  rating?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  language: 'zh' | 'en' | 'ja' | 'ko' | 'other'
  /** 本地媒资文件名（图片或视频），存放于 public/assets 下，保留 imageUrl 兼容旧数据 */
  location?: string[]
  imageUrl?: string
}

export type Platform = 
  | 'twitter' 
  | 'youtube' 
  | 'github' 
  | 'reddit' 
  | 'discord' 
  | 'wechat' 
  | 'weibo' 
  | 'zhihu' 
  | 'xiaohongshu' 
  | 'other'

export type Category = 
  | 'writing' 
  | 'drawing' 
  | 'script' 
  | 'code' 
  | 'video'
  | 'marketing' 
  | 'education' 
  | 'business' 
  | 'creative' 
  | 'productivity' 
  | 'other'

export interface SearchFilters {
  query?: string
  tags?: string[]
  category?: Category
  platform?: Platform
  difficulty?: Prompt['difficulty']
  language?: Prompt['language']
}

export interface SearchResult {
  items: Prompt[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CopyResult {
  success: boolean
  message?: string
}
