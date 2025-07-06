export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface DockerConfig {
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  dockerfilePath?: string;
  dockerComposePath?: string;
  exposedPorts: number[];
  baseImage?: string;
  workdir?: string;
  entrypoint?: string[];
  cmd?: string[];
  env?: Record<string, string>;
}

export interface HuggingFaceSpace {
  id: string;
  name: string;
  url: string;
  status: 'building' | 'running' | 'error' | 'stopped';
  visibility: 'public' | 'private';
  hardware: 'cpu-basic' | 'cpu-upgrade' | 'gpu-t4';
  sdk: 'docker' | 'gradio' | 'streamlit' | 'static';
}

export interface DeploymentConfig {
  spaceName: string;
  visibility: 'public' | 'private';
  hardware: 'cpu-basic' | 'cpu-upgrade' | 'gpu-t4';
  description?: string;
  tags?: string[];
}

export interface DeploymentStatus {
  stage: 'validating' | 'creating' | 'uploading' | 'building' | 'deploying' | 'completed' | 'error';
  progress: number;
  message: string;
  logs?: string[];
  error?: string;
  spaceUrl?: string;
}

export interface AppState {
  // Repository state
  repoUrl: string;
  repoInfo: GitHubRepo | null;
  dockerConfig: DockerConfig | null;
  
  // Deployment state
  deploymentConfig: DeploymentConfig | null;
  deploymentStatus: DeploymentStatus | null;
  
  // UI state
  currentStep: 'input' | 'validate' | 'configure' | 'deploy' | 'complete';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRepoUrl: (url: string) => void;
  setRepoInfo: (info: GitHubRepo | null) => void;
  setDockerConfig: (config: DockerConfig | null) => void;
  setDeploymentConfig: (config: DeploymentConfig | null) => void;
  setDeploymentStatus: (status: DeploymentStatus | null) => void;
  setCurrentStep: (step: AppState['currentStep']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GitHubApiError {
  message: string;
  status: number;
  documentation_url?: string;
}
