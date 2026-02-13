import { NextRequest, NextResponse } from 'next/server'
import { HuggingFaceClient } from '@/lib/huggingface'
import { Octokit } from '@octokit/rest'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 模拟部署状态存储（在生产环境中应该使用数据库）
const deploymentStore = new Map<string, any>()
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024
const MAX_FILES_TO_UPLOAD = 300
const SKIP_PATH_PREFIXES = ['.git/', '.github/', 'node_modules/', '.next/', 'dist/', 'build/', 'coverage/']

function normalizeSpaceStatus(status: string | undefined): string {
  return (status || 'unknown').toLowerCase()
}

function isRunningStatus(status: string): boolean {
  return status.includes('running') || status.includes('ready')
}

function isFailedStatus(status: string): boolean {
  const failureKeywords = ['error', 'failed', 'failure', 'crash', 'stopped']
  return failureKeywords.some(keyword => status.includes(keyword))
}

function shouldSkipPath(path: string): boolean {
  return SKIP_PATH_PREFIXES.some(prefix => path.startsWith(prefix))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repoUrl, repoInfo, deploymentConfig } = body

    if (!repoUrl || !repoInfo || !deploymentConfig) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    // 生成部署ID
    const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 初始化部署状态
    const initialStatus = {
      deploymentId,
      stage: 'validating',
      progress: 10,
      message: '验证配置参数...',
      logs: ['开始部署流程...', '验证GitHub仓库...'],
      spaceUrl: null,
      error: null
    }

    deploymentStore.set(deploymentId, initialStatus)

    // 异步执行部署流程
    executeDeployment(deploymentId, repoUrl, repoInfo, deploymentConfig)
      .catch(error => {
        console.error('Deployment execution error:', error)
        const status = deploymentStore.get(deploymentId)
        if (status) {
          status.stage = 'error'
          status.progress = 0
          status.message = '部署失败'
          status.error = error.message
          status.logs.push(`错误: ${error.message}`)
          deploymentStore.set(deploymentId, status)
        }
      })

    return NextResponse.json({
      success: true,
      data: { deploymentId }
    })

  } catch (error: any) {
    console.error('Deploy API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '启动部署失败'
    }, { status: 500 })
  }
}

async function executeDeployment(
  deploymentId: string,
  repoUrl: string,
  repoInfo: any,
  deploymentConfig: any
) {
  const updateStatus = (updates: any) => {
    const current = deploymentStore.get(deploymentId)
    if (current) {
      const { log, ...statusUpdates } = updates
      const updated = { ...current, ...statusUpdates }
      if (log) {
        updated.logs = [...current.logs, log]
      }
      deploymentStore.set(deploymentId, updated)
    }
  }

  try {
    // 验证环境变量
    const token = process.env.HUGGINGFACE_TOKEN
    const username = process.env.HUGGINGFACE_USERNAME
    const githubToken = process.env.GITHUB_TOKEN

    if (!token || !username || !githubToken) {
      throw new Error('Missing required environment variables: HUGGINGFACE_TOKEN, HUGGINGFACE_USERNAME, or GITHUB_TOKEN')
    }

    // 初始化客户端
    const hfClient = new HuggingFaceClient(token, username)
    const octokit = new Octokit({ auth: githubToken })

    // 步骤1: 创建Space
    updateStatus({
      stage: 'creating',
      progress: 25,
      message: '创建Hugging Face Space...',
      log: '正在创建Space...'
    })

    const spaceId = `${username}/${deploymentConfig.spaceName}`

    updateStatus({
      log: `正在创建Space: ${deploymentConfig.spaceName}`
    })

    const space = await hfClient.createSpace({
      spaceName: deploymentConfig.spaceName,
      visibility: deploymentConfig.visibility,
      hardware: deploymentConfig.hardware,
      description: deploymentConfig.description,
      tags: deploymentConfig.tags,
      sdk: 'docker'
    })

    updateStatus({
      log: `✅ Space创建成功: ${space.url}`
    })

    // 步骤2: 获取GitHub仓库内容
    updateStatus({
      stage: 'uploading',
      progress: 40,
      message: '获取GitHub仓库内容...',
      log: '正在从GitHub获取代码...'
    })

    const owner = repoInfo?.owner?.login
    const repo = repoInfo?.name
    const defaultBranch = repoInfo?.default_branch || 'main'

    if (!owner || !repo) {
      throw new Error('无法解析仓库 owner/repo 信息')
    }

    const branchResponse = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch
    })
    const treeSha = branchResponse.data.commit.commit.tree.sha

    const treeResponse = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: '1'
    })

    const treeItems = (treeResponse.data.tree as Array<{
      path?: string
      sha?: string
      size?: number
      type?: string
    }>)

    const filesToUpload = treeItems
      .filter(item => item.type === 'blob' && !!item.path && !!item.sha)
      .filter(item => !shouldSkipPath(item.path!))

    if (filesToUpload.length === 0) {
      throw new Error('仓库中没有可上传文件')
    }

    const uploadedFiles: string[] = []
    let skippedBinaryFiles = 0
    let skippedLargeFiles = 0
    let failedFiles = 0

    for (const file of filesToUpload) {
      if (uploadedFiles.length >= MAX_FILES_TO_UPLOAD) {
        updateStatus({
          log: `已达到上传文件上限 ${MAX_FILES_TO_UPLOAD}，停止继续上传`
        })
        break
      }

      if ((file.size || 0) > MAX_FILE_SIZE_BYTES) {
        skippedLargeFiles++
        continue
      }

      try {
        const { data: blobData } = await octokit.rest.git.getBlob({
          owner,
          repo,
          file_sha: file.sha!
        })

        if (blobData.encoding !== 'base64' || !blobData.content) {
          failedFiles++
          continue
        }

        const fileBuffer = Buffer.from(blobData.content, 'base64')
        if (fileBuffer.includes(0)) {
          skippedBinaryFiles++
          continue
        }

        const content = fileBuffer.toString('utf-8')
        await hfClient.uploadFile(spaceId, file.path!, content)
        uploadedFiles.push(file.path!)

        if (uploadedFiles.length <= 20 || uploadedFiles.length % 20 === 0) {
          updateStatus({
            log: `上传文件: ${file.path}`
          })
        }
      } catch {
        failedFiles++
      }
    }

    if (!uploadedFiles.includes('Dockerfile')) {
      throw new Error('未上传到 Dockerfile，Hugging Face Docker Space 无法构建')
    }

    if (skippedLargeFiles > 0) {
      updateStatus({
        log: `跳过大文件 ${skippedLargeFiles} 个（单文件 > ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB）`
      })
    }

    if (skippedBinaryFiles > 0) {
      updateStatus({
        log: `跳过二进制文件 ${skippedBinaryFiles} 个`
      })
    }

    if (failedFiles > 0) {
      updateStatus({
        log: `上传失败文件 ${failedFiles} 个，请检查仓库权限或文件编码`
      })
    }

    // 步骤3: 创建Space配置文件
    updateStatus({
      stage: 'uploading',
      progress: 60,
      message: '创建Space配置...',
      log: '正在创建Space配置文件...'
    })

    // 创建README.md（如果不存在）
    if (!uploadedFiles.includes('README.md')) {
      const isOpenWebUI = repoInfo.name.toLowerCase().includes('open-webui') ||
        repoInfo.name.toLowerCase().includes('openwebui')

      const readmeContent = `---
title: ${deploymentConfig.spaceName}
emoji: ${isOpenWebUI ? '🤖' : '🚀'}
colorFrom: ${isOpenWebUI ? 'blue' : 'blue'}
colorTo: ${isOpenWebUI ? 'purple' : 'green'}
sdk: docker
pinned: false
${isOpenWebUI ? 'app_port: 8080' : ''}
---

# ${deploymentConfig.spaceName}

${deploymentConfig.description || 'Deployed from GitHub using GH2HF Deployer'}

${isOpenWebUI ? `
## ⚠️ 重要配置说明

这是一个Open WebUI部署。为了正常工作，请在Space设置中配置以下环境变量：

\`\`\`env
WEBUI_SECRET_KEY=your-secret-key-here
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=your-strong-password
SPACE_ID=${spaceId}
OPENAI_API_KEY=sk-your-openai-api-key
\`\`\`

首次启动可能需要几分钟。配置完成后，使用设置的邮箱和密码登录。
` : ''}

