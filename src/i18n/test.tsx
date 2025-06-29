import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function I18nTest() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">国际化测试</h2>
      <p>当前语言: {i18n.language}</p>
      <Button onClick={toggleLanguage}>
        切换到 {i18n.language === 'en' ? '中文' : 'English'}
      </Button>
      
      <div className="space-y-2">
        <p><strong>文档相关:</strong></p>
        <p>标题: {t('document.title')}</p>
        <p>最后保存: {t('document.lastSaved')}</p>
        <p>字数: {t('document.wordCount')}</p>
        
        <p><strong>编辑器相关:</strong></p>
        <p>粗体: {t('editor.bold')}</p>
        <p>斜体: {t('editor.italic')}</p>
        <p>下划线: {t('editor.underline')}</p>
        
        <p><strong>侧边栏相关:</strong></p>
        <p>大纲: {t('sidebar.outline')}</p>
        <p>统计: {t('sidebar.statistics')}</p>
        
        <p><strong>通用:</strong></p>
        <p>分享: {t('common.share')}</p>
        <p>下载: {t('common.download')}</p>
        <p>取消: {t('common.cancel')}</p>
      </div>
    </div>
  )
} 