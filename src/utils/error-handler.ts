/**
 * 错误处理工具
 * 提供统一的错误处理和日志记录
 */

export interface AppError {
  code: string
  message: string
  details?: unknown
  timestamp: number
}

class ErrorHandler {
  private errors: AppError[] = []
  private readonly maxErrors = 100

  /**
   * 记录错误
   */
  logError(error: Error | string, details?: unknown): void {
    const appError: AppError = {
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : error,
      details,
      timestamp: Date.now(),
    }

    this.errors.push(appError)
    
    // 限制错误日志数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // 开发环境输出到控制台
    if (import.meta.env.DEV) {
      console.error('Error logged:', appError)
    }

    // 生产环境可以发送到错误追踪服务
    if (import.meta.env.PROD) {
      // 这里可以集成 Sentry、LogRocket 等服务
      // this.sendToErrorTracking(appError)
    }
  }

  /**
   * 获取错误列表
   */
  getErrors(): AppError[] {
    return [...this.errors]
  }

  /**
   * 清空错误日志
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 创建用户友好的错误消息
   */
  getUserFriendlyMessage(error: Error | string): string {
    if (typeof error === 'string') {
      return error
    }

    const errorMessages: Record<string, string> = {
      'TypeError': '数据格式错误，请刷新页面重试',
      'ReferenceError': '页面加载异常，请刷新页面',
      'NetworkError': '网络连接失败，请检查网络后重试',
      'SyntaxError': '数据解析错误，请联系管理员',
      'RangeError': '数据超出范围，请刷新页面',
    }

    return errorMessages[error.name] || '发生未知错误，请刷新页面重试'
  }
}

export const errorHandler = new ErrorHandler()

/**
 * 错误边界包装器
 */
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  errorMessage?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args)
    } catch (error) {
      errorHandler.logError(
        error instanceof Error ? error : new Error(String(error)),
        { function: fn.name, args }
      )
      
      if (errorMessage) {
        console.error(errorMessage, error)
      }
      
      throw error
    }
  }) as T
}

/**
 * 异步错误处理包装器
 */
export async function withAsyncErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    errorHandler.logError(
      error instanceof Error ? error : new Error(String(error)),
      { function: fn.name }
    )
    
    if (errorMessage) {
      console.error(errorMessage, error)
    }
    
    return null
  }
}

/**
 * 安全执行函数（不抛出错误）
 */
export function safeExecute<T>(
  fn: () => T,
  defaultValue: T
): T {
  try {
    return fn()
  } catch (error) {
    errorHandler.logError(
      error instanceof Error ? error : new Error(String(error))
    )
    return defaultValue
  }
}

/**
 * 安全执行异步函数
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    errorHandler.logError(
      error instanceof Error ? error : new Error(String(error))
    )
    return defaultValue
  }
}

