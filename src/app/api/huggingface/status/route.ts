import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deploymentId = searchParams.get('deploymentId')

    if (!deploymentId) {
      return NextResponse.json({
        success: false,
        error: '缺少部署ID参数'
      }, { status: 400 })
    }

    // 获取全局deploymentStore
    const deploymentStore = (global as any).deploymentStore || new Map()
    const status = deploymentStore.get(deploymentId)
    
    if (!status) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的部署记录'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error: any) {
    console.error('Status API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取部署状态失败'
    }, { status: 500 })
  }
}
