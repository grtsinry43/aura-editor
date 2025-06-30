import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Download, Star, Clock, MoreHorizontal, Menu, Save, RotateCcw } from "lucide-react"
import DocumentSidebar from "./document-sidebar"
import RichTextEditor from "./rich-text-editor"
import EditorContextMenu from "./editor-context-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import WelcomeDialog from "./welcome-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// localStorage 键名常量
const STORAGE_KEYS = {
  DOCUMENT_CONTENT: 'aura-editor-document-content',
  DOCUMENT_TITLE: 'aura-editor-document-title',
  LAST_SAVED: 'aura-editor-last-saved',
  FIRST_TIME_USER: 'aura-editor-first-time-user',
  USER_HAS_EDITED: 'aura-editor-user-has-edited' // 新增：标记用户是否真正编辑过
}

// 中英文版本的编辑器介绍内容
const getWelcomeContent = (language: string) => {
  if (language === 'zh') {
    return `
<h1>欢迎使用 Aura Editor 富文本编辑器</h1>

<h2>🎉 编辑器介绍</h2>
<p>Aura Editor 是一款现代化的富文本编辑器，专为高效写作和文档编辑而设计。它提供了丰富的编辑功能，让您能够创建专业级的文档内容。</p>

<h3>✨ 主要功能特性</h3>
<ul>
  <li><strong>富文本编辑</strong> - 支持粗体、斜体、下划线、删除线等文本格式</li>
  <li><strong>标题层级</strong> - 支持 H1-H6 六级标题，便于文档结构化</li>
  <li><strong>列表功能</strong> - 支持有序列表和无序列表</li>
  <li><strong>引用块</strong> - 突出显示重要引用内容</li>
  <li><strong>代码块</strong> - 支持代码高亮显示</li>
  <li><strong>链接和图片</strong> - 轻松插入外部链接和图片</li>
  <li><strong>表格支持</strong> - 创建和编辑数据表格</li>
  <li><strong>查找替换</strong> - 快速定位和替换文本内容</li>
  <li><strong>撤销重做</strong> - 完整的编辑历史记录</li>
</ul>

<h3>🎨 界面特色</h3>
<ul>
  <li><strong>响应式设计</strong> - 适配各种屏幕尺寸</li>
  <li><strong>深色/浅色主题</strong> - 支持主题切换，保护您的眼睛</li>
  <li><strong>多语言支持</strong> - 中英文界面切换</li>
  <li><strong>实时统计</strong> - 显示字数、段落数等文档统计信息</li>
  <li><strong>文档大纲</strong> - 自动生成文档结构导航</li>
</ul>

<h3>⌨️ 快捷键支持</h3>
<ul>
  <li><strong>Ctrl+B</strong> - 粗体</li>
  <li><strong>Ctrl+I</strong> - 斜体</li>
  <li><strong>Ctrl+U</strong> - 下划线</li>
  <li><strong>Ctrl+F</strong> - 查找</li>
  <li><strong>Ctrl+Z</strong> - 撤销</li>
  <li><strong>Ctrl+Y</strong> - 重做</li>
</ul>

<blockquote>
  <p>"好的工具能够提升工作效率，Aura Editor 致力于为您提供最佳的写作体验。"</p>
</blockquote>

<h3>🚀 开始使用</h3>
<p>现在您可以开始创建您的第一个文档了！编辑器会自动保存您的内容，您也可以随时导出或分享您的文档。</p>

<p><em>提示：您可以通过右上角的语言切换按钮在中英文界面之间切换。</em></p>
`
  } else {
    return `
<h1>Welcome to Aura Editor Rich Text Editor</h1>

<h2>🎉 Editor Introduction</h2>
<p>Aura Editor is a modern rich text editor designed for efficient writing and document editing. It provides comprehensive editing features that enable you to create professional-grade document content.</p>

<h3>✨ Key Features</h3>
<ul>
  <li><strong>Rich Text Editing</strong> - Support for bold, italic, underline, strikethrough, and other text formats</li>
  <li><strong>Heading Hierarchy</strong> - Support for H1-H6 headings for better document structure</li>
  <li><strong>List Functions</strong> - Support for ordered and unordered lists</li>
  <li><strong>Quote Blocks</strong> - Highlight important quoted content</li>
  <li><strong>Code Blocks</strong> - Support for code highlighting</li>
  <li><strong>Links and Images</strong> - Easily insert external links and images</li>
  <li><strong>Table Support</strong> - Create and edit data tables</li>
  <li><strong>Find and Replace</strong> - Quickly locate and replace text content</li>
  <li><strong>Undo/Redo</strong> - Complete editing history</li>
</ul>

<h3>🎨 Interface Features</h3>
<ul>
  <li><strong>Responsive Design</strong> - Adapts to various screen sizes</li>
  <li><strong>Dark/Light Theme</strong> - Theme switching to protect your eyes</li>
  <li><strong>Multi-language Support</strong> - Chinese/English interface switching</li>
  <li><strong>Real-time Statistics</strong> - Display word count, paragraph count, and other document statistics</li>
  <li><strong>Document Outline</strong> - Automatically generate document structure navigation</li>
</ul>

<h3>⌨️ Keyboard Shortcuts</h3>
<ul>
  <li><strong>Ctrl+B</strong> - Bold</li>
  <li><strong>Ctrl+I</strong> - Italic</li>
  <li><strong>Ctrl+U</strong> - Underline</li>
  <li><strong>Ctrl+F</strong> - Find</li>
  <li><strong>Ctrl+Z</strong> - Undo</li>
  <li><strong>Ctrl+Y</strong> - Redo</li>
</ul>

<blockquote>
  <p>"Good tools enhance productivity. Aura Editor is committed to providing you with the best writing experience."</p>
</blockquote>

<h3>🚀 Getting Started</h3>
<p>You can now start creating your first document! The editor will automatically save your content, and you can export or share your documents at any time.</p>

<p><em>Tip: You can switch between Chinese and English interfaces using the language toggle button in the top right corner.</em></p>
`
  }
}

