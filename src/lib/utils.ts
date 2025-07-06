import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Remove trailing slash and .git
    const cleanUrl = url.replace(/\/$/, '').replace(/\.git$/, '')
    
    // Match GitHub URL patterns
    const patterns = [
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)$/,
      /^git@github\.com:([^\/]+)\/([^\/]+)$/,
      /^([^\/]+)\/([^\/]+)$/ // shorthand format
    ]
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern)
      if (match) {
        return {
          owner: match[1],
          repo: match[2]
        }
      }
    }
    
    return null
  } catch {
    return null
  }
}

export function validateSpaceName(name: string): boolean {
  // Hugging Face space names must be lowercase, alphanumeric, and can contain hyphens
  return /^[a-z0-9-]+$/.test(name) && name.length >= 2 && name.length <= 96
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function extractDockerPorts(dockerfileContent: string): number[] {
  const ports: number[] = []
  const exposeRegex = /EXPOSE\s+(\d+(?:\/\w+)?)/gi
  
  let match
  while ((match = exposeRegex.exec(dockerfileContent)) !== null) {
    const port = parseInt(match[1].split('/')[0])
    if (!isNaN(port) && !ports.includes(port)) {
      ports.push(port)
    }
  }
  
  return ports.sort((a, b) => a - b)
}

export function extractDockerEnv(dockerfileContent: string): Record<string, string> {
  const env: Record<string, string> = {}
  const envRegex = /ENV\s+([A-Z_][A-Z0-9_]*)\s*[=\s]\s*(.+)/gi

  let match
  while ((match = envRegex.exec(dockerfileContent)) !== null) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '') // Remove quotes
    env[key] = value
  }

  return env
}

// 检测项目类型和推荐配置
export function detectProjectType(repoInfo: any, dockerConfig: any): {
  type: string
  recommendedEnvVars: Record<string, string>
  warnings: string[]
  hardwareRecommendation: 'cpu-basic' | 'cpu-upgrade' | 'gpu-t4'
} {
  const repoName = repoInfo.name.toLowerCase()
  const description = (repoInfo.description || '').toLowerCase()
  const language = (repoInfo.language || '').toLowerCase()

  // Open WebUI检测
  if (repoName.includes('open-webui') || repoName.includes('openwebui')) {
    return {
      type: 'Open WebUI',
      recommendedEnvVars: {
        'WEBUI_SECRET_KEY': 'your-secret-key-here',
        'PORT': '8080',
        'ENV': 'prod',
        'SCARF_NO_ANALYTICS': 'true',
        'DO_NOT_TRACK': 'true',
        'ANONYMIZED_TELEMETRY': 'false',
        'OPENAI_API_KEY': 'sk-your-openai-api-key (可选)',
        'OLLAMA_BASE_URL': 'https://your-ollama-server.com (可选)'
      },
      warnings: [
        'Open WebUI需要外部LLM服务（如OpenAI API或Ollama服务器）',
        '建议设置强密码的WEBUI_SECRET_KEY',
        '大型模型可能需要更多存储空间'
      ],
      hardwareRecommendation: 'cpu-upgrade'
    }
  }

  // Gradio应用检测
  if (description.includes('gradio') || repoName.includes('gradio')) {
    return {
      type: 'Gradio App',
      recommendedEnvVars: {
        'GRADIO_SERVER_NAME': '0.0.0.0',
        'GRADIO_SERVER_PORT': '7860'
      },
      warnings: [],
      hardwareRecommendation: 'cpu-basic'
    }
  }

  // Streamlit应用检测
  if (description.includes('streamlit') || repoName.includes('streamlit')) {
    return {
      type: 'Streamlit App',
      recommendedEnvVars: {
        'STREAMLIT_SERVER_PORT': '8501',
        'STREAMLIT_SERVER_ADDRESS': '0.0.0.0'
      },
      warnings: [],
      hardwareRecommendation: 'cpu-basic'
    }
  }

  // FastAPI检测
  if (description.includes('fastapi') || repoName.includes('fastapi') || language === 'python') {
    return {
      type: 'FastAPI/Python App',
      recommendedEnvVars: {
        'PORT': '8000',
        'HOST': '0.0.0.0'
      },
      warnings: [],
      hardwareRecommendation: 'cpu-basic'
    }
  }

  // Node.js应用检测
  if (language === 'javascript' || language === 'typescript') {
    return {
      type: 'Node.js App',
      recommendedEnvVars: {
        'PORT': '3000',
        'NODE_ENV': 'production'
      },
      warnings: [],
      hardwareRecommendation: 'cpu-basic'
    }
  }

  // 默认Docker应用
  return {
    type: 'Docker App',
    recommendedEnvVars: {
      'PORT': '8080'
    },
    warnings: [],
    hardwareRecommendation: 'cpu-basic'
  }
}
