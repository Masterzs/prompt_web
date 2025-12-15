import { useState, useEffect } from 'react'
import Header from './components/Header'
import SettingsModal from './components/SettingsModal'
import SearchBar from './components/SearchBar'
import TagFilter from './components/TagFilter'
import PromptCard from './components/PromptCard'
import { Prompt } from './types'
import { searchPrompts } from './utils/search'
import promptsData from './data/prompts.json'
import bananaData from './data/banana-prompts.json'
import gpt4oData from './data/gpt4o-prompts.json'

function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = localStorage.getItem('pageSize')
    return saved ? Number(saved) || 100 : 100
  })
  const [openSettings, setOpenSettings] = useState(false)

  useEffect(() => {
    // 初始化数据
    // 合并主数据与 banana 扩展数据，按 id 去重
    const merged = [...(promptsData as Prompt[]), ...(bananaData as Prompt[]), ...(gpt4oData as Prompt[])]
    const uniqueData = Array.from(new Map(merged.map(item => [item.id, item])).values())
    
    // 按日期倒序排序（最新的在前）
    const data = uniqueData.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || '1970-01-01')
      const dateB = new Date(b.createdAt || b.updatedAt || '1970-01-01')
      return dateB.getTime() - dateA.getTime()
    })
    
    setPrompts(data)
    setFilteredPrompts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    // 搜索和筛选逻辑
    let result = prompts

    // 分类筛选
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category))
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      result = searchPrompts(result, searchQuery)
    }

    setFilteredPrompts(result)
    setPage(1)
  }, [prompts, selectedCategories, searchQuery])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const total = filteredPrompts.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const pagedPrompts = filteredPrompts.slice(start, end)

  // 生成分页页码列表：总共展示最多 6 个可点击页码，当前页居中滑动窗口，首尾保留，缺口显示省略号
  const pageNumbers = (() => {
    const maxVisible = 6
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const middleCount = maxVisible - 2 // 首尾各一个，剩余中间
    let start = Math.max(2, page - Math.floor(middleCount / 2))
    let end = start + middleCount - 1

    if (end >= totalPages) {
      end = totalPages - 1
      start = end - middleCount + 1
    }

    const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    const raw = [1, ...middle, totalPages]

    const result: Array<number | string> = []
    for (let i = 0; i < raw.length; i++) {
      const current = raw[i]
      const prev = raw[i - 1]
      if (i > 0 && prev !== undefined && current - prev > 1) {
        result.push('...')
      }
      result.push(current)
    }
    return result
  })()

  const Pagination = ({ showStats = true }: { showStats?: boolean }) => (
    <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
      {showStats && (
        <div className="text-sm text-gray-600">共 {total} 条 · 每页 {pageSize} · 第 {page}/{totalPages} 页</div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-3 py-1.5 rounded-md text-sm ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
        >上一页</button>

        {pageNumbers.map((p, idx) => (
          p === '...'
            ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">...</span>
            : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`px-3 py-1.5 rounded-md text-sm border ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            )
        ))}

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1.5 rounded-md text-sm ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
        >下一页</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setOpenSettings(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} placeholder="搜索提示词关键词、类型或来源..." />
        </div>

        {/* 分类筛选 */}
        <div className="mb-8">
          <TagFilter 
            prompts={prompts}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />
        </div>

        {/* 结果统计 */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            找到 {filteredPrompts.length} 个提示词
            {selectedCategories.length > 0 && (
              <span className="ml-2">
                (已选择分类: {selectedCategories.map(c => {
                  const categoryMap: Record<string, string> = {
                    script: '剧本', writing: '写作', marketing: '营销', code: '代码',
                    education: '教育', video: '视频', drawing: '绘图', business: '商务',
                    productivity: '效率', creative: '创意', other: '其他'
                  }
                  return categoryMap[c] || c
                }).join(', ')})
              </span>
            )}
          </p>
        </div>

        {/* 顶部分页（仅页码，不显示统计） */}
        {!loading && filteredPrompts.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Pagination showStats={false} />
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* 提示词卡片网格（分页） */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedPrompts.map((prompt, idx) => (
                <PromptCard key={prompt.id} prompt={prompt} index={start + idx} />
              ))}
            </div>
            {/* 分页控件 */}
            <Pagination />
          </>
        )}

        {/* 空状态 */}
        {!loading && filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V19a2 2 0 01-2 2H9a2 2 0 01-2-2V6.306" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关提示词</h3>
            <p className="text-gray-500">尝试调整搜索关键词或选择其他标签</p>
          </div>
        )}
      </main>
      <SettingsModal
        open={openSettings}
        pageSize={pageSize}
        onClose={() => setOpenSettings(false)}
        onSave={(size) => {
          const next = Math.min(500, Math.max(10, size))
          setPageSize(next)
          localStorage.setItem('pageSize', String(next))
        }}
      />
    </div>
  )
}

export default App
