'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Loader2, ExternalLink, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import axios from 'axios'

export function DeploymentProgress() {
  const { 
    repoInfo,
    deploymentConfig,
    deploymentStatus,
    setDeploymentStatus,
    setCurrentStep,
    setError,
    reset
  } = useAppStore()

  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if (!repoInfo || !deploymentConfig) return

    startDeployment()
  }, [repoInfo, deploymentConfig])

  const startDeployment = async () => {
    if (!repoInfo || !deploymentConfig) return

    try {
      const response = await axios.post('/api/huggingface/deploy', {
        repoUrl: repoInfo.html_url,
        repoInfo,
        deploymentConfig
      })

      if (!response.data.success) {
        throw new Error(response.data.error || '部署失败')
      }

      // 开始轮询部署状态
      pollDeploymentStatus(response.data.data.deploymentId)
      
    } catch (error: any) {
      console.error('Deployment error:', error)
      setError(error.message || '部署过程中发生错误')
      setDeploymentStatus({
        stage: 'error',
        progress: 0,
        message: error.message || '部署失败',
        error: error.message
      })
    }
  }

  const pollDeploymentStatus = async (deploymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/huggingface/status`, {
          params: { deploymentId }
        })

        if (response.data.success) {
          const status = response.data.data
          setDeploymentStatus(status)
          
          if (status.logs) {
            setLogs(status.logs)
          }

          // 如果部署完成或失败，停止轮询
          if (status.stage === 'completed' || status.stage === 'error') {
            clearInterval(pollInterval)
            if (status.stage === 'completed') {
              setCurrentStep('complete')
            }
          }
        }
      } catch (error) {
        console.error('Error polling deployment status:', error)
        clearInterval(pollInterval)
      }
    }, 3000) // 每3秒轮询一次

    // 10分钟后停止轮询
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 600000)
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const getStageText = (stage: string) => {
    const stages = {
      validating: '验证配置',
      creating: '创建Space',
      uploading: '上传代码',
      building: '构建镜像',
      deploying: '部署应用',
      completed: '部署完成',
      error: '部署失败'
    }
    return stages[stage as keyof typeof stages] || stage
  }

  const handleRetry = () => {
    setDeploymentStatus(null)
    setLogs([])
    startDeployment()
  }

  const handleNewDeployment = () => {
    reset()
  }

  if (!deploymentStatus) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">初始化部署...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Deployment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStageIcon(deploymentStatus.stage)}
            部署进度
          </CardTitle>
          <CardDescription>
            正在将 {repoInfo?.full_name} 部署到 Hugging Face Spaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getStageText(deploymentStatus.stage)}</span>
              <span>{deploymentStatus.progress}%</span>
            </div>
            <Progress value={deploymentStatus.progress} />
          </div>
          
          <p className="text-sm text-muted-foreground">
            {deploymentStatus.message}
          </p>

          {deploymentStatus.stage === 'completed' && deploymentStatus.spaceUrl && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">部署成功！</span>
              </div>
              <p className="text-sm text-green-700 mb-3">
                您的应用已成功部署到 Hugging Face Spaces
              </p>
              <Button asChild>
                <a 
                  href={deploymentStatus.spaceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  访问您的Space
                </a>
              </Button>
            </div>
          )}

          {deploymentStatus.stage === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">部署失败</span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                {deploymentStatus.error || '部署过程中发生未知错误'}
              </p>
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重试部署
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>部署日志</CardTitle>
            <CardDescription>
              实时部署过程日志
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={handleNewDeployment}>
          部署新项目
        </Button>
      </div>
    </div>
  )
}
