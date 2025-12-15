/**
 * 通用的媒体文件处理工具
 * 统一文件名规则和路径解析
 */

const path = require('path')
const fs = require('fs')

/**
 * 生成标准化的文件名
 * 格式: {source}/{id}-{type}-{index}.{ext}
 * 
 * @param {Object} options
 * @param {string} options.source - 数据源标识 (banana, gpt4o, gemini等)
 * @param {string} options.id - 数据项ID
 * @param {string} options.type - 文件类型 (cover, image, video)
 * @param {number} options.index - 索引 (从1开始，cover通常为0或1)
 * @param {string} options.ext - 文件扩展名 (jpg, png, mp4等)
 * @returns {string} 标准化的文件名路径，如 "gpt4o/gpt4o_001-cover-1.jpg"
 */
function generateMediaFilename({ source, id, type = 'image', index = 1, ext = 'jpg' }) {
  // 清理ID，移除特殊字符，保留字母数字和下划线
  const cleanId = String(id).replace(/[^a-zA-Z0-9_]/g, '_')
  // 清理扩展名
  const cleanExt = String(ext).replace(/^\./, '').toLowerCase()
  
  // 生成文件名
  const filename = `${cleanId}-${type}-${index}.${cleanExt}`
  
  // 如果有source，添加子目录前缀
  if (source) {
    const cleanSource = String(source).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    return `${cleanSource}/${filename}`
  }
  
  return filename
}

/**
 * 从文件路径或URL提取扩展名
 * @param {string} filePath - 文件路径或URL
 * @returns {string} 扩展名（不含点号）
 */
function getExtension(filePath) {
  if (!filePath) return 'jpg'
  const match = filePath.match(/\.([^.?]+)(?:\?|$)/)
  return match ? match[1].toLowerCase() : 'jpg'
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * 复制媒体文件到目标目录
 * @param {Object} options
 * @param {string} options.srcPath - 源文件路径
 * @param {string} options.destPath - 目标文件路径
 * @param {boolean} options.overwrite - 是否覆盖已存在的文件
 * @returns {Promise<boolean>} 是否成功
 */
function copyMediaFile({ srcPath, destPath, overwrite = false }) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(srcPath)) {
      reject(new Error(`Source file not found: ${srcPath}`))
      return
    }

    // 检查文件大小，跳过0字节文件
    const stat = fs.statSync(srcPath)
    if (stat.size === 0) {
      reject(new Error(`Source file is empty: ${srcPath}`))
      return
    }

    // 如果目标文件已存在且不覆盖，跳过
    if (fs.existsSync(destPath) && !overwrite) {
      resolve(false) // 返回false表示已存在，未复制
      return
    }

    // 确保目标目录存在
    ensureDirectory(path.dirname(destPath))

    // 复制文件
    const readStream = fs.createReadStream(srcPath)
    const writeStream = fs.createWriteStream(destPath)

    readStream.on('error', reject)
    writeStream.on('error', reject)
    writeStream.on('finish', () => resolve(true))

    readStream.pipe(writeStream)
  })
}

/**
 * 解析location路径，返回完整的URL路径
 * 支持多种格式：
 * - 完整URL (http://...)
 * - 相对路径 (gpt4o/filename.jpg) -> /assets/image/gpt4o/filename.jpg
 * - 文件名 (filename.jpg) -> /assets/image/filename.jpg
 * 
 * @param {string} location - location字段的值
 * @param {string} mediaType - 'image' 或 'video'
 * @returns {string} 完整的URL路径
 */
function resolveMediaPath(location, mediaType = 'image') {
  if (!location) return ''
  
  // 如果是完整URL，直接返回
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return location
  }
  
  // 如果是绝对路径（以/开头），直接返回
  if (location.startsWith('/')) {
    return location
  }
  
  // 相对路径：根据mediaType决定基础路径
  const basePath = mediaType === 'video' ? '/assets/video/' : '/assets/image/'
  
  // 如果location已经包含子目录（如 gpt4o/filename.jpg），直接拼接
  // 如果只是文件名（如 filename.jpg），也直接拼接
  return basePath + location
}

module.exports = {
  generateMediaFilename,
  getExtension,
  ensureDirectory,
  copyMediaFile,
  resolveMediaPath
}

