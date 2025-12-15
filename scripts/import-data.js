const fs = require('fs')
const path = require('path')

/**
 * 数据导入脚本
 * 将CSV或JSON格式的数据转换为应用可用的格式
 */

// 支持的字段映射
const FIELD_MAPPING = {
  // 标准字段
  'id': ['id', 'ID', '编号'],
  'title': ['title', '标题', 'name', '名称'],
  'content': ['content', '内容', 'prompt', '提示词', 'text'],
  'description': ['description', '描述', '简介', 'summary'],
  'platform': ['platform', '平台', 'source', '来源'],
  'category': ['category', '分类', '类型', 'type'],
  'tags': ['tags', '标签', 'tag', 'keywords'],
  'sourceUrl': ['sourceUrl', 'source_url', '链接', 'url', 'link'],
  'author': ['author', '作者', 'creator', '创建者'],
  'createdAt': ['createdAt', 'created_at', '创建时间', 'date'],
  'updatedAt': ['updatedAt', 'updated_at', '更新时间'],
  'usageCount': ['usageCount', 'usage_count', '使用次数', 'count'],
  'rating': ['rating', '评分', 'score'],
  'difficulty': ['difficulty', '难度', 'level'],
  'language': ['language', '语言', 'lang']
}

/**
 * 自动检测字段映射
 */
function detectFieldMapping(data) {
  const mapping = {}
  const fields = Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : []
  
  for (const [standardField, possibleFields] of Object.entries(FIELD_MAPPING)) {
    const foundField = fields.find(field => 
      possibleFields.includes(field.toLowerCase()) || 
      possibleFields.includes(field)
    )
    if (foundField) {
      mapping[foundField] = standardField
    }
  }
  
  return mapping
}

/**
 * 转换数据格式
 */
function transformData(data, mapping) {
  return data.map(item => {
    const transformed = {
      id: generateId(),
      title: '',
      content: '',
      description: '',
      platform: 'other',
      category: 'other',
      tags: [],
      sourceUrl: '',
      author: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      rating: 0,
      difficulty: 'intermediate',
      language: 'zh'
    }
    
    // 根据映射转换数据
    for (const [originalField, standardField] of Object.entries(mapping)) {
      if (item[originalField] !== undefined && item[originalField] !== null) {
        let value = item[originalField]
        
        // 特殊处理某些字段
        switch (standardField) {
          case 'tags':
            if (typeof value === 'string') {
              value = value.split(/[,，;；|]/).map(tag => tag.trim()).filter(tag => tag)
            } else if (Array.isArray(value)) {
              value = value.map(tag => String(tag).trim()).filter(tag => tag)
            }
            break
          case 'platform':
            value = normalizePlatform(value)
            break
          case 'category':
            value = normalizeCategory(value)
            break
          case 'difficulty':
            value = normalizeDifficulty(value)
            break
          case 'language':
            value = normalizeLanguage(value)
            break
          case 'usageCount':
          case 'rating':
            value = Number(value) || 0
            break
          case 'createdAt':
          case 'updatedAt':
            value = new Date(value).toISOString()
            break
          default:
            value = String(value).trim()
        }
        
        transformed[standardField] = value
      }
    }
    
    return transformed
  })
}

/**
 * 标准化平台名称
 */
function normalizePlatform(platform) {
  const platformMap = {
    'twitter': 'twitter',
    '推特': 'twitter',
    'youtube': 'youtube',
    '油管': 'youtube',
    'github': 'github',
    'reddit': 'reddit',
    'discord': 'discord',
    'wechat': 'wechat',
    '微信': 'wechat',
    'weibo': 'weibo',
    '微博': 'weibo',
    'zhihu': 'zhihu',
    '知乎': 'zhihu',
    'xiaohongshu': 'xiaohongshu',
    '小红书': 'xiaohongshu',
    'douyin': 'douyin',
    '抖音': 'douyin',
    'tiktok': 'tiktok',
    'bilibili': 'bilibili',
    'b站': 'bilibili',
    'other': 'other',
    '其他': 'other'
  }
  
  return platformMap[platform.toLowerCase()] || 'other'
}

/**
 * 标准化分类名称
 */
function normalizeCategory(category) {
  const categoryMap = {
    'writing': 'writing',
    '写作': 'writing',
    '文案': 'writing',
    'drawing': 'drawing',
    '绘画': 'drawing',
    '绘图': 'drawing',
    'ai绘画': 'drawing',
    'script': 'script',
    '剧本': 'script',
    '脚本': 'script',
    'code': 'code',
    '代码': 'code',
    '编程': 'code',
    'marketing': 'marketing',
    '营销': 'marketing',
    '推广': 'marketing',
    'education': 'education',
    '教育': 'education',
    '学习': 'education',
    'business': 'business',
    '商业': 'business',
    '创业': 'business',
    'creative': 'creative',
    '创意': 'creative',
    'productivity': 'productivity',
    '效率': 'productivity',
    '工具': 'productivity',
    'other': 'other',
    '其他': 'other'
  }
  
  return categoryMap[category.toLowerCase()] || 'other'
}

