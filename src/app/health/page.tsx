'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import axios from 'axios'

interface HealthCheck {
  status: 'success' | 'error' | 'unknown'
  message: string
}

interface HealthResponse {
  status: 'success' | 'error'
  timestamp: string
  checks: {
    github: HealthCheck
    huggingface: HealthCheck
    environment: HealthCheck
  }
  message: string
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('/api/health')
      setHealthData(response.data)
    } catch (err: any) {
      setError(err.message || '健康检查失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">系统健康检查</h1>
          <p className="text-muted-foreground">
            验证GitHub和Hugging Face API配置是否正确
          </p>
        </div>

        {/* Overall Status */}
        {healthData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(healthData.status)}
                总体状态
              </CardTitle>
              <CardDescription>
                最后检查时间: {new Date(healthData.timestamp).toLocaleString('zh-CN')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border ${getStatusColor(healthData.status)}`}>
                <p className="font-medium">{healthData.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Checks */}
        {healthData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(healthData.checks.environment.status)}
                  环境变量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-3 rounded border text-sm ${getStatusColor(healthData.checks.environment.status)}`}>
                  {healthData.checks.environment.message}
                </div>
              </CardContent>
            </Card>

            {/* GitHub API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(healthData.checks.github.status)}
                  GitHub API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-3 rounded border text-sm ${getStatusColor(healthData.checks.github.status)}`}>
                  {healthData.checks.github.message}
                </div>
              </CardContent>
            </Card>

            {/* Hugging Face API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getStatusIcon(healthData.checks.huggingface.status)}
                  Hugging Face API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-3 rounded border text-sm ${getStatusColor(healthData.checks.huggingface.status)}`}>
                  {healthData.checks.huggingface.message}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-800">检查失败</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !healthData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>正在检查系统状态...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={fetchHealthData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            重新检查
          </Button>
          <Button variant="outline" asChild>
            <a href="/">返回首页</a>
          </Button>
        </div>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>配置帮助</CardTitle>
            <CardDescription>
              如果检查失败，请参考以下解决方案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">环境变量配置</h4>
              <p className="text-sm text-muted-foreground mb-2">
                确保在Vercel中设置了以下环境变量：
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <code>GITHUB_TOKEN</code> - GitHub Personal Access Token</li>
                <li>• <code>HUGGINGFACE_TOKEN</code> - Hugging Face Access Token</li>
                <li>• <code>HUGGINGFACE_USERNAME</code> - 您的Hugging Face用户名</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">获取API密钥</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>GitHub Token:</strong> 
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    GitHub Settings → Developer settings → Personal access tokens
                  </a>
                </p>
                <p>
                  <strong>Hugging Face Token:</strong> 
                  <a 
                    href="https://huggingface.co/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    Hugging Face Settings → Access Tokens
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