## Original Repository
${repoUrl}
`

      await hfClient.uploadFile(spaceId, 'README.md', readmeContent)
      updateStatus({
        log: `创建README.md文件${isOpenWebUI ? ' (包含Open WebUI配置说明)' : ''}`
      })
    }

    updateStatus({
      log: `代码上传完成，共上传 ${uploadedFiles.length} 个文件`
    })

    // 步骤4: 等待构建
    updateStatus({
      stage: 'building',
      progress: 75,
      message: '等待Hugging Face构建...',
      log: 'Space正在构建中，这可能需要几分钟...'
    })

    // 等待一段时间让构建开始
    await new Promise(resolve => setTimeout(resolve, 10000))

    // 检查构建状态
    let buildAttempts = 0
    const maxAttempts = 30 // 最多等待5分钟
    let lastStatus = 'unknown'
    let hasStarted = false
    let isRunning = false

    while (buildAttempts < maxAttempts) {
      let currentStatus: string

      try {
        const spaceStatus = await hfClient.getSpaceStatus(spaceId)
        currentStatus = spaceStatus.status
      } catch (error: any) {
        buildAttempts++
        updateStatus({
          log: `检查状态失败(${buildAttempts}/${maxAttempts}): ${error.message}`
        })
        await new Promise(resolve => setTimeout(resolve, 10000))
        continue
      }

      const normalizedStatus = normalizeSpaceStatus(currentStatus)
      lastStatus = currentStatus

      if (!hasStarted && normalizedStatus !== 'unknown') {
        hasStarted = true
      }

      updateStatus({
        log: `构建状态: ${currentStatus}`
      })

      if (isFailedStatus(normalizedStatus)) {
        throw new Error(`Space构建失败，当前状态: ${currentStatus}`)
      }

      if (isRunningStatus(normalizedStatus)) {
        isRunning = true
        updateStatus({
          log: 'Space构建完成并正在运行'
        })
        break
      }

      buildAttempts++
      await new Promise(resolve => setTimeout(resolve, 10000)) // 等待10秒
    }

    if (!hasStarted) {
      throw new Error('Space 未进入构建流程，请检查仓库内容和 Dockerfile')
    }

    if (!isRunning) {
      throw new Error(`Space 在等待时间内未就绪，最后状态: ${lastStatus}`)
    }

    // 步骤5: 完成
    const spaceUrl = `https://huggingface.co/spaces/${spaceId}`

    updateStatus({
      stage: 'completed',
      progress: 100,
      message: '部署完成！',
      spaceUrl,
      log: `部署成功！访问地址: ${spaceUrl}`
    })

  } catch (error: any) {
    console.error('Deployment error:', error)
    updateStatus({
      stage: 'error',
      progress: 0,
      message: '部署失败',
      error: error.message,
      log: `部署失败: ${error.message}`
    })
  }
}

// deploymentStore供status API使用 - 通过全局变量访问
if (typeof global !== 'undefined') {
  (global as any).deploymentStore = deploymentStore
}
