#!/usr/bin/env node
/**
 * 解析 awesome-gemini-3-prompts-main/README.md 生成本项目的 Prompt 数据，
 * 下载示例图片到 public/assets/image/gemini 下并输出 src/data/gemini-prompts.json。
 */
/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const fetchFn = global.fetch
if (!fetchFn) {
  console.error('Node fetch is not available in this runtime.')
  process.exit(1)
}

const root = path.resolve(__dirname, '..')
const input = path.join(root, 'awesome-gemini-3-prompts-main', 'README.md')
const output = path.join(root, 'src', 'data', 'gemini-prompts.json')
const assetsDir = path.join(root, 'public', 'assets', 'image', 'gemini')

if (!fs.existsSync(input)) {
  console.error('README not found:', input)
  process.exit(1)
}
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
}

const md = fs.readFileSync(input, 'utf-8')

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

const mapCategory = (text = '') => {
  if (/剧本|脚本/i.test(text)) return 'script'
  if (/写作|文案|文章|翻译/i.test(text)) return 'writing'
  if (/营销|推广|电商|广告/i.test(text)) return 'marketing'
  if (/代码|编程|程序|开发|web page|landing page/i.test(text)) return 'code'
  if (/学习|教育|总结|考试/i.test(text)) return 'education'
  if (/视频|配音|剪辑|shorts/i.test(text)) return 'video'
  if (/画|绘图|绘画|图像|图片|摄影|设计|海报|插画|UI|页面/i.test(text)) return 'drawing'
  if (/商务|工作|简历|职场/i.test(text)) return 'business'
  if (/效率|思维导图|总结|计划|生活/i.test(text)) return 'productivity'
  return 'creative'
}

const cleanLinkText = (text = '') => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()

const shortDescription = (text = '', max = 30) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max) : clean
}

const toSlug = (str) =>
  (str || 'item')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'item'

const ensureUniqueFile = (dir, base, ext) => {
  let name = `${base}${ext}`
  let i = 1
  while (fs.existsSync(path.join(dir, name))) {
    name = `${base}-${i}${ext}`
    i += 1
  }
  return name
}

const parseBlocks = () => {
  const blocks = []
  const regex = /### No\. (?<num>\d+): (?<title>[^\n]+)\n(?<body>[\s\S]*?)(?=^### No\. |\Z)/gm
  let m
  while ((m = regex.exec(md)) !== null) {
    const { num, title, body } = m.groups
    const descMatch = body.match(/#### 📖 Description\s+([\s\S]*?)(?=^####|\Z)/m)
    const promptMatch = body.match(/#### 📝 Prompt\s+```[\s\S]*?```/m)
    const promptContent = promptMatch
      ? (promptMatch[0].match(/```[\s\S]*?```/m) || [''])[0].replace(/^```[^\n]*\n?/, '').replace(/```\s*$/, '')
      : ''
    const images = Array.from(body.matchAll(/<img\s+[^>]*src="([^"]+)"/g)).map((x) => x[1])
    const authorLine = body.match(/- \*\*Author:\*\* ([^\n]+)/)
    const sourceLine = body.match(/- \*\*Source:\*\* [^\(]*\(([^)]+)\)/)
    const publishedLine = body.match(/- \*\*Published:\*\* ([^\n]+)/)
    const languagesLine = body.match(/- \*\*Languages:\*\* ([^\n]+)/)

    const author = authorLine ? cleanLinkText(authorLine[1]) : ''
    const sourceUrl = sourceLine ? sourceLine[1].trim() : ''
    const languages = languagesLine ? languagesLine[1].split(/[,、]/).map((s) => s.trim()).filter(Boolean) : []
    const language = languages[0]?.toLowerCase().startsWith('en') ? 'en' : 'zh'
    const description = shortDescription(descMatch ? descMatch[1] : promptContent || title)
    const category = mapCategory(`${title} ${description}`)
    const platform = detectPlatform(sourceUrl)
    const baseId = `gemini_${String(num).padStart(3, '0')}-${toSlug(title).slice(0, 40)}`

    blocks.push({
      num,
      id: baseId,
      title,
      description,
      content: promptContent,
      images,
      author,
      sourceUrl,
      language,
      category,
      platform,
      published: publishedLine ? publishedLine[1].trim() : '',
      tags: Array.from(new Set([language, author, promptContent.includes('{argument') ? 'raycast' : null].filter(Boolean)))
    })
  }
  return blocks
}

const downloadImage = async (url, destDir, baseName) => {
  try {
    const res = await fetchFn(url)
    if (!res.ok) {
      console.warn('Skip image (http):', url, res.status)
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (!buf.length) {
      console.warn('Skip image (empty):', url)
      return null
    }
    const ext = path.extname(new URL(url).pathname) || '.jpg'
    const fileName = ensureUniqueFile(destDir, baseName, ext)
    fs.writeFileSync(path.join(destDir, fileName), buf)
    return `gemini/${fileName}`
  } catch (e) {
    console.warn('Skip image (error):', url, e.message)
    return null
  }
}

const main = async () => {
  console.log('Gemini convert start...')
  const items = parseBlocks()
  console.log(`Parsed ${items.length} items from README`)
  const out = []
  const nowIso = new Date().toISOString()

  for (const item of items) {
    const locations = []
    for (let i = 0; i < item.images.length; i += 1) {
      const loc = await downloadImage(item.images[i], assetsDir, `${item.id}-${i + 1}`)
      if (loc) locations.push(loc)
    }

    out.push({
      id: item.id,
      title: item.title,
      content: item.content,
      description: item.description,
      platform: item.platform,
      category: item.category,
      tags: item.tags,
      sourceUrl: item.sourceUrl || 'https://github.com/YouMind-OpenLab/awesome-gemini-3-prompts',
      author: item.author || 'gemini',
      createdAt: item.published ? new Date(item.published).toISOString() : nowIso,
      updatedAt: item.published ? new Date(item.published).toISOString() : nowIso,
      language: item.language,
      location: locations,
      imageUrl: item.images[0] || undefined
    })
  }

  fs.writeFileSync(output, JSON.stringify(out, null, 2), 'utf-8')
  console.log(`Converted ${out.length} items -> ${output}`)
  console.log(`Images saved to ${assetsDir}`)
}

main().catch((err) => {
  console.error('convert-gemini failed:', err)
  process.exit(1)
})

