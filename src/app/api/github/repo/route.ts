import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

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

    // 获取仓库信息
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    })

    // 转换为我们需要的格式
    const repoInfo = {
      id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      description: repoData.description,
      html_url: repoData.html_url,
      clone_url: repoData.clone_url,
      default_branch: repoData.default_branch,
      language: repoData.language,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      private: repoData.private,
      owner: {
        login: repoData.owner.login,
        avatar_url: repoData.owner.avatar_url,
      },
    }

    return NextResponse.json({
      success: true,
      data: repoInfo
    })

  } catch (error: any) {
    console.error('GitHub API error:', error)
    
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
      error: error.message || '获取仓库信息失败'
    }, { status: 500 })
  }
}
