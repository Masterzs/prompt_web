import { useEffect, useState } from 'react'
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, FlipHorizontal } from 'lucide-react'
import { copyToClipboard } from '../utils/copy'
import { Prompt } from '../types'

interface PromptCardProps {
  prompt: Prompt
  index?: number
}

export default function PromptCard({ prompt, index = 0 }: PromptCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  // 平台名称映射（显示友好名称）
  const platformNameMap: Record<string, string> = {
    'twitter': 'Twitter/X',
    'youtube': 'YouTube',
    'github': 'GitHub',
    'reddit': 'Reddit',
    'discord': 'Discord',
    'wechat': '微信',
    'weibo': '微博',
    'zhihu': '知乎',
    'xiaohongshu': '小红书',
    'gpt4o': 'GPT-4o',
    'other': '其他'
  }

  // 获取来源显示文本：优先显示域名，否则显示平台友好名称
  const getSourceDisplay = () => {
    if (prompt.sourceUrl && prompt.sourceUrl !== '') {
      return prompt.sourceUrl
    }
    return platformNameMap[prompt.platform] || prompt.platform || '未知'
  }

  const categoryImageMap: Record<string, string> = {
    writing: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=1200&auto=format&fit=crop',
    drawing: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop',
    script: 'https://images.unsplash.com/photo-1517511620798-cec17d828004?q=80&w=1200&auto=format&fit=crop',
    video: 'https://images.unsplash.com/photo-1517519014922-8d8d5dfb8f78?q=80&w=1200&auto=format&fit=crop',
    marketing: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop',
    education: 'https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?q=80&w=1200&auto=format&fit=crop',
    business: 'https://images.unsplash.com/photo-1556767576-cffae3be7d96?q=80&w=1200&auto=format&fit=crop',
    creative: 'https://images.unsplash.com/photo-1485827404703-89b55f04f17b?q=80&w=1200&auto=format&fit=crop',
    productivity: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
    other: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=1200&auto=format&fit=crop',
    // 中文分类兜底
    写作: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=1200&auto=format&fit=crop',
    绘图: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop',
    剧本: 'https://images.unsplash.com/photo-1517511620798-cec17d828004?q=80&w=1200&auto=format&fit=crop',
    视频: 'https://images.unsplash.com/photo-1517519014922-8d8d5dfb8f78?q=80&w=1200&auto=format&fit=crop',
    电商: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop',
    社交媒体: 'https://images.unsplash.com/photo-1551434677-5f53eb0b3d87?q=80&w=1200&auto=format&fit=crop'
  }

  // 解析媒体文件路径
  // location 支持多种格式：
  // 1. 完整URL: http://... 或 https://...
  // 2. 绝对路径: /assets/image/... (会自动加上BASE_URL)
  // 3. 相对路径（含子目录）: gpt4o/filename.jpg -> /assets/image/gpt4o/filename.jpg
  // 4. 文件名: filename.jpg -> /assets/image/filename.jpg
  const resolveMediaPath = (file: string, mediaType: 'image' | 'video'): string => {
    if (!file) return ''
    
    // 完整URL，直接返回
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file
    }
    
    // 获取Vite的base路径（GitHub Pages会自动包含仓库名）
    const baseUrl = import.meta.env.BASE_URL || '/'
    // 确保baseUrl以/结尾
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
    
    // 绝对路径（以/开头），需要加上BASE_URL
    if (file.startsWith('/')) {
      // 去掉开头的/，然后拼接
      return normalizedBase + file.slice(1)
    }
    
    // 相对路径，根据mediaType添加基础路径
    const assetsPath = mediaType === 'video' ? 'assets/video/' : 'assets/image/'
    return normalizedBase + assetsPath + file
  }

  const mediaFiles = prompt.location ?? []
  const imageFiles = mediaFiles.filter(file => /\.(png|jpe?g|webp|gif|avif)$/i.test(file))
  const videoFiles = mediaFiles.filter(file => /\.(mp4|webm|mov|mkv)$/i.test(file))

  const resolvedImages = imageFiles.map(file => resolveMediaPath(file, 'image'))
  const resolvedVideos = videoFiles.map(file => resolveMediaPath(file, 'video'))

  // 处理 imageUrl 字段（JSON数据中的硬编码路径也需要加上BASE_URL）
  const resolvedImageUrl = prompt.imageUrl ? resolveMediaPath(prompt.imageUrl, 'image') : null
  const fallbackImage = resolvedImageUrl || categoryImageMap[prompt.category] || categoryImageMap.other
  const displayImages = resolvedImages.length > 0 && resolvedImages[0]
    ? resolvedImages
    : Array.from(new Set([fallbackImage].filter(Boolean)))
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
    try {
      await copyToClipboard(prompt.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleSourceClick = () => {
    // 添加来源点击统计
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'prompt_source',
        event_label: prompt.platform,
        value: 1
      })
    }
    window.open(prompt.sourceUrl, '_blank', 'noopener,noreferrer')
  }

  // 统一的展开/收起处理函数
  const handleExpand = () => {
    setExpanded(prev => !prev)
  }

  const toggleFlipped = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setFlipped(prev => !prev)
  }

  const renderMedia = () => {
    if (hasVideo) {
      const videoSrc = resolvedVideos[0]
      return (
        <div 
          className="absolute inset-0 [backface-visibility:hidden]"
          style={{
            touchAction: 'pan-y pan-x',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <video
            className="w-full h-full object-cover"
            src={videoSrc}
            controls
            loop
            muted
            playsInline
            poster={displayImages[0]}
            style={{
              touchAction: 'pan-y pan-x',
              pointerEvents: 'auto'
            }}
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

    const handleImageError = () => {
      const failedSrc = images[currentImage]
      setImages(prev => {
        const next = prev.filter((src, idx) => idx !== currentImage && src !== failedSrc)
        if (next.length > 0) return Array.from(new Set(next))
        const fallback = Array.from(
          new Set(
            [categoryImageMap[prompt.category], categoryImageMap.other].filter(
              (v): v is string => Boolean(v)
            )
          )
        )
        return fallback.length > 0 ? fallback : []
      })
      setCurrentImage(0)
    }

    return (
      <div 
        className="absolute inset-0 [backface-visibility:hidden]"
        style={{
          touchAction: 'pan-y pan-x',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {coverImage && (
          <img
            src={coverImage}
            alt={prompt.title}
            className="w-full h-full object-cover"
            loading={isHero ? 'eager' : 'lazy'}
            fetchPriority={isHero ? 'high' : 'low'}
            decoding="async"
            draggable="false"
            onError={handleImageError}
            onDragStart={(e) => e.preventDefault()}
            style={{
              touchAction: 'pan-y pan-x',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'auto',
              WebkitTouchCallout: 'none'
            }}
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
            <div 
              className={`bg-gray-50 rounded-lg p-4 ${!expanded ? 'max-h-40 overflow-hidden' : ''}`}
              style={{
                userSelect: 'text',
                WebkitUserSelect: 'text',
                MozUserSelect: 'text',
                msUserSelect: 'text'
              }}
            >
              <pre 
                className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed"
                style={{
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text',
                  WebkitTouchCallout: 'default'
                }}
              >
                {prompt.content}
              </pre>
            </div>
            {prompt.content.length > 200 && (
              <div
                className="mt-3"
                style={{
                  touchAction: 'none',
                  position: 'relative',
                  zIndex: 100,
                  pointerEvents: 'auto'
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleExpand()
                }}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleExpand()
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleExpand()
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium relative ${
                    expanded 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 border border-blue-200'
                  }`}
                  style={{ 
                    touchAction: 'none', 
                    minHeight: '48px',
                    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'auto',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    cursor: 'pointer',
                    display: 'block',
                    width: '100%',
                    margin: 0,
                    border: '1px solid',
                    position: 'relative',
                    // 确保整个按钮区域都可以点击
                    WebkitTouchCallout: 'none',
                    // 添加伪元素覆盖整个区域
                    isolation: 'isolate'
                  }}
                >
                  {/* 添加一个绝对定位的透明层，确保整个按钮区域都可以点击 */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1,
                      pointerEvents: 'auto',
                      touchAction: 'none'
                    }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%'
                    }}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="w-5 h-5" />
                        <span>收起内容</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        <span>展开查看更多</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
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
              <span>来源: {getSourceDisplay()}</span>
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
      <div 
        className="relative h-56 sm:h-60 md:h-56 lg:h-60" 
        style={{ 
          perspective: 1000,
          touchAction: 'pan-y pan-x'
        }}
      >
        <div 
          className={`h-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? 'rotate-y-180' : ''}`}
          style={{
            touchAction: 'pan-y pan-x'
          }}
        >
          {renderMedia()}

          <div 
            className="absolute inset-0 bg-white p-4 sm:p-6 overflow-y-auto [backface-visibility:hidden] rotate-y-180" 
            style={{ 
              zIndex: 2, 
              pointerEvents: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y pinch-zoom'
            }}
            onTouchStart={(e) => {
              // 如果触摸目标是按钮或其父元素，完全阻止事件传播
              const target = e.target as HTMLElement
              const buttonContainer = target.closest('[style*="z-index: 100"]')
              const button = target.closest('button')
              // 如果是文本内容区域（pre、p、h3、span等），允许文本选择，不阻止事件
              const isTextContent = target.closest('pre') || target.closest('p') || target.closest('h3') || target.closest('.text-gray-800')
              if (isTextContent) {
                // 允许文本选择，不阻止事件
                return
              }
              if (button || buttonContainer) {
                e.stopPropagation()
                e.preventDefault()
                // 让按钮自己处理
                return false
              }
            }}
            onTouchMove={(e) => {
              // 如果触摸目标是按钮区域，完全阻止滚动
              const target = e.target as HTMLElement
              const buttonContainer = target.closest('[style*="z-index: 100"]')
              const button = target.closest('button')
              // 如果是文本内容区域，允许滚动和文本选择
              const isTextContent = target.closest('pre') || target.closest('p') || target.closest('h3') || target.closest('.text-gray-800')
              if (isTextContent) {
                // 允许文本选择，不阻止事件
                return
              }
              if (button || buttonContainer) {
                e.preventDefault()
                e.stopPropagation()
                return false
              }
            }}
            onTouchEnd={(e) => {
              // 如果触摸目标是按钮区域，阻止事件传播
              const target = e.target as HTMLElement
              const buttonContainer = target.closest('[style*="z-index: 100"]')
              const button = target.closest('button')
              // 如果是文本内容区域，允许文本选择
              const isTextContent = target.closest('pre') || target.closest('p') || target.closest('h3') || target.closest('.text-gray-800')
              if (isTextContent) {
                // 允许文本选择，不阻止事件
                return
              }
              if (button || buttonContainer) {
                e.stopPropagation()
                e.preventDefault()
                return false
              }
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{prompt.title}</h3>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap">{prompt.category}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{prompt.description}</p>
            <div className="mb-4">
              <div 
                className={`bg-gray-50 rounded-lg p-4 ${!expanded ? 'max-h-32 overflow-hidden' : ''}`}
                style={{
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text'
                }}
              >
                <pre 
                  className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed"
                  style={{
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    MozUserSelect: 'text',
                    msUserSelect: 'text',
                    WebkitTouchCallout: 'default'
                  }}
                >
                  {prompt.content}
                </pre>
              </div>
              {prompt.content.length > 200 && (
                <div
                  className="mt-3"
                  style={{
                    touchAction: 'none',
                    position: 'relative',
                    zIndex: 100,
                    pointerEvents: 'auto'
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleExpand()
                  }}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleExpand()
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleExpand()
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium relative ${
                      expanded 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 border border-blue-200'
                    }`}
                    style={{ 
                      touchAction: 'none', 
                      minHeight: '48px',
                      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)',
                      pointerEvents: 'auto',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      cursor: 'pointer',
                      display: 'block',
                      width: '100%',
                      margin: 0,
                      border: '1px solid',
                      position: 'relative',
                      // 确保整个按钮区域都可以点击
                      WebkitTouchCallout: 'none',
                      // 添加伪元素覆盖整个区域
                      isolation: 'isolate'
                    }}
                  >
                    {/* 添加一个绝对定位的透明层，确保整个按钮区域都可以点击 */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                        pointerEvents: 'auto',
                        touchAction: 'none'
                      }}
                      aria-hidden="true"
                    />
                    <span
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%'
                      }}
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          <span>收起内容</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          <span>展开查看更多</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
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
          <button 
            onClick={toggleFlipped}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFlipped(e)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            className="absolute top-3 right-3 z-20 px-3 py-2 bg-white/90 text-gray-800 rounded-md shadow-sm hover:bg-white active:bg-white transition-colors flex items-center gap-1 text-xs touch-manipulation"
            style={{ touchAction: 'manipulation', minHeight: '44px', minWidth: '44px', WebkitTapHighlightColor: 'transparent' }}
          >
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
