import { useState } from 'react'
import { Prompt } from '../types'

interface TagFilterProps {
  prompts: Prompt[]
  selectedCategories: string[]
  onCategoryToggle: (category: string) => void
}

// 中文分类映射
const categoryMap: Record<string, string> = {
  script: '剧本',
  writing: '写作',
  marketing: '营销',
  code: '代码',
  education: '教育',
  video: '视频',
  drawing: '绘图',
  business: '商务',
  productivity: '效率',
  creative: '创意',
  other: '其他'
}

// 分类顺序
const categoryOrder = ['drawing', 'writing', 'script', 'code', 'marketing', 'education', 'video', 'business', 'productivity', 'creative', 'other']

export default function TagFilter({ prompts, selectedCategories, onCategoryToggle }: TagFilterProps) {
  // 统计每个分类的数量（基于所有 prompts，不是筛选后的）
  const categoryCounts = categoryOrder.reduce((acc, category) => {
    const count = prompts.filter(p => p.category === category).length
    if (count > 0) {
      acc[category] = count
    }
    return acc
  }, {} as Record<string, number>)

  if (Object.keys(categoryCounts).length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {categoryOrder.map((category) => {
        const count = categoryCounts[category]
        if (!count) return null
        
        const isSelected = selectedCategories.includes(category)
        return (
          <button
            key={category}
            onClick={() => onCategoryToggle(category)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
              isSelected
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {categoryMap[category] || category}
            <span className="ml-1.5 text-[11px] text-gray-500">({count})</span>
            {isSelected && (
              <span className="ml-1.5 text-primary-600">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2.121l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                </svg>
              </span>
            )}
          </button>
        )
      })}
      
      {selectedCategories.length > 0 && (
        <button
          onClick={() => {
            selectedCategories.forEach(category => onCategoryToggle(category))
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          清除筛选
        </button>
      )}
    </div>
  )
}
