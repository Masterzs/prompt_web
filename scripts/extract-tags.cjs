#!/usr/bin/env node
/**
 * 从提示词内容中提取关键词，并统一成中文
 */

const fs = require('fs')
const path = require('path')

// 常见关键词中英文映射
const keywordMap = {
  // 类型
  'photography': '摄影',
  'portrait': '人像',
  'landscape': '风景',
  'interior': '室内',
  'exterior': '室外',
  'product': '产品',
  'food': '食物',
  'animal': '动物',
  'character': '角色',
  'fashion': '时尚',
  'nature': '自然',
  'toy': '玩具',
  'vehicle': '车辆',
  'logo': '标志',
  'icon': '图标',
  
  // 风格
  'realistic': '写实',
  'cartoon': '卡通',
  'anime': '动漫',
  '3d': '3D',
  '2d': '2D',
  'watercolor': '水彩',
  'oil painting': '油画',
  'digital art': '数字艺术',
  'sketch': '素描',
  'illustration': '插画',
  
  // 技术
  '8k': '8K',
  '4k': '4K',
  'hd': '高清',
  'professional': '专业',
  'cinematic': '电影级',
  'studio': '工作室',
  'photography': '摄影',
  
  // 主题
  'wedding': '婚礼',
  'business': '商业',
  'medical': '医疗',
  'education': '教育',
  'architecture': '建筑',
  'design': '设计',
  'art': '艺术',
  'creative': '创意',
  'abstract': '抽象',
  'conceptual': '概念'
}

// 常见的中文关键词列表
const chineseKeywords = [
  // 质量/级别
  '照片级', '电影级', '专业级', '8K', '4K', '高清', '超高清', '超精细', '超逼真',
  
  // 风格
  '写实', '写实风格', '卡通', '动漫', '3D', '2D', '水彩', '油画', '素描', 
  '插画', '数字艺术', '中国风', '日式', '韩式', '欧美风', '复古', '现代',
  
  // 技术术语
  'iPhone', '拍摄', '镜头', '焦距', '景深', '光圈', 'ISO', '快门',
  '光线', '灯光', '照明', '阴影', '高光', '反射', '自拍', '合影',
  
  // 对象类型
  '人物', '角色', '动物', '植物', '建筑', '车辆', '物品', '产品', '食物',
  '人像', '肖像', '风景', '室内', '室外', '静物', '玩具', '配饰',
  
  // 场景类型
  '婚礼', '商业', '医疗', '教育', '建筑', '设计', '艺术', '创意', '抽象', '概念',
  
  // 特定描述词
  '第一人称', '第三人称', '俯视', '仰视', '正面', '侧面', '背面'
]

// 从中文文本中提取关键词
function extractChineseKeywords(text) {
  if (!text) return []
  
  const keywords = new Set()
  
  // 直接匹配常见关键词
  chineseKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.add(keyword)
    }
  })
  
  // 提取2-6字的中文词组（排除常见的无意义词）
  const stopWords = ['一张', '一幅', '一个', '这种', '那种', '这个', '那个', '什么', '如何', '怎样']
  const words = text.match(/[\u4e00-\u9fff]{2,6}/g) || []
  
  words.forEach(word => {
    if (word.length >= 2 && 
        word.length <= 6 && 
        !stopWords.includes(word) &&
        !/[的一是在有了和就这不人都在还也而]/g.test(word)) {
      // 只保留有意义的词汇
      if (/[角色动物人物风景建筑产品物品食物]/g.test(word)) {
        keywords.add(word)
      }
    }
  })
  
  return Array.from(keywords).slice(0, 8) // 最多返回8个关键词
}

// 从英文文本中提取关键词
function extractEnglishKeywords(text) {
  if (!text) return []
  
  const keywords = new Set()
  
  // 匹配常见的英文关键词
  const commonKeywords = [
    'photography', 'portrait', 'landscape', 'interior', 'product', 'food',
    'animal', 'character', 'fashion', 'nature', 'toy', 'vehicle', 'logo',
    'realistic', 'cartoon', 'anime', '3d', '2d', 'watercolor', 'sketch',
    'illustration', '8k', '4k', 'hd', 'professional', 'cinematic', 'studio'
  ]
  
  const lowerText = text.toLowerCase()
  commonKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (regex.test(lowerText)) {
      const chinese = keywordMap[keyword] || keyword
      keywords.add(chinese)
    }
  })
  
  return Array.from(keywords)
}

