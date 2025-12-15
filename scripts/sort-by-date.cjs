#!/usr/bin/env node
/**
 * 按日期倒序排序所有数据文件
 */

const fs = require('fs')
const path = require('path')

// 按日期排序（倒序，最新的在前）
function sortByDate(data, dateField = 'createdAt') {
  return data.sort((a, b) => {
    const dateA = new Date(a[dateField] || a.updatedAt || '1970-01-01')
    const dateB = new Date(b[dateField] || b.updatedAt || '1970-01-01')
    
    // 倒序：最新的在前
    return dateB - dateA
  })
}

// 更新数据文件
function sortFile(filePath) {
  console.log(`\n处理文件: ${filePath}`)
  
  if (!fs.existsSync(filePath)) {
    console.log(`  文件不存在，跳过`)
    return { total: 0, sorted: 0 }
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const originalOrder = data.map((item, index) => ({ id: item.id, index }))
  
  // 按日期排序
  const sortedData = sortByDate([...data])
  
  // 检查是否有变化
  const hasChanged = JSON.stringify(originalOrder) !== JSON.stringify(
    sortedData.map((item, index) => ({ id: item.id, index }))
  )
  
  if (hasChanged) {
    fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2), 'utf8')
    console.log(`  已排序: ${sortedData.length} 条数据`)
    
    // 显示前3条和后3条的日期
    console.log(`  前3条日期:`)
    sortedData.slice(0, 3).forEach(item => {
      const date = item.createdAt || item.updatedAt || '无日期'
      console.log(`    ${item.id}: ${date}`)
    })
    console.log(`  后3条日期:`)
    sortedData.slice(-3).forEach(item => {
      const date = item.createdAt || item.updatedAt || '无日期'
      console.log(`    ${item.id}: ${date}`)
    })
  } else {
    console.log(`  数据已按日期排序，无需更新`)
  }
  
  return { total: sortedData.length, sorted: hasChanged ? sortedData.length : 0 }
}

// 主函数
function main() {
  console.log('开始按日期倒序排序数据...\n')
  
  const files = [
    path.join(__dirname, '../src/data/gpt4o-prompts.json'),
    path.join(__dirname, '../src/data/banana-prompts.json'),
    path.join(__dirname, '../src/data/prompts.json')
  ]
  
  let totalSorted = 0
  let totalItems = 0
  
  files.forEach(file => {
    const result = sortFile(file)
    totalSorted += result.sorted
    totalItems += result.total
  })
  
  console.log(`\n总计: 排序了 ${totalSorted}/${totalItems} 条数据`)
  console.log('完成！')
}

main()

