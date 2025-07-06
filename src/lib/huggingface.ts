// Hugging Face API 客户端
// 使用官方 Hugging Face Hub API

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
  private token: string
  private username: string
  private baseUrl = 'https://huggingface.co/api'

  constructor(token: string, username: string) {
    this.token = token
    this.username = username
  }

  async createSpace(params: CreateSpaceParams): Promise<SpaceInfo> {
    const spaceId = `${this.username}/${params.spaceName}`
    
    try {
      // 创建Space的API调用
      const response = await fetch(`${this.baseUrl}/repos/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'space',
          name: params.spaceName,
          organization: this.username,
          private: params.visibility === 'private',
          sdk: params.sdk,
          hardware: params.hardware,
          description: params.description || '',
          tags: params.tags || [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create space: ${response.status} ${errorData}`)
      }

      const data = await response.json()
      
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
      const response = await fetch(`${this.baseUrl}/repos/${spaceId}/upload/main/${filePath}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: Buffer.from(content).toString('base64'),
          encoding: 'base64',
          message: `Upload ${filePath}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to upload file: ${response.status} ${errorData}`)
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      throw new Error(`Failed to upload file to Space: ${error.message}`)
    }
  }

  async getSpaceStatus(spaceId: string): Promise<SpaceInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${spaceId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get space status: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        id: spaceId,
        name: data.name,
        url: `https://huggingface.co/spaces/${spaceId}`,
        status: data.runtime?.stage || 'unknown',
        visibility: data.private ? 'private' : 'public',
        hardware: data.runtime?.hardware || 'cpu-basic',
        sdk: data.sdk || 'docker',
      }
    } catch (error: any) {
      console.error('Error getting space status:', error)
      throw new Error(`Failed to get space status: ${error.message}`)
    }
  }

  async deleteSpace(spaceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: spaceId,
          type: 'space',
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete space: ${response.status}`)
      }
    } catch (error: any) {
      console.error('Error deleting space:', error)
      throw new Error(`Failed to delete space: ${error.message}`)
    }
  }

  // 验证token是否有效
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/whoami-v2`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      return response.ok
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/whoami-v2`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Error getting user info:', error)
      throw new Error(`Failed to get user info: ${error.message}`)
    }
  }
}
