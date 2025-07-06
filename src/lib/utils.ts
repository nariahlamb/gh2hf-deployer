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
