import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AppState } from '@/types'

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Repository state
      repoUrl: '',
      repoInfo: null,
      dockerConfig: null,
      
      // Deployment state
      deploymentConfig: null,
      deploymentStatus: null,
      
      // UI state
      currentStep: 'input',
      isLoading: false,
      error: null,
      
      // Actions
      setRepoUrl: (url: string) => {
        set({ repoUrl: url, error: null }, false, 'setRepoUrl')
      },
      
      setRepoInfo: (info) => {
        set({ repoInfo: info }, false, 'setRepoInfo')
      },
      
      setDockerConfig: (config) => {
        set({ dockerConfig: config }, false, 'setDockerConfig')
      },
      
      setDeploymentConfig: (config) => {
        set({ deploymentConfig: config }, false, 'setDeploymentConfig')
      },
      
      setDeploymentStatus: (status) => {
        set({ deploymentStatus: status }, false, 'setDeploymentStatus')
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: step, error: null }, false, 'setCurrentStep')
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },
      
      setError: (error) => {
        set({ error, isLoading: false }, false, 'setError')
      },
      
      reset: () => {
        set({
          repoUrl: '',
          repoInfo: null,
          dockerConfig: null,
          deploymentConfig: null,
          deploymentStatus: null,
          currentStep: 'input',
          isLoading: false,
          error: null,
        }, false, 'reset')
      },
    }),
    {
      name: 'gh2hf-deployer-store',
    }
  )
)