/**
 * 标准化难度等级
 */
function normalizeDifficulty(difficulty) {
  const difficultyMap = {
    'beginner': 'beginner',
    '初级': 'beginner',
    '入门': 'beginner',
    'easy': 'beginner',
    'intermediate': 'intermediate',
    '中级': 'intermediate',
    '进阶': 'intermediate',
    'medium': 'intermediate',
    'advanced': 'advanced',
    '高级': 'advanced',
    '专业': 'advanced',
    'hard': 'advanced'
  }
  
  return difficultyMap[difficulty.toLowerCase()] || 'intermediate'
}

/**
 * 标准化语言代码
 */
function normalizeLanguage(language) {
  const languageMap = {
    'zh': 'zh',
    '中文': 'zh',
    'chinese': 'zh',
    'cn': 'zh',
    'en': 'en',
    '英文': 'en',
    'english': 'en',
    'ja': 'ja',
    '日文': 'ja',
    'japanese': 'ja',
    'ko': 'ko',
    '韩文': 'ko',
    'korean': 'ko',
    'other': 'other',
    '其他': 'other'
  }
  
  return languageMap[language.toLowerCase()] || 'zh'
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 读取CSV文件
 */
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  })
}

/**
 * 读取JSON文件
 */
function readJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 验证数据
 */
function validateData(data) {
  const errors = []
  
  data.forEach((item, index) => {
    if (!item.title || !item.title.trim()) {
      errors.push(`第${index + 1}条数据缺少标题`)
    }
    if (!item.content || !item.content.trim()) {
      errors.push(`第${index + 1}条数据缺少内容`)
    }
    if (item.sourceUrl && !isValidUrl(item.sourceUrl)) {
      errors.push(`第${index + 1}条数据的sourceUrl格式不正确`)
    }
  })
  
  return errors
}

/**
 * 验证URL格式
 */
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('用法: node import-data.js <输入文件> <输出文件> [选项]')
    console.log('选项:')
    console.log('  --validate  只验证数据不导出')
    console.log('  --format    指定输入格式 (json|csv)，自动检测')
    process.exit(1)
  }
  
  const inputFile = args[0]
  const outputFile = args[1]
  const options = {
    validateOnly: args.includes('--validate'),
    format: args.find(arg => arg.startsWith('--format='))?.split('=')[1]
  }
  
  try {
    // 检测文件格式
    const ext = path.extname(inputFile).toLowerCase()
    const format = options.format || (ext === '.csv' ? 'csv' : 'json')
    
    console.log(`正在读取 ${inputFile}...`)
    
    // 读取数据
    let data
    if (format === 'csv') {
      data = readCSV(inputFile)
    } else {
      data = readJSON(inputFile)
    }
    
    console.log(`读取到 ${data.length} 条数据`)
    
    // 检测字段映射
    const mapping = detectFieldMapping(data)
    console.log('检测到字段映射:', mapping)
    
    // 转换数据
    const transformedData = transformData(data, mapping)
    
    // 验证数据
    const errors = validateData(transformedData)
    if (errors.length > 0) {
      console.log('数据验证错误:')
      errors.forEach(error => console.log(`  - ${error}`))
      if (!options.validateOnly) {
        console.log('是否继续导出？(y/N)')
        // 这里可以添加用户输入处理
      }
    }
    
    if (options.validateOnly) {
      console.log('数据验证完成')
      return
    }
    
    // 导出数据
    console.log(`正在导出到 ${outputFile}...`)
    fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2))
    
    console.log(`✅ 成功导出 ${transformedData.length} 条数据到 ${outputFile}`)
    
    // 生成统计信息
    const stats = {
      total: transformedData.length,
      platforms: {},
      categories: {},
      tags: {},
      languages: {},
      difficulties: {}
    }
    
    transformedData.forEach(item => {
      stats.platforms[item.platform] = (stats.platforms[item.platform] || 0) + 1
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1
      stats.languages[item.language] = (stats.languages[item.language] || 0) + 1
      stats.difficulties[item.difficulty] = (stats.difficulties[item.difficulty] || 0) + 1
      
      item.tags.forEach(tag => {
        stats.tags[tag] = (stats.tags[tag] || 0) + 1
      })
    })
    
    console.log('\n📊 数据统计:')
    console.log(`  平台分布:`, stats.platforms)
    console.log(`  分类分布:`, stats.categories)
    console.log(`  语言分布:`, stats.languages)
    console.log(`  难度分布:`, stats.difficulties)
    console.log(`  热门标签:`, Object.entries(stats.tags).sort(([,a], [,b]) => b - a).slice(0, 10))
    
  } catch (error) {
    console.error('❌ 处理失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = {
  transformData,
  detectFieldMapping,
  normalizePlatform,
  normalizeCategory,
  normalizeDifficulty,
  normalizeLanguage
}