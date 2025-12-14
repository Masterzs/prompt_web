import { useEffect, useState } from 'react'
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, FlipHorizontal } from 'lucide-react'
import { copyToClipboard } from '../utils/copy'
import { Prompt } from '../types'
import { sanitizeUrl } from '../utils/validator'
import { withAsyncErrorHandling, errorHandler } from '../utils/error-handler'
import { safeExecute } from '../utils/error-handler'

interface PromptCardProps {
  prompt: Prompt
  index?: number
}

export default function PromptCard({ prompt, index = 0 }: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  // 解析媒体文件路径
  // location 支持多种格式：
  // 1. 完整URL: http://... 或 https://...
  // 2. 绝对路径: /assets/image/...
  // 3. 相对路径（含子目录）: gpt4o/filename.jpg -> /assets/image/gpt4o/filename.jpg
  // 4. 文件名: filename.jpg -> /assets/image/filename.jpg
  const resolveMediaPath = (file: string, mediaType: 'image' | 'video'): string => {
    if (!file || typeof file !== 'string') return ''
    
    // 计算 base 路径：优先使用构建时注入的 BASE_URL，兜底 '/'
    const rawBase = (import.meta as any)?.env?.BASE_URL ?? '/'
    const basePath = String(rawBase).replace(/\/$/, '')

    const mediaRoot = mediaType === 'video' ? '/assets/video/' : '/assets/image/'

    // 清理文件路径
    const cleanedFile = file.trim()
    if (!cleanedFile) return ''
    
    // 完整URL或绝对路径，验证后返回
    if (cleanedFile.startsWith('http://') || cleanedFile.startsWith('https://')) {
      const sanitized = sanitizeUrl(cleanedFile)
      return sanitized || ''
    }
    
    if (cleanedFile.startsWith('/')) {
      // 已经包含 basePath 的情况，直接返回
      if (cleanedFile.startsWith(`${basePath}/`)) {
        return cleanedFile
      }
      // 验证绝对路径不包含危险字符（允许路径分隔符）
      if (!/^\/[^<>"|?*\x00-\x1f]+$/.test(cleanedFile)) {
        return ''
      }
      // 为绝对路径加上 basePath，适配 GitHub Pages 子路径
      return `${basePath}${cleanedFile}`
    }
    
    // 相对路径，验证路径安全性（允许路径分隔符 /，但不允许反斜杠 \）
    // 允许：gpt4o/filename.jpg, banana/file.png
    // 禁止：..\file.jpg, C:\file.jpg
    if (!/^[^<>"|?*\x00-\x1f\\]+$/.test(cleanedFile)) {
      return ''
    }
    
    // 相对路径，根据mediaType添加基础路径，并加上 base 路径
    const normalized = cleanedFile.replace(/^\/+/, '')
    return `${basePath}${mediaRoot}${normalized}`
  }

  // 安全获取媒体文件列表
  const mediaFiles = safeExecute(() => {
    if (!prompt?.location) return []
    if (!Array.isArray(prompt.location)) return []
    return prompt.location.filter((file): file is string => 
      typeof file === 'string' && file.trim().length > 0
    )
  }, [])

  const imageFiles = safeExecute(() => {
    return mediaFiles.filter(file => /\.(png|jpe?g|webp|gif|avif)$/i.test(file))
  }, [])

  const videoFiles = safeExecute(() => {
    return mediaFiles.filter(file => /\.(mp4|webm|mov|mkv)$/i.test(file))
  }, [])

  const resolvedImages = safeExecute(() => {
    return imageFiles.map(file => resolveMediaPath(file, 'image')).filter(Boolean)
  }, [])

  const resolvedVideos = safeExecute(() => {
    return videoFiles.map(file => resolveMediaPath(file, 'video')).filter(Boolean)
  }, [])

  // 优先使用 location 中的图片；如果没有，再尝试 imageUrl（同样走路径解析，适配 basePath）
  let displayImages: string[] = []
  
  if (resolvedImages.length > 0) {
    displayImages = resolvedImages
  } else if (prompt.imageUrl) {
    const fallbackImg = resolveMediaPath(prompt.imageUrl, 'image')
    displayImages = fallbackImg ? [fallbackImg] : []
  }
  // 如果既没有 location 也没有 imageUrl，displayImages 保持为空数组
  // 这样 noMedia 会为 true，直接显示文字内容，而不是显示默认图
  
  const uniqueImagesList = Array.from(new Set(displayImages.filter(Boolean)))
  const hasVideo = resolvedVideos.length > 0
  const [images, setImages] = useState<string[]>(uniqueImagesList)
  const hasMultipleImages = !hasVideo && images.length > 1
  const noMedia = !hasVideo && images.length === 0

  useEffect(() => {
    setImages(uniqueImagesList)
    setCurrentImage(0)
  }, [prompt.id, uniqueImagesList.join('|')])

  const handleCopy = async () => {
    await withAsyncErrorHandling(async () => {
      if (!prompt?.content) {
        throw new Error('No content to copy')
      }
      await copyToClipboard(prompt.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, 'Failed to copy content')
  }

  const handleSourceClick = () => {
    safeExecute(() => {
      // 验证 URL
      const safeUrl = sanitizeUrl(prompt.sourceUrl || '')
      if (!safeUrl) {
        errorHandler.logError(new Error('Invalid source URL'))
        return
      }

      // 添加来源点击统计
      if (typeof window !== 'undefined' && window.gtag) {
        try {
          window.gtag('event', 'click', {
            event_category: 'prompt_source',
            event_label: prompt.platform || 'unknown',
            value: 1
          })
        } catch (error) {
          // 统计失败不影响打开链接
          errorHandler.logError(error instanceof Error ? error : new Error(String(error)))
        }
      }
      
      window.open(safeUrl, '_blank', 'noopener,noreferrer')
    }, undefined)
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const toggleFlipped = () => {
    setFlipped(prev => !prev)
  }

  const renderMedia = () => {
    if (hasVideo) {
      const videoSrc = resolvedVideos[0]
      return (
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <video
            className="w-full h-full object-cover"
            src={videoSrc}
            controls
            loop
            muted
            playsInline
            poster={displayImages[0]}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="text-white text-base sm:text-lg font-semibold line-clamp-2">{prompt.title}</h3>
              <p className="text-white/80 text-xs line-clamp-1">{prompt.description}</p>
            </div>
            <span className="ml-3 px-2 py-1 bg-white/80 text-gray-900 text-xs font-medium rounded-full whitespace-nowrap">
              {prompt.category}
            </span>
          </div>
        </div>
      )
    }

    const coverImage = images[currentImage]
    const isHero = index < 6
    const imgCount = images.length || 1

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const failedSrc = (e.target as HTMLImageElement).src
      console.warn('Image load failed:', failedSrc)
      
      setImages(prev => {
        // 移除失败的图片
        const next = prev.filter(src => src !== failedSrc)
        
        // 如果还有图片，返回剩余的
        if (next.length > 0) {
          return Array.from(new Set(next))
        }
        
        // 如果没有图片了，尝试使用 imageUrl（如果存在且不是失败的）
        if (prompt.imageUrl && prompt.imageUrl !== failedSrc) {
          return [prompt.imageUrl]
        }
        
        // 不再回退到分类默认图，返回空数组（显示文字）
        return []
      })
      
      // 如果当前图片索引超出范围，重置为0
      setCurrentImage(prev => {
        const remaining = images.filter(src => src !== failedSrc)
        return prev >= remaining.length ? 0 : prev
      })
    }

    return (
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {coverImage && (
          <img
            src={coverImage}
            alt={prompt.title}
            className="w-full h-full object-cover"
            loading={isHero ? 'eager' : 'lazy'}
            fetchPriority={isHero ? 'high' : 'low'}
            decoding="async"
            onError={handleImageError}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold line-clamp-2">{prompt.title}</h3>
            <p className="text-white/80 text-xs line-clamp-1">{prompt.description}</p>
          </div>
          <span className="ml-3 px-2 py-1 bg-white/80 text-gray-900 text-xs font-medium rounded-full whitespace-nowrap">
            {prompt.category}
          </span>
        </div>
        {hasMultipleImages && (
          <div className="absolute inset-x-0 bottom-14 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentImage((prev) => (prev - 1 + imgCount) % imgCount)}
              className="px-2 py-1 bg-white/80 text-gray-700 rounded-md text-xs hover:bg-white transition"
            >
              上一张
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev + 1) % imgCount)}
              className="px-2 py-1 bg-white/80 text-gray-700 rounded-md text-xs hover:bg-white transition"
            >
              下一张
            </button>
          </div>
        )}
      </div>
    )
  }

  if (noMedia) {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{prompt.title}</h3>
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">{prompt.category}</span>
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{prompt.description}</p>
          <div className="mb-4">
            <div className={`bg-gray-50 rounded-lg p-4 ${!expanded ? 'max-h-40 overflow-hidden' : ''}`}>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{prompt.content}</pre>
            </div>
            {prompt.content.length > 200 && (
              <button onClick={toggleExpanded} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors">
                {expanded ? (<><ChevronUp className="w-4 h-4" />收起</>) : (<><ChevronDown className="w-4 h-4" />展开查看更多</>)}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {prompt.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors cursor-pointer">#{tag}</span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>作者: {prompt.author}</span>
              <span>来源: {prompt.platform || '未知'}</span>
            </div>
            <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button onClick={handleCopy} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${copied ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'}`}>
            {copied ? (<><Check className="w-4 h-4" />已复制</>) : (<><Copy className="w-4 h-4" />复制提示词</>)}
          </button>
          <button
            onClick={handleSourceClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            来源
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="relative h-56 sm:h-60 md:h-56 lg:h-60" style={{ perspective: 1000 }}>
        <div className={`h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? 'rotate-y-180' : ''}`}>
          {renderMedia()}

          <div className="absolute inset-0 bg-white p-4 sm:p-6 overflow-y-auto [backface-visibility:hidden] rotate-y-180">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{prompt.title}</h3>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">{prompt.category}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{prompt.description}</p>
            <div className="mb-4">
              <div className={`bg-gray-50 rounded-lg p-4 ${!expanded ? 'max-h-32 overflow-hidden' : ''}`}>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{prompt.content}</pre>
              </div>
              {prompt.content.length > 200 && (
                <button onClick={toggleExpanded} className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors">
                  {expanded ? (<><ChevronUp className="w-4 h-4" />收起</>) : (<><ChevronDown className="w-4 h-4" />展开查看更多</>)}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors cursor-pointer">#{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>来源: {prompt.platform || '未知'}</span>
              </div>
              <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {!noMedia && (
          <button onClick={toggleFlipped} className="absolute top-3 right-3 z-10 px-2 py-1 bg-white/90 text-gray-800 rounded-md shadow-sm hover:bg-white transition-colors flex items-center gap-1 text-xs">
            <FlipHorizontal className="w-4 h-4" />
            反转
          </button>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-3">
        <button onClick={handleCopy} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${copied ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'}`}>
          {copied ? (<><Check className="w-4 h-4" />已复制</>) : (<><Copy className="w-4 h-4" />复制提示词</>)}
        </button>
        <button
          onClick={handleSourceClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          来源
        </button>
      </div>
    </div>
  )
}
