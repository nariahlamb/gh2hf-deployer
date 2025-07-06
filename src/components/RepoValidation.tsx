'use client'

import { CheckCircle, XCircle, Star, GitFork, Eye, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'

export function RepoValidation() {
  const { 
    repoInfo, 
    dockerConfig, 
    setCurrentStep, 
    reset 
  } = useAppStore()

  if (!repoInfo || !dockerConfig) {
    return null
  }

  const handleContinue = () => {
    if (dockerConfig.hasDockerfile || dockerConfig.hasDockerCompose) {
      setCurrentStep('configure')
    }
  }

  const handleBack = () => {
    reset()
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Repository Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            仓库信息
          </CardTitle>
          <CardDescription>
            已成功获取GitHub仓库信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <img 
              src={repoInfo.owner.avatar_url} 
              alt={repoInfo.owner.login}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{repoInfo.full_name}</h3>
                <p className="text-muted-foreground">{repoInfo.description || '无描述'}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {repoInfo.stargazers_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  {repoInfo.forks_count.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {repoInfo.private ? '私有' : '公开'}
                </div>
                {repoInfo.language && (
                  <div className="px-2 py-1 bg-secondary rounded text-xs">
                    {repoInfo.language}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Docker Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {dockerConfig.hasDockerfile || dockerConfig.hasDockerCompose ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Docker 配置检测
          </CardTitle>
          <CardDescription>
            {dockerConfig.hasDockerfile || dockerConfig.hasDockerCompose 
              ? '检测到Docker配置文件，可以进行部署'
              : '未检测到Docker配置文件，无法部署到Hugging Face Spaces'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {dockerConfig.hasDockerfile ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">Dockerfile</span>
              </div>
              {dockerConfig.dockerfilePath && (
                <p className="text-sm text-muted-foreground ml-6">
                  路径: {dockerConfig.dockerfilePath}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {dockerConfig.hasDockerCompose ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">Docker Compose</span>
              </div>
              {dockerConfig.dockerComposePath && (
                <p className="text-sm text-muted-foreground ml-6">
                  路径: {dockerConfig.dockerComposePath}
                </p>
              )}
            </div>
          </div>

          {dockerConfig.exposedPorts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">暴露端口</h4>
              <div className="flex flex-wrap gap-2">
                {dockerConfig.exposedPorts.map(port => (
                  <span key={port} className="px-2 py-1 bg-secondary rounded text-sm">
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dockerConfig.baseImage && (
            <div className="space-y-2">
              <h4 className="font-medium">基础镜像</h4>
              <p className="text-sm text-muted-foreground font-mono">
                {dockerConfig.baseImage}
              </p>
            </div>
          )}

          {!dockerConfig.hasDockerfile && !dockerConfig.hasDockerCompose && (
            <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-800">无法部署</p>
                <p className="text-sm text-yellow-700">
                  该仓库不包含Dockerfile或docker-compose.yml文件，无法部署到Hugging Face Spaces。
                  请确保仓库根目录包含Docker配置文件。
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          重新选择仓库
        </Button>
        
        {(dockerConfig.hasDockerfile || dockerConfig.hasDockerCompose) && (
          <Button onClick={handleContinue}>
            继续配置部署
          </Button>
        )}
      </div>
    </div>
  )
}