// 从标题中提取关键词
function extractFromTitle(title) {
  if (!title) return []
  
  const keywords = new Set()
  
  // 去除常见无意义词汇
  const stopWords = ['一张', '一幅', '一个', '的', '和', '与', '或', '及', '以及', '生成', '制作', '创建']
  
  // 提取标题中的核心词汇（2-8字）
  const titleWords = title.match(/[\u4e00-\u9fff]{2,8}/g) || []
  
  titleWords.forEach(word => {
    if (word.length >= 2 && 
        word.length <= 8 && 
        !stopWords.includes(word) &&
        !/^[一一个的与或及以及生成制作创建]$/g.test(word)) {
      keywords.add(word)
    }
  })
  
  return Array.from(keywords).slice(0, 5)
}

// 智能提取关键词
function extractTags(item) {
  const tags = new Set()
  
  const content = item.content || ''
  const title = item.title || ''
  const hasChinese = /[\u4e00-\u9fff]/.test(content) || /[\u4e00-\u9fff]/.test(title)
  
  // 从内容提取关键词
  if (hasChinese) {
    // 中文内容优先提取中文关键词
    const chineseTags = extractChineseKeywords(content)
    chineseTags.forEach(tag => {
      // 只保留2-6字的关键词
      if (tag.length >= 2 && tag.length <= 6) {
        tags.add(tag)
      }
    })
    
    // 也提取英文关键词并翻译
    const englishTags = extractEnglishKeywords(content)
    englishTags.forEach(tag => tags.add(tag))
  } else {
    // 英文内容提取并翻译
    const englishTags = extractEnglishKeywords(content)
    englishTags.forEach(tag => tags.add(tag))
  }
  
  // 从标题提取核心词汇（优先）
  if (title) {
    // 提取标题中的2-6字核心词汇
    const titleWords = title.match(/[\u4e00-\u9fff]{2,6}/g) || []
    const stopWords = ['一张', '一幅', '一个', '生成', '制作', '创建', '的', '和', '与', '不同', '视角', '照片']
    
    titleWords.forEach(word => {
      // 清理空格
      const cleanedWord = word.replace(/\s+/g, '')
      
      if (cleanedWord.length >= 2 && 
          cleanedWord.length <= 6 && 
          !stopWords.includes(cleanedWord) &&
          !/^[一一个的与或及以及生成制作创建]$/.test(cleanedWord)) {
        tags.add(cleanedWord)
      }
    })
  }
  
  // 清理过长或无效的关键词
  const filteredTags = Array.from(tags).filter(tag => {
    // 清理空格
    tag = tag.trim().replace(/\s+/g, '')
    
    // 过滤掉过长的关键词（超过6个字）
    if (tag.length > 6) return false
    // 过滤掉少于2个字的关键词
    if (tag.length < 2) return false
    // 过滤掉纯标点或空白
    if (!tag) return false
    // 过滤掉常见的无意义词
    const meaningless = ['一张', '一幅', '一个', '这种', '那种', '生成', '制作', '创建', '可以', '能够', '如何', '怎样']
    if (meaningless.includes(tag)) return false
    // 过滤掉类似句子的关键词（包含太多描述性词汇）
    if (/[身穿搭配佩戴]/g.test(tag) && tag.length > 4) return false
    return true
  })
  
  // 去重并排序（优先保留短的关键词）
  const uniqueTags = Array.from(new Set(filteredTags))
  uniqueTags.sort((a, b) => a.length - b.length)
  
  return uniqueTags.slice(0, 6) // 最多返回6个关键词
}

// 更新数据文件
function updateTags(filePath) {
  console.log(`\n处理文件: ${filePath}`)
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  let updated = 0
  
  for (const item of data) {
    const newTags = extractTags(item)
    
    if (JSON.stringify(item.tags || []) !== JSON.stringify(newTags)) {
      item.tags = newTags
      updated++
      
      if (updated <= 5) {
        console.log(`  ${item.id}: ${item.title}`)
        console.log(`    旧标签: ${(item.tags || []).join(', ') || '(无)'}`)
        console.log(`    新标签: ${newTags.join(', ')}`)
      }
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`\n完成! 更新了 ${updated}/${data.length} 条数据的标签`)
  
  return { total: data.length, updated }
}

// 主函数
function main() {
  console.log('开始提取和更新关键词标签...\n')
  
  const files = [
    path.join(__dirname, '../src/data/gpt4o-prompts.json'),
    path.join(__dirname, '../src/data/banana-prompts.json'),
    path.join(__dirname, '../src/data/prompts.json')
  ]
  
  let totalUpdated = 0
  let totalItems = 0
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const result = updateTags(file)
      totalUpdated += result.updated
      totalItems += result.total
    }
  })
  
  console.log(`\n总计: 更新了 ${totalUpdated}/${totalItems} 条数据的标签`)
}

main()

