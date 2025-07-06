// Hugging Face API 客户端
// 使用官方 Hugging Face Hub API

import { HfApi, createRepo } from '@huggingface/hub'

interface CreateSpaceParams {
  spaceName: string
  visibility: 'public' | 'private'
  hardware: 'cpu-basic' | 'cpu-upgrade' | 'gpu-t4'
  description?: string
  tags?: string[]
  sdk: 'docker' | 'gradio' | 'streamlit' | 'static'
}

interface SpaceInfo {
  id: string
  name: string
  url: string
  status: string
  visibility: string
  hardware: string
  sdk: string
}

export class HuggingFaceClient {
  private hfApi: HfApi
  private username: string

  constructor(token: string, username: string) {
    this.hfApi = new HfApi({ accessToken: token })
    this.username = username
  }

  async createSpace(params: CreateSpaceParams): Promise<SpaceInfo> {
    const spaceId = `${this.username}/${params.spaceName}`

    try {
      console.log('Creating space with params:', params)

      // 使用官方 HfApi 创建 Space
      const repoUrl = await createRepo({
        repo: spaceId,
        accessToken: this.hfApi.accessToken,
        repoType: 'space',
        private: params.visibility === 'private',
        sdk: params.sdk,
        hardware: params.hardware,
        spaceSecrets: [],
        spaceVariables: []
      })

      console.log('Space created successfully:', repoUrl)

      // 创建 README.md 文件
      const readmeContent = `---
title: ${params.spaceName}
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: ${params.sdk}
pinned: false
${params.hardware ? `hardware: ${params.hardware}` : ''}
---

# ${params.spaceName}

${params.description || 'Deployed from GitHub using GH2HF Deployer'}
`

      // 上传 README.md
      await this.hfApi.uploadFile({
        repo: spaceId,
        file: new Blob([readmeContent], { type: 'text/plain' }),
        path: 'README.md',
        repoType: 'space'
      })

      return {
        id: spaceId,
        name: params.spaceName,
        url: `https://huggingface.co/spaces/${spaceId}`,
        status: 'building',
        visibility: params.visibility,
        hardware: params.hardware,
        sdk: params.sdk,
      }
    } catch (error: any) {
      console.error('Error creating space:', error)
      throw new Error(`Failed to create Hugging Face Space: ${error.message}`)
    }
  }

  async uploadFile(spaceId: string, filePath: string, content: string): Promise<void> {
    try {
      console.log(`Uploading file ${filePath} to space ${spaceId}`)

      // 使用官方 HfApi 上传文件
      await this.hfApi.uploadFile({
        repo: spaceId,
        file: new Blob([content], { type: 'text/plain' }),
        path: filePath,
        repoType: 'space',
        commitMessage: `Upload ${filePath}`
      })

      console.log(`Successfully uploaded ${filePath}`)
    } catch (error: any) {
      console.error('Error uploading file:', error)
      throw new Error(`Failed to upload file to Space: ${error.message}`)
    }
  }

  async getSpaceStatus(spaceId: string): Promise<SpaceInfo> {
    try {
      console.log(`Getting status for space ${spaceId}`)

      // 使用官方 HfApi 获取 Space 信息
      const spaceInfo = await this.hfApi.spaceInfo({ repo: spaceId })

      return {
        id: spaceId,
        name: spaceInfo.name,
        url: `https://huggingface.co/spaces/${spaceId}`,
        status: spaceInfo.runtime?.stage || 'unknown',
        visibility: spaceInfo.private ? 'private' : 'public',
        hardware: spaceInfo.runtime?.hardware || 'cpu-basic',
        sdk: spaceInfo.sdk || 'docker',
      }
    } catch (error: any) {
      console.error('Error getting space status:', error)
      throw new Error(`Failed to get space status: ${error.message}`)
    }
  }

  async deleteSpace(spaceId: string): Promise<void> {
    try {
      console.log(`Deleting space ${spaceId}`)

      // 使用官方 HfApi 删除 Space
      await this.hfApi.deleteRepo({
        repo: spaceId,
        repoType: 'space'
      })

      console.log(`Successfully deleted space ${spaceId}`)
    } catch (error: any) {
      console.error('Error deleting space:', error)
      throw new Error(`Failed to delete space: ${error.message}`)
    }
  }

  // 验证token是否有效
  async validateToken(): Promise<boolean> {
    try {
      // 使用官方 HfApi 验证 token
      const userInfo = await this.hfApi.whoAmI()
      return !!userInfo.name
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  // 获取用户信息
  async getUserInfo(): Promise<any> {
    try {
      // 使用官方 HfApi 获取用户信息
      const userInfo = await this.hfApi.whoAmI()
      return userInfo
    } catch (error: any) {
      console.error('Error getting user info:', error)
      throw new Error(`Failed to get user info: ${error.message}`)
    }
  }
}
