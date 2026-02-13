// Hugging Face API 客户端
// 使用官方 Hugging Face Hub API

import {
  createRepo,
  uploadFile as hfUploadFile,
  listSpaces,
  deleteRepo as hfDeleteRepo,
  whoAmI as hfWhoAmI,
  type RepoDesignation,
  type SpaceSdk,
  type SpaceHardwareFlavor
} from '@huggingface/hub'

interface CreateSpaceParams {
  spaceName: string
  visibility: 'public' | 'private'
  hardware: SpaceHardwareFlavor
  description?: string
  tags?: string[]
  sdk: SpaceSdk
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
  private accessToken: string
  private username: string

  constructor(token: string, username: string) {
    this.accessToken = token
    this.username = username
  }

  async createSpace(params: CreateSpaceParams): Promise<SpaceInfo> {
    const spaceId = `${this.username}/${params.spaceName}`
    const repo: RepoDesignation = { type: 'space', name: spaceId }

    try {
      console.log('Creating space with params:', params)

      // 使用官方 createRepo 函数创建 Space
      const result = await createRepo({
        repo,
        credentials: { accessToken: this.accessToken },
        private: params.visibility === 'private',
        sdk: params.sdk
      })

      console.log('Space created successfully:', result.repoUrl)

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
      await hfUploadFile({
        repo,
        credentials: { accessToken: this.accessToken },
        file: {
          path: 'README.md',
          content: new Blob([readmeContent], { type: 'text/plain' })
        }
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

      const repo: RepoDesignation = { type: 'space', name: spaceId }

      // 使用官方 uploadFile 函数上传文件
      await hfUploadFile({
        repo,
        credentials: { accessToken: this.accessToken },
        file: {
          path: filePath,
          content: new Blob([content], { type: 'text/plain' })
        },
        commitTitle: `Upload ${filePath}`
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

      // 使用 listSpaces 函数查找特定的 Space
      const spaceName = spaceId.split('/')[1] || spaceId
      const owner = spaceId.split('/')[0] || this.username

      for await (const space of listSpaces({
        search: { owner, query: spaceName },
        credentials: { accessToken: this.accessToken },
        additionalFields: ['runtime']
      })) {
        if (space.name === spaceName || space.id === spaceId) {
          const hardware = space.runtime?.hardware
          const hardwareString = typeof hardware === 'string'
            ? hardware
            : hardware?.current || 'cpu-basic'

          return {
            id: spaceId,
            name: space.name,
            url: `https://huggingface.co/spaces/${spaceId}`,
            status: space.runtime?.stage || 'unknown',
            visibility: space.private ? 'private' : 'public',
            hardware: hardwareString,
            sdk: space.sdk || 'docker',
          }
        }
      }

      // 如果没找到，返回默认状态
      return {
        id: spaceId,
        name: spaceName,
        url: `https://huggingface.co/spaces/${spaceId}`,
        status: 'unknown',
        visibility: 'public',
        hardware: 'cpu-basic',
        sdk: 'docker',
      }
    } catch (error: any) {
      console.error('Error getting space status:', error)
      throw new Error(`Failed to get space status: ${error.message}`)
    }
  }

  async deleteSpace(spaceId: string): Promise<void> {
    try {
      console.log(`Deleting space ${spaceId}`)

      const repo: RepoDesignation = { type: 'space', name: spaceId }

      // 使用官方 deleteRepo 函数删除 Space
      await hfDeleteRepo({
        repo,
        credentials: { accessToken: this.accessToken }
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
      // 使用官方 whoAmI 函数验证 token
      await hfWhoAmI({
        credentials: { accessToken: this.accessToken }
      })
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  // 获取用户信息
  async getUserInfo(): Promise<any> {
    try {
      // 使用官方 whoAmI 函数获取用户信息
      const userInfo = await hfWhoAmI({
        credentials: { accessToken: this.accessToken }
      })
      return userInfo
    } catch (error: any) {
      console.error('Error getting user info:', error)
      throw new Error(`Failed to get user info: ${error.message}`)
    }
  }
}
