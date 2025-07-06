import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { extractDockerPorts, extractDockerEnv } from '@/lib/utils'

// 强制动态渲染
export const dynamic = 'force-dynamic'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: owner 和 repo'
      }, { status: 400 })
    }

    const dockerConfig = {
      hasDockerfile: false,
      hasDockerCompose: false,
      dockerfilePath: undefined as string | undefined,
      dockerComposePath: undefined as string | undefined,
      exposedPorts: [] as number[],
      baseImage: undefined as string | undefined,
      workdir: undefined as string | undefined,
      entrypoint: undefined as string[] | undefined,
      cmd: undefined as string[] | undefined,
      env: {} as Record<string, string>,
    }

    // 检查 Dockerfile
    try {
      const { data: dockerfileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'Dockerfile',
      })

      if ('content' in dockerfileData) {
        dockerConfig.hasDockerfile = true
        dockerConfig.dockerfilePath = 'Dockerfile'
        
        // 解析 Dockerfile 内容
        const content = Buffer.from(dockerfileData.content, 'base64').toString('utf-8')
        
        // 提取基础镜像
        const fromMatch = content.match(/^FROM\s+(.+)$/m)
        if (fromMatch) {
          dockerConfig.baseImage = fromMatch[1].trim()
        }
        
        // 提取工作目录
        const workdirMatch = content.match(/^WORKDIR\s+(.+)$/m)
        if (workdirMatch) {
          dockerConfig.workdir = workdirMatch[1].trim()
        }
        
        // 提取入口点
        const entrypointMatch = content.match(/^ENTRYPOINT\s+(.+)$/m)
        if (entrypointMatch) {
          try {
            dockerConfig.entrypoint = JSON.parse(entrypointMatch[1].trim())
          } catch {
            dockerConfig.entrypoint = [entrypointMatch[1].trim()]
          }
        }
        
        // 提取CMD
        const cmdMatch = content.match(/^CMD\s+(.+)$/m)
        if (cmdMatch) {
          try {
            dockerConfig.cmd = JSON.parse(cmdMatch[1].trim())
          } catch {
            dockerConfig.cmd = [cmdMatch[1].trim()]
          }
        }
        
        // 提取端口
        dockerConfig.exposedPorts = extractDockerPorts(content)
        
        // 提取环境变量
        dockerConfig.env = extractDockerEnv(content)
      }
    } catch (error: any) {
      if (error.status !== 404) {
        console.warn('Error checking Dockerfile:', error.message)
      }
    }

    // 检查 docker-compose.yml
    const composeFiles = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml']
    
    for (const filename of composeFiles) {
      try {
        const { data: composeData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filename,
        })

        if ('content' in composeData) {
          dockerConfig.hasDockerCompose = true
          dockerConfig.dockerComposePath = filename
          break
        }
      } catch (error: any) {
        if (error.status !== 404) {
          console.warn(`Error checking ${filename}:`, error.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: dockerConfig
    })

  } catch (error: any) {
    console.error('Docker detection error:', error)
    
    if (error.status === 404) {
      return NextResponse.json({
        success: false,
        error: '仓库不存在或无法访问'
      }, { status: 404 })
    }
    
    if (error.status === 403) {
      return NextResponse.json({
        success: false,
        error: 'GitHub API 访问受限，请检查访问令牌'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || '检测Docker配置失败'
    }, { status: 500 })
  }
}
