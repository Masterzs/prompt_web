export interface CopyOptions {
  watermark?: string
  showNotification?: boolean
}

export function copyToClipboard(text: string, options: CopyOptions = {}): Promise<void> {
  const { watermark = '', showNotification = true } = options
  
  // 添加水印
  const textWithWatermark = watermark ? `${text}\n\n${watermark}` : text
  
  return new Promise((resolve, reject) => {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textWithWatermark)
        .then(() => {
          if (showNotification) {
            showCopyNotification('复制成功！')
          }
          resolve()
        })
        .catch((error) => {
          console.error('Clipboard API 失败:', error)
          // 降级到传统方法
          fallbackCopyText(textWithWatermark, showNotification)
            .then(resolve)
            .catch(reject)
        })
    } else {
      // 使用传统方法
      fallbackCopyText(textWithWatermark, showNotification)
        .then(resolve)
        .catch(reject)
    }
  })
}

function fallbackCopyText(text: string, showNotification: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    // 创建临时文本区域
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    
    // 选择并复制文本
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        if (showNotification) {
          showCopyNotification('复制成功！')
        }
        resolve()
      } else {
        reject(new Error('复制失败'))
      }
    } catch (error) {
      document.body.removeChild(textArea)
      reject(error)
    }
  })
}

function showCopyNotification(message: string): void {
  // 创建通知元素
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `
  
  document.body.appendChild(notification)
  
  // 动画显示
  setTimeout(() => {
    notification.style.transform = 'translateX(0)'
  }, 100)
  
  // 3秒后移除
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

export function preventCopy(element: HTMLElement): void {
  // 禁用右键菜单
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })
  
  // 禁用文本选择
  element.style.userSelect = 'none'
  element.style.webkitUserSelect = 'none'
  
  // 防止拖拽
  element.addEventListener('dragstart', (e) => {
    e.preventDefault()
    return false
  })
  
  // 禁用快捷键
  element.addEventListener('keydown', (e) => {
    // Ctrl+C, Ctrl+A, Ctrl+U, F12
    if ((e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'u')) || e.key === 'F12') {
      e.preventDefault()
      return false
    }
  })
  
  // 禁用开发者工具快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault()
      return false
    }
  })
}

export function addCopyWatermark(text: string, watermark: string = '来自 Prompt Hub'): string {
  return `${text}\n\n${watermark}`
}