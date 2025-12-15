# 数据转换脚本说明

## 统一的媒体文件命名规则

为了确保不同数据源的兼容性和可维护性，我们采用统一的媒体文件命名规则：

### 命名格式

```
{source}/{id}-{type}-{index}.{ext}
```

**参数说明：**
- `source`: 数据源标识（如 `banana`, `gpt4o`, `gemini` 等），用于区分不同来源的数据
- `id`: 数据项的唯一标识符（如 `banana_001`, `gpt4o_123`）
- `type`: 文件类型
  - `cover`: 封面图（主要图片）
  - `image`: 普通图片（多图时使用）
  - `video`: 视频文件
- `index`: 索引号（从1开始，cover通常为1）
- `ext`: 文件扩展名（jpg, png, mp4等）

### 示例

```
banana/banana_001-cover-1.jpg
gpt4o/gpt4o_123-cover-1.jpeg
gpt4o/gpt4o_123-image-2.jpeg
gpt4o/gpt4o_123-image-3.png
banana/banana_002-video-1.mp4
```

### 存储位置

- **图片**: `public/assets/image/{source}/`
- **视频**: `public/assets/video/{source}/`

### location 字段格式

在 JSON 数据中，`location` 字段存储的是相对路径（包含子目录）：

```json
{
  "id": "gpt4o_001",
  "location": [
    "gpt4o/gpt4o_001-cover-1.jpeg",
    "gpt4o/gpt4o_001-image-2.jpeg"
  ]
}
```

前端会自动解析为：
- `/assets/image/gpt4o/gpt4o_001-cover-1.jpeg`
- `/assets/image/gpt4o/gpt4o_001-image-2.jpeg`

## 使用工具函数

所有转换脚本应使用 `scripts/utils/media-helper.cjs` 中的工具函数：

```javascript
const {
  generateMediaFilename,  // 生成标准化文件名
  getExtension,            // 提取文件扩展名
  ensureDirectory,         // 确保目录存在
  copyMediaFile            // 复制媒体文件（异步）
} = require('./utils/media-helper.cjs')
```

### 示例用法

```javascript
const SOURCE_NAME = 'my_source'
const id = 'my_source_001'
const ext = getExtension(sourceImagePath)
const filename = generateMediaFilename({
  source: SOURCE_NAME,
  id,
  type: 'cover',
  index: 1,
  ext
})
// 结果: "my_source/my_source_001-cover-1.jpg"

// 复制文件
const destPath = path.join(OUTPUT_DIR, filename.replace(`${SOURCE_NAME}/`, ''))
await copyMediaFile({ srcPath, destPath })

// 在数据中使用
location.push(filename)
```

## 前端路径解析

前端代码（`src/components/PromptCard.tsx`）会自动处理以下格式：

1. **完整URL**: `http://...` 或 `https://...` → 直接使用
2. **绝对路径**: `/assets/image/...` → 直接使用
3. **相对路径（含子目录）**: `gpt4o/filename.jpg` → `/assets/image/gpt4o/filename.jpg`
4. **文件名**: `filename.jpg` → `/assets/image/filename.jpg`

## 添加新的数据源

添加新数据源时，请遵循以下步骤：

1. 创建转换脚本 `scripts/convert-{source}.cjs`
2. 设置 `SOURCE_NAME` 常量
3. 使用 `media-helper.cjs` 中的工具函数
4. 确保输出目录为 `public/assets/image/{SOURCE_NAME}/`
5. 在 `location` 字段中使用 `{SOURCE_NAME}/filename` 格式

### 模板

```javascript
const { generateMediaFilename, getExtension, ensureDirectory, copyMediaFile } = require('./utils/media-helper.cjs')

const SOURCE_NAME = 'new_source'
const OUTPUT_DIR = path.join(__dirname, '../public/assets/image', SOURCE_NAME)

ensureDirectory(OUTPUT_DIR)

// ... 处理数据 ...

const filename = generateMediaFilename({
  source: SOURCE_NAME,
  id: itemId,
  type: 'cover',
  index: 1,
  ext: getExtension(sourcePath)
})

const destPath = path.join(OUTPUT_DIR, filename.replace(`${SOURCE_NAME}/`, ''))
await copyMediaFile({ srcPath, destPath })

location.push(filename)
```

## 注意事项

1. **文件大小检查**: 工具函数会自动跳过0字节的文件
2. **文件覆盖**: 默认不覆盖已存在的文件，如需覆盖请设置 `overwrite: true`
3. **路径清理**: ID和source会自动清理特殊字符，只保留字母数字和下划线
4. **扩展名**: 自动转换为小写并去除前导点号

