import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GitHub to Hugging Face Deployer',
  description: '一键将GitHub Docker项目部署到Hugging Face Spaces',
  keywords: ['GitHub', 'Hugging Face', 'Docker', 'Deployment', 'AI', 'Machine Learning'],
  authors: [{ name: 'GH2HF Deployer' }],
  openGraph: {
    title: 'GitHub to Hugging Face Deployer',
    description: '一键将GitHub Docker项目部署到Hugging Face Spaces',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub to Hugging Face Deployer',
    description: '一键将GitHub Docker项目部署到Hugging Face Spaces',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">GH</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">GitHub to HF Deployer</h1>
                    <p className="text-sm text-muted-foreground">一键部署Docker项目到Hugging Face Spaces</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href="/health"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    健康检查
                  </a>
                  <a
                    href="https://github.com/nariahlamb/gh2hf-deployer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://huggingface.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hugging Face
                  </a>
                </div>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          
          <footer className="border-t mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">
                  Built with ❤️ using Next.js, Tailwind CSS, and Hugging Face Hub API
                </p>
                <p className="text-sm">
                  开源项目 • 
                  <a 
                    href="https://github.com/your-username/gh2hf-deployer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline ml-1"
                  >
                    查看源码
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
