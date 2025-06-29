import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Sparkles, Edit, Layout, Zap, Palette, Globe } from 'lucide-react'

interface WelcomeDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function WelcomeDialog({ isOpen, onClose }: WelcomeDialogProps) {
  const { i18n } = useTranslation()
  const [dontShowAgain, setDontShowAgain] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('aura-editor-welcome-dismissed', 'true')
    }
    onClose()
  }

  const features = [
    {
      icon: <Edit className="w-5 h-5" />,
      title: i18n.language === 'zh' ? '富文本编辑' : 'Rich Text Editing',
      description: i18n.language === 'zh' ? '支持完整的文本格式和样式' : 'Full text formatting and styling support'
    },
    {
      icon: <Layout className="w-5 h-5" />,
      title: i18n.language === 'zh' ? '智能大纲' : 'Smart Outline',
      description: i18n.language === 'zh' ? '自动生成文档结构导航' : 'Auto-generate document structure navigation'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: i18n.language === 'zh' ? '实时统计' : 'Real-time Stats',
      description: i18n.language === 'zh' ? '字数统计和阅读时间估算' : 'Word count and reading time estimation'
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: i18n.language === 'zh' ? '主题切换' : 'Theme Toggle',
      description: i18n.language === 'zh' ? '深色浅色主题自由切换' : 'Switch between dark and light themes'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: i18n.language === 'zh' ? '多语言支持' : 'Multi-language',
      description: i18n.language === 'zh' ? '中英文界面完美支持' : 'Perfect support for Chinese and English'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* 背景 - 压暗遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* 欢迎窗口 - 增强毛玻璃效果 */}
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-auto animate-in zoom-in-95 fade-in duration-500 ease-out">
        <div className="bg-background/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-xl shadow-2xl shadow-black/25 dark:shadow-black/40">
          {/* 头部 */}
          <div className="relative p-6 pb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 dark:from-white/5 dark:to-white/2 rounded-t-xl" />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {i18n.language === 'zh' ? '欢迎使用 Aura Editor' : 'Welcome to Aura Editor'}
                  </h2>
                  <p className="text-foreground/80 text-sm mt-0.5">
                    {i18n.language === 'zh' ? '现代化富文本编辑器' : 'Modern Rich Text Editor'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="opacity-70 hover:opacity-100 transition-opacity -mt-1 bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 内容 */}
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {/* 简介 */}
              <div className="text-center">
                <p className="text-foreground/70 leading-relaxed text-sm">
                  {i18n.language === 'zh' 
                    ? '专为高效写作设计，提供丰富功能和优雅体验。'
                    : 'Designed for efficient writing with rich features and elegant experience.'
                  }
                </p>
              </div>

              {/* 功能亮点 */}
              <div className="grid grid-cols-2 gap-3">
                {features.slice(0, 4).map((feature, index) => (
                  <div 
                    key={index}
                    className="group p-3 rounded-lg border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors">
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs mb-1 text-foreground">{feature.title}</h3>
                        <p className="text-xs text-foreground/60 leading-snug">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部 */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                />
                <label 
                  htmlFor="dont-show-again" 
                  className="text-xs text-foreground/60 cursor-pointer select-none"
                >
                  {i18n.language === 'zh' ? '不再显示此窗口' : "Don't show this again"}
                </label>
              </div>
              <Button onClick={handleClose} size="sm" className="px-6 bg-primary/90 hover:bg-primary text-white">
                {i18n.language === 'zh' ? '开始使用' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 