export default function DocumentEditor() {
  const { t, i18n } = useTranslation()
  const [documentTitle, setDocumentTitle] = useState(t('document.title'))
  const [showSidebar, setShowSidebar] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>()
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isI18nReady, setIsI18nReady] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // 添加初始加载状态
  const [hasUserEdited, setHasUserEdited] = useState(false) // 用户是否真正编辑过
  const [isDirty, setIsDirty] = useState(false) // 文档是否有未保存的更改
  
  // 初始化为空字符串，然后在useEffect中设置欢迎内容
  const [documentContent, setDocumentContent] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<any>(null)
  const autoSaveTimeoutRef = useRef<number | null>(null)

  // 右键菜单状态
  const [hasSelection, setHasSelection] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  // 保存到 localStorage 的函数
  const saveToLocalStorage = useCallback((content?: string, title?: string, isAutoSave = false) => {
    try {
      if (isAutoSave) {
        setIsSaving(false) // 自动保存不显示保存中状态
      } else {
        setIsSaving(true)
      }
      
      if (content !== undefined) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENT_CONTENT, content)
      }
      
      if (title !== undefined) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENT_TITLE, title)
      }
      
      const now = new Date()
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, now.toISOString())
      setLastSaved(now)
      
      // 只有在用户真正编辑过后才标记不再是首次使用者
      const userHasEdited = localStorage.getItem(STORAGE_KEYS.USER_HAS_EDITED) === 'true'
      if (userHasEdited && !isInitialLoad) {
        localStorage.setItem(STORAGE_KEYS.FIRST_TIME_USER, 'false')
      }
      
      // 清除dirty状态
      setIsDirty(false)
      
      // 只有手动保存才显示成功提示
      if (!isAutoSave) {
        toast.success(t('notifications.documentSaved'))
      }
    } catch (error) {
      console.error('保存到 localStorage 失败:', error)
      if (!isAutoSave) {
        toast.error(t('notifications.documentSavedError'))
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false)
      }
    }
  }, [t, isInitialLoad])

  // 从 localStorage 读取数据的函数
  const loadFromLocalStorage = useCallback((currentLanguage?: string) => {
    try {
      const savedContent = localStorage.getItem(STORAGE_KEYS.DOCUMENT_CONTENT)
      const savedTitle = localStorage.getItem(STORAGE_KEYS.DOCUMENT_TITLE)
      const savedLastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED)
      const isFirstTimeUser = !localStorage.getItem(STORAGE_KEYS.FIRST_TIME_USER)
      const userHasEdited = localStorage.getItem(STORAGE_KEYS.USER_HAS_EDITED) === 'true'
      
      // 判断是否应该显示欢迎内容
      const shouldShowWelcome = !userHasEdited && (!savedContent || savedContent.trim() === '')
      
      if (shouldShowWelcome) {
        // 显示欢迎内容（根据当前语言）
        const language = currentLanguage || i18n.language || 'zh'
        const welcomeContent = getWelcomeContent(language)
        setDocumentContent(welcomeContent)
        setHasUserEdited(false) // 显示欢迎内容不算用户编辑
      } else if (savedContent) {
        // 有保存的内容，直接加载
        setDocumentContent(savedContent)
        setHasUserEdited(userHasEdited)
      } else {
        // 没有保存的内容，显示空内容
        setDocumentContent('')
        setHasUserEdited(userHasEdited)
      }
      
      if (savedTitle) {
        setDocumentTitle(savedTitle)
      }
      
      if (savedLastSaved) {
        setLastSaved(new Date(savedLastSaved))
        setIsDirty(false) // 刚加载的内容不是dirty的
      }
      
      // 标记初始加载完成
      setTimeout(() => setIsInitialLoad(false), 1000)
    } catch (error) {
      console.error('从 localStorage 读取数据失败:', error)
      // 如果读取失败，根据是否首次使用决定显示什么
      const userHasEdited = localStorage.getItem(STORAGE_KEYS.USER_HAS_EDITED) === 'true'
      const shouldShowWelcome = !userHasEdited
      
      if (shouldShowWelcome) {
        const language = currentLanguage || i18n.language || 'zh'
        const welcomeContent = getWelcomeContent(language)
        setDocumentContent(welcomeContent)
        setHasUserEdited(false)
      } else {
        setDocumentContent('')
        setHasUserEdited(userHasEdited)
      }
      
      // 标记初始加载完成
      setTimeout(() => setIsInitialLoad(false), 1000)
    }
  }, [i18n.language])

  // 清除用户编辑状态，重新显示欢迎内容
  const resetToWelcomeContent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER_HAS_EDITED)
    localStorage.removeItem(STORAGE_KEYS.DOCUMENT_CONTENT)
    setHasUserEdited(false)
    setIsDirty(false)
    
    // 重新加载欢迎内容
    const language = i18n.language || 'zh'
    const welcomeContent = getWelcomeContent(language)
    setDocumentContent(welcomeContent)
    
    // 清除自动保存定时器
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    toast.success(t('notifications.contentReset'))
  }, [i18n.language, t])

  // 手动保存函数
  const handleManualSave = useCallback(() => {
    saveToLocalStorage(documentContent, documentTitle, false)
  }, [saveToLocalStorage, documentContent, documentTitle])

  // 监听i18n初始化状态
  useEffect(() => {
    if (i18n.isInitialized && i18n.language) {
      setIsI18nReady(true)
    }
  }, [i18n.isInitialized, i18n.language])

  // 初始化加载数据 - 等待i18n准备完成
  useEffect(() => {
    if (isI18nReady) {
      loadFromLocalStorage(i18n.language)
    }
  }, [isI18nReady, loadFromLocalStorage, i18n.language])

  // 处理语言变化时的欢迎内容更新
  useEffect(() => {
    if (!isI18nReady) return // 等待i18n初始化完成
    
    const userHasEdited = localStorage.getItem(STORAGE_KEYS.USER_HAS_EDITED) === 'true'
    const savedContent = localStorage.getItem(STORAGE_KEYS.DOCUMENT_CONTENT)
    
    // 只有在用户还没有真正编辑过的情况下才切换语言时更新欢迎内容
    const shouldShowWelcome = !userHasEdited && (!savedContent || savedContent.trim() === '')
    
    if (shouldShowWelcome) {
      const welcomeContent = getWelcomeContent(i18n.language || 'zh')
      
      // 临时设置为初始加载状态，避免触发自动保存
      const originalInitialLoad = isInitialLoad
      setIsInitialLoad(true)
      
      setDocumentContent(welcomeContent)
      
      // 500ms后恢复初始加载状态
      setTimeout(() => setIsInitialLoad(originalInitialLoad), 500)
    }
  }, [i18n.language, isI18nReady, isInitialLoad])

  // 检查是否显示欢迎窗口
  useEffect(() => {
    const isWelcomeDismissed = localStorage.getItem('aura-editor-welcome-dismissed')
    if (!isWelcomeDismissed) {
      // 延迟一点时间显示，让界面先渲染完成
      const timer = setTimeout(() => {
        setShowWelcomeDialog(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleTitleEdit = () => {
    setIsEditing(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const handleTitleSave = () => {
    setIsEditing(false)
    // 保存标题到 localStorage
    saveToLocalStorage(undefined, documentTitle, false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const handleContentChange = useCallback((content: string) => {
    setDocumentContent(content)
    
    // 如果是初始加载期间，不触发自动保存和dirty状态
    if (isInitialLoad) {
      return
    }
    
    // 检查是否是欢迎内容 - 更准确的检测
    const isWelcomeContent = content.includes('欢迎使用 Aura Editor') || 
                            content.includes('Welcome to Aura Editor') ||
                            content.includes('🎉 编辑器介绍') ||
                            content.includes('🎉 Editor Introduction')
    
    // 只有当内容不是欢迎内容且不为空时，才标记用户已编辑过
    if (content.trim() && !isWelcomeContent && !hasUserEdited) {
      setHasUserEdited(true)
      // 永久标记用户已编辑过
      localStorage.setItem(STORAGE_KEYS.USER_HAS_EDITED, 'true')
    }
    
    // 设置dirty状态（除非是欢迎内容）
    if (!isWelcomeContent) {
      setIsDirty(true)
    }
    
    // 清除之前的自动保存定时器
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    // 设置新的自动保存定时器（5秒防抖，减少频率）
    // 只有非欢迎内容才自动保存
    if (!isWelcomeContent) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage(content, undefined, true)
      }, 5000)
    }
  }, [saveToLocalStorage, isInitialLoad, hasUserEdited])

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // 监听选择变化
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      setHasSelection(selection ? selection.toString().length > 0 : false)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // 右键菜单处理函数
  const handleUndo = () => {
    document.execCommand('undo')
  }

  const handleRedo = () => {
    document.execCommand('redo')
  }

  const handleCut = () => {
    document.execCommand('cut')
    toast.success(t('toast.cut'))
  }

  const handleCopy = () => {
    document.execCommand('copy')
    toast.success(t('toast.copied'))
  }

  const handlePaste = async () => {
    try {
      // 尝试使用现代的clipboard API
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text) {
          // 获取当前焦点的编辑器
          const editor = document.querySelector('[contenteditable="true"]')
          if (editor) {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              range.deleteContents()
              range.insertNode(document.createTextNode(text))
              range.collapse(false)
              selection.removeAllRanges()
              selection.addRange(range)
            }
          }
          toast.success(t('toast.pasted'))
        }
      } else {
        // 回退到execCommand
        document.execCommand('paste')
        toast.success(t('toast.pasted'))
      }
    } catch (error) {
      // 如果clipboard API失败，尝试execCommand
      try {
        document.execCommand('paste')
        toast.success(t('toast.pasted'))
      } catch (e) {
        console.error('Paste failed:', e)
        // 可以添加一个错误提示
        toast.error(t('toast.pasteError'))
      }
    }
  }

  const handleSelectAll = () => {
    document.execCommand('selectAll')
  }

  const handleBold = () => {
    document.execCommand('bold')
  }

  const handleItalic = () => {
    document.execCommand('italic')
  }

  const handleUnderline = () => {
    document.execCommand('underline')
  }

  const handleStrikethrough = () => {
    document.execCommand('strikethrough')
  }

  const handleAlignLeft = () => {
    document.execCommand('justifyLeft')
  }

  const handleAlignCenter = () => {
    document.execCommand('justifyCenter')
  }

  const handleAlignRight = () => {
    document.execCommand('justifyRight')
  }

  const handleAlignJustify = () => {
    document.execCommand('justifyFull')
  }

  const handleBulletList = () => {
    document.execCommand('insertUnorderedList')
  }

  const handleNumberedList = () => {
    document.execCommand('insertOrderedList')
  }

  const handleQuote = () => {
    document.execCommand('formatBlock', false, 'blockquote')
  }

  const handleCode = () => {
    document.execCommand('formatBlock', false, 'pre')
  }

  const handleLink = () => {
    const url = prompt(t('prompts.enterLinkUrl'))
    if (url) {
      document.execCommand('createLink', false, url)
    }
  }

  const handleImage = () => {
    const url = prompt(t('prompts.enterImageUrl'))
    if (url) {
      document.execCommand('insertImage', false, url)
    }
  }

  const handleTable = () => {
    const rows = prompt(t('prompts.enterTableRows'), '3')
    const cols = prompt(t('prompts.enterTableCols'), '3')
    if (rows && cols) {
      const table = document.createElement('table')
      table.style.borderCollapse = 'collapse'
      table.style.width = '100%'
      
      for (let i = 0; i < parseInt(rows); i++) {
        const tr = document.createElement('tr')
        for (let j = 0; j < parseInt(cols); j++) {
          const td = document.createElement('td')
          td.style.border = '1px solid #ccc'
          td.style.padding = '8px'
          td.textContent = `${t('prompts.tableCell')} ${i+1}-${j+1}`
          tr.appendChild(td)
        }
        table.appendChild(tr)
      }
      
      document.execCommand('insertHTML', false, table.outerHTML)
    }
  }

  const handleFind = () => {
    const query = prompt(t('prompts.enterSearchText'))
    if (query) {
      // 简单的查找实现
      const text = document.querySelector('[contenteditable="true"]')?.textContent || ''
      const index = text.indexOf(query)
      if (index !== -1) {
        alert(t('alerts.textFound', { query, index }))
      } else {
        alert(t('alerts.textNotFound', { query }))
      }
    }
  }

  const handleReplace = () => {
    const find = prompt(t('prompts.enterSearchText'))
    const replace = prompt(t('prompts.enterReplaceText'))
    if (find && replace) {
      const editor = document.querySelector('[contenteditable="true"]')
      if (editor) {
        editor.innerHTML = editor.innerHTML.replace(new RegExp(find, 'g'), replace)
      }
    }
  }

  const handleIndent = () => {
    document.execCommand('indent')
  }

  const handleOutdent = () => {
    document.execCommand('outdent')
  }

  const handleRemoveFormatting = () => {
    document.execCommand('removeFormat')
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50))
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
  }

  // 添加键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleManualSave])

  // 添加浏览器离开提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = '您有未保存的更改，确定要离开吗？'
        return '您有未保存的更改，确定要离开吗？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 toolbar-glass sticky top-0 z-50">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="lg:hidden shrink-0 p-2"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">A</span>
            </div>
            
            <div className="flex flex-col min-w-0 flex-1">
              {isEditing ? (
                <Input
                  ref={titleInputRef}
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  placeholder={t('document.untitled')}
                  className="text-sm sm:text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-muted px-2 py-1 rounded max-w-xs"
                />
              ) : (
                <h1
                  className="text-sm sm:text-lg font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded truncate max-w-xs"
                  onClick={handleTitleEdit}
                  title={documentTitle || t('document.untitled')}
                >
                  {documentTitle || t('document.untitled')}
                </h1>
              )}
              <div className="hidden sm:flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {lastSaved && (
                  <div className="flex items-center space-x-1">
                    <span>{t('document.lastSaved')} {lastSaved.toLocaleTimeString()}</span>
                    {isSaving && (
                      <span className="text-blue-500 text-xs">{t('common.saving')}</span>
                    )}
                    {!isSaving && isDirty && (
                      <span className="text-orange-500 text-xs" title="有未保存的更改">●</span>
                    )}
                    {!isSaving && !isDirty && lastSaved && (
                      <span className="text-green-500 text-xs" title="已保存">✓</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          {/* 移动端只显示核心功能 */}
          <div className="flex items-center space-x-1 sm:hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="p-2"
                >
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('common.save')}</p>
              </TooltipContent>
            </Tooltip>
            
            <LanguageToggle />
            <ThemeToggle />
            
            <Button className="bg-primary hover:bg-primary/90 text-xs px-2 py-1 h-8">
              <Share2 className="w-3 h-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={resetToWelcomeContent}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('actions.resetToWelcome')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  {t('common.download')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  {t('actions.star')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 桌面端显示完整功能 */}
          <div className="hidden sm:flex items-center space-x-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">{isSaving ? t('common.saving') : t('common.save')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('common.save')}</p>
              </TooltipContent>
            </Tooltip>
            
            <LanguageToggle />
            <ThemeToggle />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('actions.star')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('common.download')}</p>
              </TooltipContent>
            </Tooltip>

            <Button className="bg-primary hover:bg-primary/90">
              <Share2 className="w-4 h-4 mr-2" />
              {t('common.share')}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={resetToWelcomeContent}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('actions.resetToWelcome')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  {t('common.download')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  {t('actions.star')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        {showSidebar && (
          <div className={`
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            w-80 lg:w-auto
            transition-transform duration-300 ease-in-out lg:transition-none
            lg:translate-x-0
          `}>
            <DocumentSidebar 
              onClose={() => setShowSidebar(false)} 
              documentContent={documentContent} 
            />
          </div>
        )}

        {/* Editor Area with Context Menu */}
        <div className="flex-1 overflow-hidden editor-scrollbar">
          <EditorContextMenu
            onUndo={handleUndo}
            onRedo={handleRedo}
            onCut={handleCut}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onSelectAll={handleSelectAll}
            onBold={handleBold}
            onItalic={handleItalic}
            onUnderline={handleUnderline}
            onStrikethrough={handleStrikethrough}
            onAlignLeft={handleAlignLeft}
            onAlignCenter={handleAlignCenter}
            onAlignRight={handleAlignRight}
            onAlignJustify={handleAlignJustify}
            onBulletList={handleBulletList}
            onNumberedList={handleNumberedList}
            onQuote={handleQuote}
            onCode={handleCode}
            onLink={handleLink}
            onImage={handleImage}
            onTable={handleTable}
            onFind={handleFind}
            onReplace={handleReplace}
            onIndent={handleIndent}
            onOutdent={handleOutdent}
            onRemoveFormatting={handleRemoveFormatting}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            canUndo={false}
            canRedo={false}
            hasSelection={hasSelection}
          >
            <div 
              className="h-full"
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top left',
                width: `${100 / (zoomLevel / 100)}%`
              }}
            >
              <RichTextEditor ref={editorRef} initialContent={documentContent} onChange={handleContentChange} />
            </div>
          </EditorContextMenu>
        </div>
      </div>

      {/* 欢迎窗口 */}
      <WelcomeDialog 
        isOpen={showWelcomeDialog}
        onClose={() => {
          setShowWelcomeDialog(false)
          // 标记用户不再是首次使用者，避免重复显示欢迎内容
          localStorage.setItem(STORAGE_KEYS.FIRST_TIME_USER, 'false')
        }}
      />
    </div>
  )
}
