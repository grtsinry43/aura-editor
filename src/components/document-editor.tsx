import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Download, Star, Clock, MoreHorizontal, Menu } from "lucide-react"
import DocumentSidebar from "./document-sidebar"
import RichTextEditor from "./rich-text-editor"
import EditorContextMenu from "./editor-context-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { toast } from "sonner"

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
  
  // 初始化为空字符串，然后在useEffect中设置欢迎内容
  const [documentContent, setDocumentContent] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<any>(null)

  // 右键菜单状态
  const [hasSelection, setHasSelection] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  // 初始化欢迎内容
  useEffect(() => {
    const welcomeContent = getWelcomeContent(i18n.language || 'zh')
    setDocumentContent(welcomeContent)
  }, [i18n.language])

  const handleTitleEdit = () => {
    setIsEditing(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const handleTitleSave = () => {
    setIsEditing(false)
    setLastSaved(new Date())
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
    setLastSaved(new Date())
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
    const url = prompt('请输入链接地址:')
    if (url) {
      document.execCommand('createLink', false, url)
    }
  }

  const handleImage = () => {
    const url = prompt('请输入图片地址:')
    if (url) {
      document.execCommand('insertImage', false, url)
    }
  }

  const handleTable = () => {
    const rows = prompt('请输入行数:', '3')
    const cols = prompt('请输入列数:', '3')
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
          td.textContent = `单元格 ${i+1}-${j+1}`
          tr.appendChild(td)
        }
        table.appendChild(tr)
      }
      
      document.execCommand('insertHTML', false, table.outerHTML)
    }
  }

  const handleFind = () => {
    const query = prompt('请输入要查找的文本:')
    if (query) {
      // 简单的查找实现
      const text = document.querySelector('[contenteditable="true"]')?.textContent || ''
      const index = text.indexOf(query)
      if (index !== -1) {
        alert(`找到文本 "${query}" 在位置 ${index}`)
      } else {
        alert(`未找到文本 "${query}"`)
      }
    }
  }

  const handleReplace = () => {
    const find = prompt('请输入要查找的文本:')
    const replace = prompt('请输入要替换的文本:')
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

  // 监听选择变化
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      setHasSelection(selection ? selection.toString().length > 0 : false)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  useEffect(() => {
    setLastSaved(new Date())
    const interval = setInterval(() => {
      setLastSaved(new Date())
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
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
                  className="text-sm sm:text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-muted px-2 py-1 rounded"
                />
              ) : (
                <h1
                  className="text-sm sm:text-lg font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded truncate"
                  onClick={handleTitleEdit}
                  title={documentTitle}
                >
                  {documentTitle}
                </h1>
              )}
              <div className="hidden sm:flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {lastSaved && <span>{t('document.lastSaved')} {lastSaved.toLocaleTimeString()}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          {/* 移动端只显示核心功能 */}
          <div className="flex items-center space-x-1 sm:hidden">
            <LanguageToggle />
            <ThemeToggle />
            
            <Button className="bg-primary hover:bg-primary/90 text-xs px-2 py-1 h-8">
              <Share2 className="w-3 h-3" />
            </Button>

            <Button variant="ghost" size="sm" className="p-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* 桌面端显示完整功能 */}
          <div className="hidden sm:flex items-center space-x-3">
            <LanguageToggle />
            <ThemeToggle />
            
            <Button variant="ghost" size="sm" title={t('actions.star')}>
              <Star className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" title={t('common.download')}>
              <Download className="w-4 h-4" />
            </Button>

            <Button className="bg-primary hover:bg-primary/90">
              <Share2 className="w-4 h-4 mr-2" />
              {t('common.share')}
            </Button>

            <Button variant="ghost" size="sm" title={t('common.more')}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
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
    </div>
  )
}
