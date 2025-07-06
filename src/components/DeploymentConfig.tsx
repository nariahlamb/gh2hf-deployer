'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { validateSpaceName } from '@/lib/utils'

const deploymentSchema = z.object({
  spaceName: z.string()
    .min(2, 'Space名称至少需要2个字符')
    .max(96, 'Space名称不能超过96个字符')
    .refine(validateSpaceName, 'Space名称只能包含小写字母、数字和连字符'),
  visibility: z.enum(['public', 'private']),
  hardware: z.enum(['cpu-basic', 'cpu-upgrade', 'gpu-t4']),
  description: z.string().optional(),
  tags: z.string().optional()
})

type DeploymentFormData = z.infer<typeof deploymentSchema>

export function DeploymentConfig() {
  const {
    repoInfo,
    dockerConfig,
    setDeploymentConfig,
    setCurrentStep,
    setLoading,
    isLoading
  } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<DeploymentFormData>({
    resolver: zodResolver(deploymentSchema),
    defaultValues: {
      spaceName: repoInfo?.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') || '',
      visibility: 'public',
      hardware: dockerConfig?.hardwareRecommendation || 'cpu-basic',
      description: repoInfo?.description || '',
      tags: dockerConfig?.projectType ? `${dockerConfig.projectType.toLowerCase()}, docker` : 'docker'
    }
  })

  const selectedHardware = watch('hardware')

  const onSubmit = async (data: DeploymentFormData) => {
    setLoading(true)
    
    const config = {
      spaceName: data.spaceName,
      visibility: data.visibility,
      hardware: data.hardware,
      description: data.description,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    }
    
    setDeploymentConfig(config)
    setCurrentStep('deploy')
    setLoading(false)
  }

  const handleBack = () => {
    setCurrentStep('validate')
  }

  const hardwareOptions = [
    {
      value: 'cpu-basic',
      label: 'CPU Basic',
      description: '2 vCPU, 16GB RAM - 免费',
      price: '免费'
    },
    {
      value: 'cpu-upgrade',
      label: 'CPU Upgrade', 
      description: '8 vCPU, 32GB RAM',
      price: '$0.05/小时'
    },
    {
      value: 'gpu-t4',
      label: 'GPU T4',
      description: '4 vCPU, 15GB RAM, 1x T4 GPU',
      price: '$0.60/小时'
    }
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            部署配置
          </CardTitle>
          <CardDescription>
            配置您的Hugging Face Space参数
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Project Type Info */}
          {dockerConfig?.projectType && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {dockerConfig.projectType}
                </span>
                {dockerConfig.hardwareRecommendation && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    推荐硬件: {dockerConfig.hardwareRecommendation}
                  </span>
                )}
              </div>
              {dockerConfig.warnings && dockerConfig.warnings.length > 0 && (
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">部署注意事项：</p>
                  <ul className="list-disc list-inside space-y-1">
                    {dockerConfig.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Space Name */}
            <div className="space-y-2">
              <label htmlFor="spaceName" className="text-sm font-medium">
                Space 名称 *
              </label>
              <Input
                id="spaceName"
                placeholder="my-awesome-app"
                {...register('spaceName')}
                className={errors.spaceName ? 'border-destructive' : ''}
              />
              {errors.spaceName && (
                <p className="text-sm text-destructive">{errors.spaceName.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                只能包含小写字母、数字和连字符，将作为您的Space URL的一部分
              </p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-sm font-medium">可见性</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="public"
                    {...register('visibility')}
                    className="w-4 h-4"
                  />
                  <span>公开 - 任何人都可以查看和使用</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="private"
                    {...register('visibility')}
                    className="w-4 h-4"
                  />
                  <span>私有 - 只有您可以访问</span>
                </label>
              </div>
            </div>

            {/* Hardware */}
            <div className="space-y-2">
              <label className="text-sm font-medium">硬件配置</label>
              <div className="space-y-3">
                {hardwareOptions.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('hardware')}
                      className="w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-sm text-muted-foreground">{option.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                描述 (可选)
              </label>
              <Input
                id="description"
                placeholder="简要描述您的应用程序..."
                {...register('description')}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                标签 (可选)
              </label>
              <Input
                id="tags"
                placeholder="docker, webapp, ai (用逗号分隔)"
                {...register('tags')}
              />
              <p className="text-xs text-muted-foreground">
                用逗号分隔多个标签，有助于其他用户发现您的Space
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                返回
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Rocket className="h-4 w-4 mr-2" />
                {isLoading ? '准备中...' : '开始部署'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
