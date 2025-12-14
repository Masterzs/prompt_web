import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { validateSearchQuery } from '../utils/validator'
import { antiCrawlCheck } from '../utils/anti-crawl'
import { errorHandler } from '../utils/error-handler'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = "搜索..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string>('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSearchTime = useRef<number>(0)

  // 防抖处理
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (!query.trim()) {
      return
    }

    debounceTimer.current = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleSearch = (searchQuery: string) => {
    try {
      // 防爬虫检查
      const crawlCheck = antiCrawlCheck()
      if (!crawlCheck.allowed) {
        setError('请求过于频繁，请稍后再试')
        return
      }

      // 频率限制（最小间隔 500ms）
      const now = Date.now()
      if (now - lastSearchTime.current < 500) {
        return
      }
      lastSearchTime.current = now

      // 验证搜索查询
      const validation = validateSearchQuery(searchQuery)
      
      if (validation.valid) {
        setError('')
        onSearch(validation.cleaned)
      } else {
        setError(validation.error || '搜索关键词无效')
        errorHandler.logError(new Error(validation.error || 'Invalid search query'))
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      errorHandler.logError(error)
      setError('搜索时发生错误，请重试')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // 长度限制
    if (value.length > 200) {
      setError('搜索关键词不能超过200个字符')
      return
    }
    
    setQuery(value)
    setError('')
  }

  const handleClear = () => {
    setQuery('')
    setError('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          maxLength={200}
          className={`block w-full pl-10 pr-10 py-3 border rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 text-base ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          }`}
          placeholder={placeholder}
          aria-label="搜索提示词"
          aria-invalid={!!error}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
              aria-label="清除搜索"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </form>
  )
}