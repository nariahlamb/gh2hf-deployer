'use client'

import { useAppStore } from '@/lib/store'
import { RepoInput } from '@/components/RepoInput'
import { RepoValidation } from '@/components/RepoValidation'
import { DeploymentConfig } from '@/components/DeploymentConfig'
import { DeploymentProgress } from '@/components/DeploymentProgress'

export default function HomePage() {
  const { currentStep, error } = useAppStore()

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[
            { key: 'input', label: '输入仓库' },
            { key: 'validate', label: '验证配置' },
            { key: 'configure', label: '配置部署' },
            { key: 'deploy', label: '执行部署' },
            { key: 'complete', label: '完成' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step.key 
                  ? 'bg-primary text-primary-foreground' 
                  : index < ['input', 'validate', 'configure', 'deploy', 'complete'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                currentStep === step.key ? 'font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
              {index < 4 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  index < ['input', 'validate', 'configure', 'deploy', 'complete'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="font-medium text-red-800">错误</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 'input' && <RepoInput />}
        {currentStep === 'validate' && <RepoValidation />}
        {currentStep === 'configure' && <DeploymentConfig />}
        {(currentStep === 'deploy' || currentStep === 'complete') && <DeploymentProgress />}
      </div>

      {/* Help Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">📁</span>
            </div>
            <h3 className="font-semibold mb-2">支持的项目</h3>
            <p className="text-sm text-muted-foreground">
              包含Dockerfile或docker-compose.yml的GitHub仓库
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">🚀</span>
            </div>
            <h3 className="font-semibold mb-2">一键部署</h3>
            <p className="text-sm text-muted-foreground">
              自动检测配置，快速部署到Hugging Face Spaces
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">实时监控</h3>
            <p className="text-sm text-muted-foreground">
              实时查看部署进度和日志信息
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
