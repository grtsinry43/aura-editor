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
  const { t } = useTranslation()
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
      title: t('welcome.features.richText.title'),
      description: t('welcome.features.richText.description')
    },
    {
      icon: <Layout className="w-5 h-5" />,
      title: t('welcome.features.smartOutline.title'),
      description: t('welcome.features.smartOutline.description')
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: t('welcome.features.realTimeStats.title'),
      description: t('welcome.features.realTimeStats.description')
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: t('welcome.features.themeToggle.title'),
      description: t('welcome.features.themeToggle.description')
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: t('welcome.features.multiLanguage.title'),
      description: t('welcome.features.multiLanguage.description')
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* 背景遮罩 - 深浅色优化 */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 animate-in fade-in duration-300 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 欢迎窗口 - 增强毛玻璃效果和深浅色适配 */}
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-auto animate-in zoom-in-95 fade-in duration-500 ease-out">
        {/* 主容器 - 改进的毛玻璃效果 */}
        <div className="bg-background/95 dark:bg-background/90 backdrop-blur-xl border border-border/50 dark:border-border/30 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 ring-1 ring-white/10 dark:ring-white/5">
          {/* 头部渐变背景层 */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/15 dark:via-primary/8 dark:to-transparent rounded-t-2xl" />
          
          {/* 头部内容 */}
          <div className="relative p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {/* Logo图标 - 增强渐变效果 */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 dark:shadow-primary/40 ring-2 ring-white/20 dark:ring-white/10">
                  <Sparkles className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent drop-shadow-sm">
                    {t('welcome.title')}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1 font-medium">
                    {t('welcome.subtitle')}
                  </p>
                </div>
              </div>
              {/* 关闭按钮 - 深浅色优化 */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="opacity-80 hover:opacity-100 transition-all duration-200 -mt-1 bg-muted/50 hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/60 border border-border/50 dark:border-border/30 hover:scale-105"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="px-6 pb-6">
            <div className="space-y-5">
              {/* 简介文字 - 改进排版 */}
              <div className="text-center">
                <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                  {t('welcome.description')}
                </p>
              </div>

              {/* 功能亮点 - 增强卡片效果 */}
              <div className="grid grid-cols-2 gap-3">
                {features.slice(0, 4).map((feature, index) => (
                  <div 
                    key={index}
                    className="group p-4 rounded-xl border border-border/50 dark:border-border/30 bg-card/50 dark:bg-card/30 hover:bg-card/80 dark:hover:bg-card/60 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/20 hover:scale-[1.02] hover:border-primary/30 dark:hover:border-primary/40"
                  >
                    <div className="flex items-start space-x-3">
                      {/* 图标容器 - 增强效果 */}
                      <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/20 dark:group-hover:bg-primary/25 transition-all duration-300 shadow-sm ring-1 ring-primary/20 dark:ring-primary/30 group-hover:shadow-md group-hover:shadow-primary/20">
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs mb-1.5 text-foreground group-hover:text-primary transition-colors duration-200">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-200">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部操作区 - 改进样式 */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/50 dark:border-border/30">
              <div className="flex items-center space-x-2.5">
                <Checkbox 
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                  className="border-border/60 dark:border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor="dont-show-again" 
                  className="text-xs text-muted-foreground cursor-pointer select-none font-medium hover:text-foreground transition-colors duration-200"
                >
                  {t('welcome.dontShowAgain')}
                </label>
              </div>
              {/* 开始使用按钮 - 增强效果 */}
              <Button 
                onClick={handleClose} 
                size="sm" 
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-200 border border-primary/20"
              >
                {t('welcome.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 