import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Table,
  Quote,
  Code,
  Undo,
  Redo,
  Highlighter,
  Indent,
  Outdent,
  RemoveFormatting,
  Search,
  Type,
  ChevronUp,
  ChevronDown,
  X,
  Replace,
  CornerDownLeft,
  FileText,
  Edit,
  MoreHorizontal,
  Palette
} from "lucide-react"

interface RichTextEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  className?: string
}

const RichTextEditor = forwardRef(function RichTextEditor({ initialContent = "", onChange, className = "" }: RichTextEditorProps, ref) {
  const { t } = useTranslation()
  const editorRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(initialContent)
  const [isInitialized, setIsInitialized] = useState(false)

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.innerHTML || ""
  }))

  // Dialog states
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [showReplaceInput, setShowReplaceInput] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)

  // Form states
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [searchResults, setSearchResults] = useState<HTMLElement[]>([])
  const [currentResultIndex, setCurrentResultIndex] = useState(-1)
  const [selectedTableCell, setSelectedTableCell] = useState<HTMLElement | null>(null)

  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6600",
    "#FFCC00",
    "#00FF00",
    "#0066FF",
    "#6600FF",
    "#FF0066",
    "#FF3366",
    "#FF6699",
    "#66FF99",
    "#6699FF",
    "#9966FF",
  ]

  // Handle content changes
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      // 确保内容同步到父组件
      onChangeRef.current?.(newContent)
    }
  }, [])

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent
      setContent(initialContent)
      setIsInitialized(true)
    }
  }, [initialContent])

  // Clear table cell selection
  const clearTableCellSelection = useCallback(() => {
    if (!editorRef.current) return

    const highlightedCells = editorRef.current.querySelectorAll('td.selected-cell, th.selected-cell')
    highlightedCells.forEach(cell => {
      cell.classList.remove('selected-cell')
    })
    setSelectedTableCell(null)
  }, [])

  // Handle table cell selection
  const handleTableCellSelection = useCallback(() => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    let currentElement = range.startContainer as Node

    // Traverse up to find if we're inside a table cell
    while (currentElement && currentElement !== editorRef.current) {
      if (currentElement.nodeType === Node.ELEMENT_NODE) {
        const element = currentElement as HTMLElement
        if (element.tagName === 'TD' || element.tagName === 'TH') {
          // Clear previous selection
          clearTableCellSelection()

          // Highlight current cell
          element.classList.add('selected-cell')
          setSelectedTableCell(element)
          return
        }
      }
      currentElement = currentElement.parentNode!
    }

    // If we're not in a table cell, clear selection
    clearTableCellSelection()
  }, [clearTableCellSelection])

  // Handle selection change to update table cell highlighting
  useEffect(() => {
    const handleSelectionChange = () => {
      // Use setTimeout to ensure the selection has been updated
      setTimeout(handleTableCellSelection, 0)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [handleTableCellSelection])

  // Add CSS styles for table cell selection highlighting
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .selected-cell {
        background-color: hsl(var(--primary) / 0.1) !important;
        box-shadow: 0 0 0 2px hsl(var(--primary)) !important;
        position: relative;
      }
      
      .selected-cell::after {
        content: '';
        position: absolute;
        top: -2px;
        right: -2px;
        bottom: -2px;
        left: -2px;
        border: 2px solid hsl(var(--primary));
        pointer-events: none;
        border-radius: 2px;
        z-index: 1;
      }

      /* 查找替换高亮样式 */
      .search-highlight {
        background-color: hsl(var(--warning) / 0.3) !important;
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      .search-highlight.current {
        background-color: hsl(var(--destructive)) !important;
        color: hsl(var(--destructive-foreground)) !important;
        box-shadow: 0 0 0 2px hsl(var(--destructive));
        animation: pulse-highlight 1s ease-in-out;
      }

      @keyframes pulse-highlight {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Execute editor commands
  const handleCommand = useCallback(
    (command: string, value?: string) => {
      if (!editorRef.current) return

      editorRef.current.focus()

      try {
        document.execCommand(command, false, value)
        handleContentChange()
      } catch (error) {
        console.error("Command execution failed:", error)
      }
    },
    [handleContentChange],
  )

  // Insert link with custom text
  const handleInsertLink = useCallback(() => {
    if (!linkUrl || !linkText || !editorRef.current) return

    editorRef.current.focus()

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const link = document.createElement("a")
      link.href = linkUrl
      link.textContent = linkText
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      link.className = "text-blue-600 hover:underline"

      range.deleteContents()
      range.insertNode(link)

      // Move cursor after the link
      range.setStartAfter(link)
      range.setEndAfter(link)
      selection.removeAllRanges()
      selection.addRange(range)

      handleContentChange()
    }

    setLinkUrl("")
    setLinkText("")
    setShowLinkDialog(false)
  }, [linkUrl, linkText, handleContentChange])

  // Insert image
  const handleInsertImage = useCallback(() => {
    if (!imageUrl || !editorRef.current) return

    editorRef.current.focus()

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const img = document.createElement("img")
      img.src = imageUrl
      img.alt = imageAlt || "Image"
      img.className = "max-w-full h-auto rounded-lg my-4"

      range.deleteContents()
      range.insertNode(img)

      // Move cursor after the image
      range.setStartAfter(img)
      range.setEndAfter(img)
      selection.removeAllRanges()
      selection.addRange(range)

      handleContentChange()
    }

    setImageUrl("")
    setImageAlt("")
    setShowImageDialog(false)
  }, [imageUrl, imageAlt, handleContentChange])

  // Insert table
  const handleInsertTable = useCallback(() => {
    if (!editorRef.current) return

    editorRef.current.focus()

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      const table = document.createElement("table")
      table.className = "border-collapse border border-gray-300 w-full my-4"

      for (let i = 0; i < tableRows; i++) {
        const row = document.createElement("tr")

        for (let j = 0; j < tableCols; j++) {
          const cell = document.createElement(i === 0 ? "th" : "td")
          cell.className =
            i === 0 ? "border border-gray-300 bg-gray-100 p-2 font-semibold text-left" : "border border-gray-300 p-2"

          // 修复默认内容问题 - 避免使用可能被误认为标题的文本
          cell.textContent = i === 0 ? `列 ${j + 1}` : `单元格 ${i + 1}-${j + 1}`
          row.appendChild(cell)
        }

        table.appendChild(row)
      }

      range.deleteContents()
      range.insertNode(table)

      // Move cursor after the table
      range.setStartAfter(table)
      range.setEndAfter(table)
      selection.removeAllRanges()
      selection.addRange(range)

      handleContentChange()
    }

    setShowTableDialog(false)
  }, [tableRows, tableCols, handleContentChange])

  const clearSearch = useCallback(() => {
    if (!editorRef.current) return
    const marks = editorRef.current.querySelectorAll("mark.search-highlight")
    marks.forEach((mark) => {
      const parent = mark.parentNode
      if (parent) {
        // 修复 replaceWith 兼容性问题
        const textNode = document.createTextNode(mark.textContent || "")
        parent.insertBefore(textNode, mark)
        parent.removeChild(mark)
        parent.normalize()
      }
    })
    setSearchResults([])
    setCurrentResultIndex(-1)
  }, [])

  const performSearch = useCallback(() => {
    if (!editorRef.current) return

    // Clear previous highlights but preserve the content within them
    const marks = editorRef.current.querySelectorAll("mark.search-highlight")
    marks.forEach((mark) => {
      const parent = mark.parentNode
      if (parent) {
        const textNode = document.createTextNode(mark.textContent || "")
        parent.insertBefore(textNode, mark)
        parent.removeChild(mark)
      }
    })

    // Normalize text nodes after removing marks
    if (editorRef.current) {
      editorRef.current.normalize()
    }

    if (!searchQuery.trim()) {
      setSearchResults([])
      setCurrentResultIndex(-1)
      return
    }

    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip nodes that are already inside search highlights
          if (node.parentElement?.closest(".search-highlight")) {
            return NodeFilter.FILTER_REJECT
          }
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )

    const textNodes: Text[] = []
    let node
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text)
    }

    const results: HTMLElement[] = []
    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue || ""
      if (regex.test(text)) {
        const parent = textNode.parentNode
        if (!parent) return

        const fragment = document.createDocumentFragment()
        let lastIndex = 0
        let match

        // Reset regex lastIndex for global search
        regex.lastIndex = 0

        while ((match = regex.exec(text)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            const beforeText = text.slice(lastIndex, match.index)
            fragment.appendChild(document.createTextNode(beforeText))
          }

          // Create highlighted match
          const mark = document.createElement("mark")
          mark.className = "search-highlight"
          mark.textContent = match[0]
          results.push(mark)
          fragment.appendChild(mark)

          lastIndex = match.index + match[0].length

          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) {
            regex.lastIndex++
          }
        }

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
        }

        parent.replaceChild(fragment, textNode)
      }
    })

    setSearchResults(results)
    if (results.length > 0) {
      setCurrentResultIndex(0)
      results[0].classList.add('current')
      results[0].scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      setCurrentResultIndex(-1)
    }
  }, [searchQuery])

  // 修复搜索功能的自动触发
  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        performSearch()
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      clearSearch()
    }
  }, [searchQuery, performSearch, clearSearch])

  // 更新搜索结果导航功能，为当前项添加特殊样式
  useEffect(() => {
    if (searchResults.length > 0 && currentResultIndex >= 0) {
      // 移除之前的当前选中样式
      searchResults.forEach(result => result.classList.remove('current'))
      // 为当前结果添加选中样式
      if (searchResults[currentResultIndex]) {
        searchResults[currentResultIndex].classList.add('current')
      }
    }
  }, [currentResultIndex, searchResults])

  const navigateSearchResults = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return

    // 移除当前的高亮
    if (currentResultIndex >= 0 && searchResults[currentResultIndex]) {
      searchResults[currentResultIndex].classList.remove('current')
    }

    const nextIndex =
      direction === "next"
        ? (currentResultIndex + 1) % searchResults.length
        : (currentResultIndex - 1 + searchResults.length) % searchResults.length

    setCurrentResultIndex(nextIndex)

    // 为新的当前项添加高亮
    if (searchResults[nextIndex]) {
      searchResults[nextIndex].classList.add('current')
      searchResults[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Search and replace
  // 修复替换单个功能 - 支持撤销
  const handleReplaceOne = useCallback(() => {
    if (!editorRef.current || !searchQuery || currentResultIndex === -1 || searchResults.length === 0) return

    // 获取当前选中的搜索结果
    const currentResult = searchResults[currentResultIndex]
    if (!currentResult || !currentResult.parentNode) return

    editorRef.current.focus()

    try {
      // 创建选择范围选中当前搜索结果
      const selection = window.getSelection()
      if (!selection) return

      const range = document.createRange()
      range.selectNode(currentResult)
      selection.removeAllRanges()
      selection.addRange(range)

      // 使用 execCommand 进行替换，这样可以被撤销
      document.execCommand('insertText', false, replaceText)

      // 更新内容
      handleContentChange()

      // 延迟重新搜索以确保DOM更新完成
      setTimeout(() => {
        const previousIndex = currentResultIndex
        performSearch()

        // 重新搜索后，尝试将焦点移到合适的位置
        setTimeout(() => {
          if (searchResults.length > 0) {
            // 如果还有搜索结果，尝试定位到替换位置附近
            const newIndex = Math.min(previousIndex, searchResults.length - 1)
            setCurrentResultIndex(newIndex)

            // 移除所有当前样式
            searchResults.forEach(result => result.classList.remove('current'))

            // 为新的当前项添加样式
            if (searchResults[newIndex]) {
              searchResults[newIndex].classList.add('current')
              searchResults[newIndex].scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }
        }, 10)
      }, 50)
    } catch (error) {
      console.error('Replace operation failed:', error)
      // 如果 execCommand 失败，回退到直接DOM操作
      const parent = currentResult.parentNode
      const textNode = document.createTextNode(replaceText)
      parent.replaceChild(textNode, currentResult)
      parent.normalize()
      handleContentChange()
    }
  }, [searchQuery, replaceText, currentResultIndex, searchResults, performSearch, handleContentChange])

  // 修复替换全部功能 - 支持撤销，避免破坏HTML结构
  const handleReplaceAll = useCallback(() => {
    if (!editorRef.current || !searchQuery.trim()) return

    editorRef.current.focus()

    try {
      // 先清除搜索高亮，确保干净的内容
      clearSearch()

      // 创建正则表达式
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")

      // 使用TreeWalker只在文本节点中进行替换，避免破坏HTML结构
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // 跳过script和style标签内的文本
            const parent = node.parentElement
            if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
              return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
          }
        }
      )

      const textNodes: Text[] = []
      let node
      while ((node = walker.nextNode())) {
        const text = node.nodeValue || ""
        if (regex.test(text)) {
          textNodes.push(node as Text)
        }
      }

      // 如果有匹配的文本节点，进行替换
      if (textNodes.length > 0) {
        // 保存当前选择状态（在外层定义）
        const selection = window.getSelection()
        const savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null

        // 为了支持撤销，我们使用一个更可靠的方法
        // 临时插入一个特殊字符然后立即删除，这样可以创建有效的撤销点
        if (selection) {
          // 在编辑器开头创建一个临时的撤销点
          const tempRange = document.createRange()
          tempRange.setStart(editorRef.current, 0)
          tempRange.setEnd(editorRef.current, 0)
          selection.removeAllRanges()
          selection.addRange(tempRange)

          // 插入一个零宽度空格字符然后立即删除，创建撤销点
          document.execCommand('insertText', false, '\u200B')
          document.execCommand('delete', false)
        }

        // 进行文本替换（只替换文本节点内容）
        textNodes.forEach((textNode) => {
          const text = textNode.nodeValue || ""
          const newText = text.replace(regex, replaceText)
          textNode.nodeValue = newText
        })

        // 恢复选择状态
        if (selection && savedRange) {
          selection.removeAllRanges()
          try {
            selection.addRange(savedRange)
          } catch (e) {
            // 如果无法恢复原始选择，就清除选择
            selection.removeAllRanges()
          }
        }

        handleContentChange()
      }

      // 清理状态
      setSearchQuery("")
      setReplaceText("")
      setShowSearchBar(false)
      setShowReplaceInput(false)
    } catch (error) {
      console.error('Replace all operation failed:', error)
      // 如果出错，至少清理状态
      setSearchQuery("")
      setReplaceText("")
      setShowSearchBar(false)
      setShowReplaceInput(false)
    }
  }, [searchQuery, replaceText, clearSearch, handleContentChange])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            handleCommand("bold")
            break
          case "i":
            e.preventDefault()
            handleCommand("italic")
            break
          case "u":
            e.preventDefault()
            handleCommand("underline")
            break
          case "f":
            e.preventDefault()
            setShowSearchBar(true)
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              handleCommand("redo")
              toast.success(t('toast.redo'))
            } else {
              handleCommand("undo")
              toast.success(t('toast.undo'))
            }
            break
          case "y":
            e.preventDefault()
            handleCommand("redo")
            toast.success(t('toast.redo'))
            break
          case "c":
            e.preventDefault()
            document.execCommand('copy')
            toast.success(t('toast.copied'))
            break
          case "x":
            e.preventDefault()
            document.execCommand('cut')
            toast.success(t('toast.cut'))
            break
        }
      }
    },
    [handleCommand, t],
  )

  // Handle paste events
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData("text/plain")
      const html = e.clipboardData.getData("text/html")

      // Use HTML if available, otherwise use plain text
      const content = html || text.replace(/\n/g, "<br>")

      if (content) {
        document.execCommand("insertHTML", false, content)
        handleContentChange()
        toast.success(t('toast.pasted'))
      }
    },
    [handleContentChange, t],
  )

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center px-4 py-2 border-b bg-muted/30 dark:bg-muted/60 space-x-1 overflow-x-auto relative">
        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                handleCommand("undo")
                toast.success(t('toast.undo'))
              }} 
            >
              <Undo className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{`${t('editor.undo')} (Ctrl+Z)`}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                handleCommand("redo")
                toast.success(t('toast.redo'))
              }} 
            >
              <Redo className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{`${t('editor.redo')} (Ctrl+Y)`}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Font Family */}
        <Select defaultValue="Arial" onValueChange={(value) => handleCommand("fontName", value)}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select defaultValue="3" onValueChange={(value) => handleCommand("fontSize", value)}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">10px</SelectItem>
            <SelectItem value="2">12px</SelectItem>
            <SelectItem value="3">14px</SelectItem>
            <SelectItem value="4">16px</SelectItem>
            <SelectItem value="5">18px</SelectItem>
            <SelectItem value="6">24px</SelectItem>
            <SelectItem value="7">32px</SelectItem>
          </SelectContent>
        </Select>

        {/* Heading Styles */}
        <Select onValueChange={(value) => handleCommand("formatBlock", `<${value}>`)}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue placeholder={t('editor.heading')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="div">{t('editor.paragraph')}</SelectItem>
            <SelectItem value="h1">{t('editor.heading1')}</SelectItem>
            <SelectItem value="h2">{t('editor.heading2')}</SelectItem>
            <SelectItem value="h3">{t('editor.heading3')}</SelectItem>
            <SelectItem value="h4">{t('editor.heading4')}</SelectItem>
            <SelectItem value="h5">{t('editor.heading5')}</SelectItem>
            <SelectItem value="h6">{t('editor.heading6')}</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Text Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("bold")}>
              <Bold className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{`${t('editor.bold')} (Ctrl+B)`}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("italic")}>
              <Italic className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{`${t('editor.italic')} (Ctrl+I)`}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("underline")}>
              <Underline className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{`${t('editor.underline')} (Ctrl+U)`}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("strikethrough")}>
              <Strikethrough className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.strikethrough')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("formatBlock", "pre")}>
              <Code className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.code')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Text Color */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleCommand("foreColor", color)  
                        setShowColorPicker(false)
                      }}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.textColor')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Highlight Color */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={showHighlightPicker} onOpenChange={setShowHighlightPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Highlighter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handleCommand("hiliteColor", color)
                        setShowHighlightPicker(false)
                      }}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.highlightColor')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyLeft")}>
              <AlignLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.alignLeft')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyCenter")}>
              <AlignCenter className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.alignCenter')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyRight")}>
              <AlignRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.alignRight')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("justifyFull")}>
              <AlignJustify className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.alignJustify')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("insertUnorderedList")}>
              <List className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.unorderedList')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("insertOrderedList")}>
              <ListOrdered className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.orderedList')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("formatBlock", "blockquote")}>
              <Quote className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.quote')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Insert */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleInsertLink}>
              <Link className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.insertLink')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleInsertImage}>
              <ImageIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.insertImage')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleInsertTable}>
              <Table className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.insertTable')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Indent */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("indent")}>
              <Indent className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.increaseIndent')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("outdent")}>
              <Outdent className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.decreaseIndent')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearchBar(!showSearchBar)}
            >
              <Search className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>查找和替换 (Ctrl+F)</p>
          </TooltipContent>
        </Tooltip>

        {/* Clear Format */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => handleCommand("removeFormat")}>
              <RemoveFormatting className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('editor.clearFormat')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Search Bar */}
      {showSearchBar && (
        <div className="border-b bg-muted/50 dark:bg-muted/70">
          {/* Search Input Row */}
          <div className="flex items-center px-4 py-2 space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Find in document..."
              className="h-8 flex-1 max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) {
                    navigateSearchResults("prev")
                  } else {
                    navigateSearchResults("next")
                  }
                } else if (e.key === "Escape") {
                  setShowSearchBar(false)
                  clearSearch()
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateSearchResults("prev")}
              disabled={searchResults.length === 0}
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateSearchResults("next")}
              disabled={searchResults.length === 0}
              title="Next match (Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-fit">
              {searchResults.length > 0 ? `${currentResultIndex + 1} of ${searchResults.length}` : "No results"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplaceInput(!showReplaceInput)}
              title="Toggle replace"
            >
              <CornerDownLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearchBar(false)
                setShowReplaceInput(false)
                clearSearch()
              }}
              title="Close (Escape)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Replace Input Row */}
          {showReplaceInput && (
            <div className="flex items-center px-4 py-2 space-x-2 border-t">
              <Replace className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Replace with..."
                className="h-8 flex-1 max-w-xs"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleReplaceOne()
                  } else if (e.key === "Escape") {
                    setShowReplaceInput(false)
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplaceOne}
                disabled={searchResults.length === 0 || currentResultIndex === -1}
                title="Replace current match"
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplaceAll}
                disabled={searchResults.length === 0}
                title="Replace all matches"
              >
                Replace All
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-auto editor-scrollbar">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="p-8 max-w-4xl mx-auto outline-none
            prose prose-lg max-w-none
            prose-headings:font-semibold prose-headings:text-foreground
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-ul:my-4 prose-li:my-1
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-muted prose-blockquote:py-2
            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto prose-pre:text-sm
            prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm
            prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:my-4
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            focus:outline-none selection:bg-primary/20"
          style={{
            lineHeight: "1.6",
            fontSize: "16px",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            minHeight: "calc(100vh - 200px)",
          }}
        />
      </div>
    </div>
  )
})

export default RichTextEditor;
