'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Github, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { parseGitHubUrl } from '@/lib/utils'
import axios from 'axios'

const repoSchema = z.object({
  url: z.string().min(1, '请输入GitHub仓库URL').refine(
    (url) => parseGitHubUrl(url) !== null,
    '请输入有效的GitHub仓库URL'
  )
})

type RepoFormData = z.infer<typeof repoSchema>

export function RepoInput() {
  const { 
    repoUrl, 
    setRepoUrl, 
    setRepoInfo, 
    setDockerConfig, 
    setCurrentStep, 
    setLoading, 
    setError, 
    isLoading 
  } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RepoFormData>({
    resolver: zodResolver(repoSchema),
    defaultValues: { url: repoUrl }
  })

  const onSubmit = async (data: RepoFormData) => {
    setLoading(true)
    setError(null)
    
    try {
      const parsedUrl = parseGitHubUrl(data.url)
      if (!parsedUrl) {
        throw new Error('无效的GitHub URL格式')
      }

      // 获取仓库信息
      const repoResponse = await axios.get(`/api/github/repo`, {
        params: {
          owner: parsedUrl.owner,
          repo: parsedUrl.repo
        }
      })

      if (!repoResponse.data.success) {
        throw new Error(repoResponse.data.error || '获取仓库信息失败')
      }

      // 检测Docker配置
      const dockerResponse = await axios.get(`/api/github/docker`, {
        params: {
          owner: parsedUrl.owner,
          repo: parsedUrl.repo
        }
      })

      if (!dockerResponse.data.success) {
        throw new Error(dockerResponse.data.error || '检测Docker配置失败')
      }

      // 更新状态
      setRepoUrl(data.url)
      setRepoInfo(repoResponse.data.data)
      setDockerConfig(dockerResponse.data.data)
      setCurrentStep('validate')
      
    } catch (error: any) {
      console.error('Error validating repository:', error)
      setError(error.message || '验证仓库时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (exampleUrl: string) => {
    setValue('url', exampleUrl)
    setRepoUrl(exampleUrl)
  }

  const examples = [
    'https://github.com/gradio-app/gradio',
    'https://github.com/streamlit/streamlit-hello',
    'https://github.com/huggingface/transformers'
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Github className="h-6 w-6" />
          GitHub 仓库输入
        </CardTitle>
        <CardDescription>
          输入包含Docker配置的GitHub仓库URL，我们将自动检测并准备部署到Hugging Face Spaces
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              GitHub 仓库 URL
            </label>
            <Input
              id="url"
              placeholder="https://github.com/username/repository"
              {...register('url')}
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '验证中...' : '验证仓库'}
          </Button>
        </form>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">示例仓库：</p>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>支持的URL格式：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>https://github.com/username/repository</li>
            <li>git@github.com:username/repository.git</li>
            <li>username/repository</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
