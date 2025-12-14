# 安全与健壮性功能说明

## 防爬虫功能

### 1. 请求频率限制
- **位置**: `src/utils/anti-crawl.ts`
- **功能**: 
  - 限制每个用户每分钟最多 20 次请求
  - 基于浏览器指纹识别用户
  - 自动清理过期记录

### 2. 爬虫检测
- **检测项**:
  - User-Agent 检测（识别常见爬虫）
  - 无头浏览器检测
  - 窗口大小异常检测
  - 浏览器插件检测

### 3. 数据混淆
- 提供数据混淆和还原功能（增加爬取难度）
- 注意：这是前端混淆，不是真正的加密

### 4. 请求验证
- 验证请求来源（referrer 检查）
- 防止直接访问数据接口

## 代码健壮性增强

### 1. 错误处理 (`src/utils/error-handler.ts`)

#### 统一错误记录
- 自动记录所有错误
- 开发环境输出到控制台
- 生产环境可集成错误追踪服务（Sentry 等）

#### 错误处理包装器
- `withErrorHandling`: 同步函数错误处理
- `withAsyncErrorHandling`: 异步函数错误处理
- `safeExecute`: 安全执行（不抛出错误）
- `safeExecuteAsync`: 安全执行异步函数

### 2. 数据验证 (`src/utils/validator.ts`)

#### Prompt 数据验证
- 验证必需字段
- 验证字段类型
- 验证数组结构

#### 输入清理
- `sanitizeString`: 清理字符串，防止 XSS
- `sanitizeUrl`: 验证和清理 URL
- `validateSearchQuery`: 验证搜索关键词

#### 参数验证
- `validatePagination`: 验证分页参数
- `validateCategory`: 验证分类
- `validatePlatform`: 验证平台

### 3. 组件增强

#### App.tsx
- ✅ 数据加载错误处理
- ✅ 数据验证和清理
- ✅ 防爬虫检查
- ✅ 分页参数验证
- ✅ 搜索查询验证

#### PromptCard.tsx
- ✅ 媒体路径安全验证
- ✅ URL 安全验证
- ✅ 复制功能错误处理
- ✅ 图片加载错误处理

#### SearchBar.tsx
- ✅ 输入长度限制
- ✅ 防抖处理（300ms）
- ✅ 频率限制（500ms 最小间隔）
- ✅ 实时验证和错误提示
- ✅ 防爬虫检查

#### search.ts
- ✅ 输入验证
- ✅ 数据清理
- ✅ 安全执行搜索
- ✅ 单个 prompt 错误隔离

## 使用示例

### 错误处理
```typescript
import { withAsyncErrorHandling, errorHandler } from './utils/error-handler'

// 异步操作
const result = await withAsyncErrorHandling(
  async () => {
    // 可能出错的操作
    return await fetchData()
  },
  'Failed to fetch data'
)

// 记录错误
errorHandler.logError(new Error('Something went wrong'))
```

### 数据验证
```typescript
import { validateSearchQuery, sanitizeString } from './utils/validator'

// 验证搜索查询
const validation = validateSearchQuery(userInput)
if (validation.valid) {
  // 使用 validation.cleaned
}

// 清理字符串
const clean = sanitizeString(userInput)
```

### 防爬虫
```typescript
import { antiCrawlCheck, checkRateLimit } from './utils/anti-crawl'

// 检查是否允许请求
const check = antiCrawlCheck()
if (!check.allowed) {
  // 阻止操作
  console.warn(check.reason)
}
```

## 安全建议

1. **生产环境**:
   - 考虑使用后端 API 进行更严格的验证
   - 集成专业的错误追踪服务（如 Sentry）
   - 使用 CDN 的 WAF 功能

2. **数据保护**:
   - 敏感数据不应暴露在前端
   - 考虑使用内容加密
   - 实施 CSP（内容安全策略）

3. **监控**:
   - 监控异常请求模式
   - 记录可疑活动
   - 设置告警阈值

## 注意事项

⚠️ **前端防爬的局限性**:
- 前端防爬措施可以被绕过
- 真正的安全需要在后端实现
- 这些措施主要用于：
  - 阻止简单的爬虫
  - 增加爬取成本
  - 保护正常用户体验

⚠️ **性能影响**:
- 防爬检查会增加少量性能开销
- 错误处理会增加代码复杂度
- 需要在安全性和性能之间平衡

