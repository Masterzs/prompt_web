#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * 压缩 public/assets/image 下的图片，覆盖原文件：
 * - 最长边限制 1600px
 * - JPEG/PNG/WebP 质量 78
 * - 跳过体积已很小的文件（<50KB）
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const dir = path.join(root, 'public', 'assets', 'image')

const allowExt = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MAX_SIZE = 1600
const MIN_BYTES = 50 * 1024 // 跳过很小的文件

const files = fs.readdirSync(dir).filter(f => allowExt.has(path.extname(f).toLowerCase()))
let processed = 0
let skipped = 0

;(async () => {
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.size < MIN_BYTES) {
      skipped++
      continue
    }

    const ext = path.extname(file).toLowerCase()
    const image = sharp(filePath, { failOn: 'none' })
    const meta = await image.metadata()
    const { width = 0, height = 0 } = meta

    const needsResize = Math.max(width, height) > MAX_SIZE
    const resizeOpts = needsResize ? { width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true } : {}

    const format = ext === '.png' ? 'png' : (ext === '.webp' ? 'webp' : 'jpeg')
    const options = { quality: 78, effort: 4 }

    await image.resize(resizeOpts).toFormat(format, options).toFile(filePath)
    processed++
  }

  console.log(`Optimize done. processed=${processed}, skipped=${skipped}, total=${files.length}`)
})().catch(err => {
  console.error(err)
  process.exit(1)
})

