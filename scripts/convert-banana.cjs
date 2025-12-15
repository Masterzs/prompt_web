#!/usr/bin/env node
/**
 * 将 banana-prompt-quicker-main/prompts.json 转换为本项目 Prompt 结构，
 * 自动映射本地图片为 location，并复制到 public/assets/image。
 */
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { generateMediaFilename, getExtension, ensureDirectory, copyMediaFile } = require('./utils/media-helper.cjs')

const SOURCE_NAME = 'banana'
const root = path.resolve(__dirname, '..')
const bananaDir = path.join(root, 'banana-prompt-quicker-main')
const input = path.join(bananaDir, 'prompts.json')
const imagesDir = path.join(bananaDir, 'images')
const output = path.join(root, 'src', 'data', 'banana-prompts.json')
const assetsDir = path.join(root, 'public', 'assets', 'image', SOURCE_NAME)
const fallbackSource = 'https://github.com/glidea/banana-prompt-quicker'

const slugify = (str) =>
  str
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'item'

const detectPlatform = (link = '') => {
  if (/twitter\.com|x\.com/i.test(link)) return 'twitter'
  if (/youtube\.com|youtu\.be/i.test(link)) return 'youtube'
  if (/github\.com/i.test(link)) return 'github'
  if (/reddit\.com/i.test(link)) return 'reddit'
  if (/discord\.gg|discord\.com/i.test(link)) return 'discord'
  if (/wechat|weixin/i.test(link)) return 'wechat'
  if (/weibo\.com/i.test(link)) return 'weibo'
  if (/zhihu\.com/i.test(link)) return 'zhihu'
  if (/xiaohongshu\.com/i.test(link)) return 'xiaohongshu'
  return 'other'
}

const mapCategory = (cat = '', sub = '', title = '') => {
  const text = `${cat} ${sub} ${title}`
  if (/剧本|脚本/i.test(text)) return 'script'
  if (/写作|文案|文章|翻译/i.test(text)) return 'writing'
  if (/营销|推广|电商|广告/i.test(text)) return 'marketing'
  if (/代码|编程|程序|开发/i.test(text)) return 'code'
  if (/学习|教育|总结|考试/i.test(text)) return 'education'
  if (/视频|配音|剪辑/i.test(text)) return 'video'
  if (/画|绘图|绘画|图像|图片|摄影|PPT|设计|海报|封面|插画|表情包/i.test(text)) return 'drawing'
  if (/商务|工作|简历|职场/i.test(text)) return 'business'
  if (/效率|思维导图|总结|计划|旅游|生活|美食/i.test(text)) return 'productivity'
  return 'other'
}

const detectLanguage = (text = '') => {
  const ascii = (text.match(/[\x00-\x7F]/g) || []).length
  const total = text.length || 1
  return ascii / total > 0.6 ? 'en' : 'zh'
}

const shortDescription = (text = '', max = 30) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max) : clean
}

const imagesSet = new Set(fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [])
ensureDirectory(assetsDir)

const raw = fs.readFileSync(input, 'utf-8')
const items = JSON.parse(raw)

const usedIds = new Set()
const now = '2025-01-01T00:00:00Z'

const nextId = (base) => {
  let id = base
  let i = 1
  while (usedIds.has(id)) {
    id = `${base}-${i}`
    i += 1
  }
  usedIds.add(id)
  return id
}

const convert = items.map((item) => {
  const preview = item.preview || ''
  const filename = preview.split('/').pop()?.split('?')[0] || ''
  const baseName = filename.replace(path.extname(filename), '') || slugify(item.title || 'item')
  const id = nextId(slugify(baseName))

  const hasLocal = filename && imagesSet.has(filename)
  let location = []
  if (hasLocal) {
    const src = path.join(imagesDir, filename)
    const stat = fs.existsSync(src) ? fs.statSync(src) : null
    const valid = stat && stat.size > 0
    
    if (valid) {
      const ext = getExtension(filename)
      const mediaFilename = generateMediaFilename({ source: SOURCE_NAME, id, type: 'cover', index: 1, ext })
      const dest = path.join(assetsDir, mediaFilename.replace(`${SOURCE_NAME}/`, ''))
      
      if (!fs.existsSync(dest)) {
        try {
          fs.copyFileSync(src, dest)
          location.push(mediaFilename)
        } catch (err) {
          console.log(`  Failed to copy image for ${id}: ${err.message}`)
        }
      } else {
        // 文件已存在，直接使用
        location.push(mediaFilename)
      }
    }
  }

  const category = mapCategory(item.category || '', item.sub_category || '', item.title || '')
  const platform = detectPlatform(item.link || '')
  const language = detectLanguage(item.prompt || '')

  const description = shortDescription(item.prompt || item.title || '', 30)
  const tags = Array.from(
    new Set(
      [item.category, item.sub_category, item.mode, item.author]
        .filter(Boolean)
        .map((t) => String(t))
    )
  )

  return {
    id,
    title: item.title || id,
    content: item.prompt || '',
    description,
    platform,
    category,
    tags,
    sourceUrl: item.link || fallbackSource,
    author: item.author || 'banana',
    createdAt: item.created || now,
    updatedAt: item.created || now,
    language,
    location,
    imageUrl: preview || undefined
  }
})

fs.writeFileSync(output, JSON.stringify(convert, null, 2), 'utf-8')
console.log(`Converted ${convert.length} items -> ${output}`)
console.log(`Images copied to ${assetsDir} (existing files skipped)`)

