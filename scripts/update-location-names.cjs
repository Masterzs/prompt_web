#!/usr/bin/env node
/**
 * 批量更新现有数据的 location 字段和文件名，以匹配新的命名规则
 * 格式: {source}/{id}-{type}-{index}.{ext}
 */

const fs = require('fs')
const path = require('path')
const { generateMediaFilename, getExtension } = require('./utils/media-helper.cjs')

// 更新 gpt4o 数据
function updateGpt4oData() {
  const file = path.join(__dirname, '../src/data/gpt4o-prompts.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const imageDir = path.join(__dirname, '../public/assets/image/gpt4o')
  
  let updated = 0
  let renamed = 0
  
  for (const item of data) {
    if (!item.location || !Array.isArray(item.location) || item.location.length === 0) {
      continue
    }
    
    const newLocation = []
    let index = 1
    
    for (const oldPath of item.location) {
      // 解析旧路径: gpt4o/gpt4o_001-cover.jpeg 或 gpt4o/gpt4o_002-image1.jpeg
      const filename = oldPath.includes('/') ? oldPath.split('/').pop() : oldPath
      const ext = getExtension(filename)
      
      // 判断类型
      let type = 'cover'
      if (filename.includes('-image')) {
        type = 'image'
        // 从 image1, image2 等提取索引
        const match = filename.match(/image(\d+)/)
        if (match) {
          index = parseInt(match[1], 10)
        }
      } else if (filename.includes('-cover')) {
        type = 'cover'
        index = 1
      }
      
      // 生成新文件名
      const newFilename = generateMediaFilename({
        source: 'gpt4o',
        id: item.id,
        type,
        index,
        ext
      })
      
      newLocation.push(newFilename)
      
      // 重命名文件
      const oldFilePath = path.join(imageDir, filename)
      const newFilePath = path.join(imageDir, newFilename.replace('gpt4o/', ''))
      
      if (fs.existsSync(oldFilePath) && oldFilePath !== newFilePath) {
        try {
          // 确保目标目录存在
          const dir = path.dirname(newFilePath)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          
          fs.renameSync(oldFilePath, newFilePath)
          renamed++
          console.log(`  重命名: ${filename} -> ${newFilename.replace('gpt4o/', '')}`)
        } catch (err) {
          console.error(`  重命名失败 ${filename}: ${err.message}`)
        }
      }
      
      index++
    }
    
    if (JSON.stringify(item.location) !== JSON.stringify(newLocation)) {
      item.location = newLocation
      updated++
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log(`\ngpt4o: 更新了 ${updated} 条数据的 location，重命名了 ${renamed} 个文件`)
  return { updated, renamed }
}

// 更新 banana 数据
function updateBananaData() {
  const file = path.join(__dirname, '../src/data/banana-prompts.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  const oldImageDir = path.join(__dirname, '../public/assets/image')
  const newImageDir = path.join(__dirname, '../public/assets/image/banana')
  
  // 确保新目录存在
  if (!fs.existsSync(newImageDir)) {
    fs.mkdirSync(newImageDir, { recursive: true })
  }
  
  let updated = 0
  let renamed = 0
  
  for (const item of data) {
    if (!item.location || !Array.isArray(item.location) || item.location.length === 0) {
      continue
    }
    
    const newLocation = []
    
    for (const oldPath of item.location) {
      // 旧格式可能是: filename.jpg 或 banana/filename.jpg
      const filename = oldPath.includes('/') ? oldPath.split('/').pop() : oldPath
      const ext = getExtension(filename)
      
      // 生成新文件名
      const newFilename = generateMediaFilename({
        source: 'banana',
        id: item.id,
        type: 'cover',
        index: 1,
        ext
      })
      
      newLocation.push(newFilename)
      
      // 移动/重命名文件
      const oldFilePath = path.join(oldImageDir, filename)
      const newFilePath = path.join(newImageDir, newFilename.replace('banana/', ''))
      
      if (fs.existsSync(oldFilePath)) {
        try {
          if (oldFilePath !== newFilePath) {
            fs.renameSync(oldFilePath, newFilePath)
            renamed++
            console.log(`  移动: ${filename} -> banana/${newFilename.replace('banana/', '')}`)
          }
        } catch (err) {
          console.error(`  移动失败 ${filename}: ${err.message}`)
        }
      }
    }
    
    if (JSON.stringify(item.location) !== JSON.stringify(newLocation)) {
      item.location = newLocation
      updated++
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8')
  console.log(`\nbanana: 更新了 ${updated} 条数据的 location，移动/重命名了 ${renamed} 个文件`)
  return { updated, renamed }
}

// 主函数
function main() {
  console.log('开始更新 location 和文件名...\n')
  
  const gpt4oResult = updateGpt4oData()
  const bananaResult = updateBananaData()
  
  console.log('\n完成！')
  console.log(`总计: 更新了 ${gpt4oResult.updated + bananaResult.updated} 条数据，处理了 ${gpt4oResult.renamed + bananaResult.renamed} 个文件`)
}

main()

