#!/usr/bin/env node
/**
 * 批量更新JSON文件中的sourceUrl字段，从完整URL提取域名
 * 将sourceUrl更新为只显示域名（例如：x.com, github.com等）
 */

const fs = require('fs')
const path = require('path')

// 从URL中提取域名
function extractDomain(url) {
  if (!url || typeof url !== 'string') {
    return url
  }
  
  try {
    // 处理完整URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    }
    
    // 如果已经是域名格式，直接返回
    if (url.includes('.') && !url.includes(' ')) {
      return url.replace('www.', '')
    }
    
    return url
  } catch (error) {
    console.warn(`无法解析URL: ${url}`, error.message)
    return url
  }
}

// 更新单个JSON文件
function updateJsonFile(filePath) {
  console.log(`\n处理文件: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.warn(`文件不存在: ${filePath}`)
    return { updated: 0, total: 0 }
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(content)
  
  if (!Array.isArray(data)) {
    console.warn(`文件格式错误，期望数组: ${filePath}`)
    return { updated: 0, total: 0 }
  }
  
  let updated = 0
  let total = data.length
  
  for (const item of data) {
    if (item.sourceUrl) {
      const oldUrl = item.sourceUrl
      const newDomain = extractDomain(oldUrl)
      
      if (newDomain !== oldUrl) {
        item.sourceUrl = newDomain
        updated++
        console.log(`  ✓ 更新: ${oldUrl} -> ${newDomain}`)
      }
    }
  }
  
  // 写回文件
  if (updated > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`  ✅ 已更新 ${updated}/${total} 条记录`)
  } else {
    console.log(`  ℹ️  无需更新 (${total} 条记录)`)
  }
  
  return { updated, total }
}

// 主函数
function main() {
  const dataDir = path.join(__dirname, '../src/data')
  const jsonFiles = [
    'banana-prompts.json',
    'gpt4o-prompts.json',
    'prompts.json'
  ]
  
  console.log('开始批量更新sourceUrl字段...\n')
  console.log('=' .repeat(60))
  
  let totalUpdated = 0
  let totalRecords = 0
  
  for (const filename of jsonFiles) {
    const filePath = path.join(dataDir, filename)
    const result = updateJsonFile(filePath)
    totalUpdated += result.updated
    totalRecords += result.total
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ 完成！`)
  console.log(`   总记录数: ${totalRecords}`)
  console.log(`   更新数量: ${totalUpdated}`)
  console.log(`   未更新: ${totalRecords - totalUpdated}`)
}

// 运行
if (require.main === module) {
  main()
}

module.exports = { extractDomain, updateJsonFile }

