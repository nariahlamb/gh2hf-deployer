import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { HuggingFaceClient } from '@/lib/huggingface'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    github: { status: 'unknown', message: '' },
    huggingface: { status: 'unknown', message: '' },
    environment: { status: 'unknown', message: '' }
  }

  // 检查环境变量
  const requiredEnvVars = ['GITHUB_TOKEN', 'HUGGINGFACE_TOKEN', 'HUGGINGFACE_USERNAME']
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: 'error',
      message: `缺少环境变量: ${missingEnvVars.join(', ')}`
    }
  } else {
    checks.environment = {
      status: 'success',
      message: '所有必需的环境变量已设置'
    }
  }

  // 检查GitHub API
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    })
    
    const { data: user } = await octokit.rest.users.getAuthenticated()
    checks.github = {
      status: 'success',
      message: `GitHub API连接成功 (用户: ${user.login})`
    }
  } catch (error: any) {
    checks.github = {
      status: 'error',
      message: `GitHub API连接失败: ${error.message}`
    }
  }

  // 检查Hugging Face API
  try {
    const token = process.env.HUGGINGFACE_TOKEN
    const username = process.env.HUGGINGFACE_USERNAME

    if (!token) {
      checks.huggingface = {
        status: 'error',
        message: 'HUGGINGFACE_TOKEN未设置'
      }
    } else if (!username) {
      checks.huggingface = {
        status: 'error',
        message: 'HUGGINGFACE_USERNAME未设置'
      }
    } else {
      // 真实的API验证
      const hfClient = new HuggingFaceClient(token, username)

      try {
        const isValid = await hfClient.validateToken()

        if (isValid) {
          const userInfo = await hfClient.getUserInfo()
          checks.huggingface = {
            status: 'success',
            message: `✅ Hugging Face API连接成功 (用户: ${userInfo.name || username})`
          }
        } else {
          checks.huggingface = {
            status: 'error',
            message: '❌ HUGGINGFACE_TOKEN无效或已过期'
          }
        }
      } catch (error: any) {
        checks.huggingface = {
          status: 'error',
          message: `❌ Hugging Face API连接失败: ${error.message}`
        }
      }
    }
  } catch (error: any) {
    checks.huggingface = {
      status: 'error',
      message: `Hugging Face API连接失败: ${error.message}`
    }
  }

  // 计算总体状态
  const hasErrors = Object.values(checks).some(check => check.status === 'error')
  const overallStatus = hasErrors ? 'error' : 'success'

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    message: hasErrors ? '配置检查发现问题' : '所有配置检查通过'
  })
}
