import { NextRequest, NextResponse } from 'next/server'
import { HuggingFaceClient } from '@/lib/huggingface'
import { Octokit } from '@octokit/rest'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 模拟部署状态存储（在生产环境中应该使用数据库）
const deploymentStore = new Map<string, any>()

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
      const updated = { ...current, ...updates }
      if (updates.log) {
        updated.logs = [...current.logs, updates.log]
        delete updates.log
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

    try {
      // 真实的Hugging Face API调用
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

      // 验证Space是否真的创建成功
      try {
        const spaceStatus = await hfClient.getSpaceStatus(spaceId)
        updateStatus({
          log: `✅ Space验证成功，状态: ${spaceStatus.status}`
        })
      } catch (verifyError: any) {
        updateStatus({
          log: `⚠️ Space创建成功但验证失败: ${verifyError.message}`
        })
      }

    } catch (error: any) {
      updateStatus({
        log: `❌ Space创建失败: ${error.message}`
      })
      console.error('Space creation error details:', error)
      throw error
    }

    // 步骤2: 获取GitHub仓库内容
    updateStatus({
      stage: 'uploading',
      progress: 40,
      message: '获取GitHub仓库内容...',
      log: '正在从GitHub获取代码...'
    })

    // 解析GitHub URL
    const repoUrl = repoInfo.html_url
    const [, , , owner, repo] = repoUrl.split('/')

    // 获取仓库的主要文件
    const filesToUpload = ['Dockerfile', 'docker-compose.yml', 'requirements.txt', 'package.json', 'README.md']
    const uploadedFiles: string[] = []

    for (const fileName of filesToUpload) {
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: fileName,
        })

        if ('content' in fileData) {
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
          await hfClient.uploadFile(spaceId, fileName, content)
          uploadedFiles.push(fileName)
          updateStatus({
            log: `上传文件: ${fileName}`
          })
        }
      } catch (error: any) {
        if (error.status !== 404) {
          updateStatus({
            log: `警告: 无法上传 ${fileName}: ${error.message}`
          })
        }
      }
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
      // 检测是否为Open WebUI项目
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
      log: `代码上传完成，共上传 ${uploadedFiles.length + 1} 个文件`
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

    while (buildAttempts < maxAttempts) {
      try {
        const spaceStatus = await hfClient.getSpaceStatus(spaceId)
        updateStatus({
          log: `构建状态: ${spaceStatus.status}`
        })

        if (spaceStatus.status === 'running') {
          updateStatus({
            log: 'Space构建完成并正在运行'
          })
          break
        } else if (spaceStatus.status === 'error') {
          throw new Error('Space构建失败')
        }
      } catch (error: any) {
        updateStatus({
          log: `检查状态时出错: ${error.message}`
        })
      }

      buildAttempts++
      await new Promise(resolve => setTimeout(resolve, 10000)) // 等待10秒
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
