import { useState, useMemo, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, Search, Hash, Type, ImageIcon, FileText, List, Quote, Link2, Clock } from "lucide-react"
import { useDebounce as useDebounceHook } from "@/hooks/use-debounce"

const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>
  }
  const regex = new RegExp(`(${highlight})`, "gi")
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

interface DocumentSidebarProps {
  onClose: () => void
  documentContent: string
}

interface OutlineItem {
  id: string
  title: string
  level: number
  type: "heading"
}

interface DocumentStats {
  words: number
  characters: number
  charactersNoSpaces: number
  paragraphs: number
  sentences: number
  headings: number
  images: number
  links: number
  lists: number
  quotes: number
  readingTime: number
}

export default function DocumentSidebar({ onClose, documentContent }: DocumentSidebarProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCompactMode, setIsCompactMode] = useState(false)
  const [documentOutline, setDocumentOutline] = useState<OutlineItem[]>([])
  const [documentStats, setDocumentStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    sentences: 0,
    headings: 0,
    images: 0,
    links: 0,
    lists: 0,
    quotes: 0,
    readingTime: 0,
  })

  // Debounce content changes to improve performance
  const debouncedContent = useDebounceHook(documentContent, 300)

  // Parse document content to extract outline
  useEffect(() => {
    if (typeof window === "undefined" || !debouncedContent.trim()) {
      setDocumentOutline([])
      return
    }

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(debouncedContent, "text/html")
      const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")

      const outline = Array.from(headings)
        .map((heading, index) => {
          const title = heading.textContent?.trim() || ""
          if (!title) return null

          return {
            id: `heading-${index}`,
            title: title.length > 50 ? title.substring(0, 50) + "..." : title,
            level: Number.parseInt(heading.tagName.charAt(1)),
            type: "heading" as const,
          }
        })
        .filter(Boolean) as OutlineItem[]
      setDocumentOutline(outline)
    } catch (error) {
      console.error("Error parsing document outline:", error)
      setDocumentOutline([])
    }
  }, [debouncedContent])

  // Calculate document statistics with better performance
  useEffect(() => {
    const defaultStats = {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      paragraphs: 0,
      sentences: 0,
      headings: 0,
      images: 0,
      links: 0,
      lists: 0,
      quotes: 0,
      readingTime: 0,
    }

    if (typeof window === "undefined" || !debouncedContent.trim()) {
      setDocumentStats(defaultStats)
      return
    }

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(debouncedContent, "text/html")

      // Get clean text content
      const textContent = doc.body.textContent || ""
      const cleanText = textContent.replace(/\s+/g, " ").trim()

      // Count words (more accurate)
      const words = cleanText ? cleanText.split(/\s+/).filter((word) => word.length > 0).length : 0

      // Count characters
      const characters = textContent.length
      const charactersNoSpaces = textContent.replace(/\s/g, "").length

      // Count sentences (improved regex - more accurate)
      const sentenceRegex = /[.!?。！？]+(?=\s|$)/g
      const sentences = cleanText ? (cleanText.match(sentenceRegex) || []).length : 0

      // Count various elements
      const paragraphs = doc.querySelectorAll("p, div").length
      const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6").length
      const images = doc.querySelectorAll("img").length
      const links = doc.querySelectorAll("a[href]").length
      const lists = doc.querySelectorAll("ul, ol").length
      const quotes = doc.querySelectorAll("blockquote").length

      // Calculate reading time (average 200 words per minute)
      const readingTime = Math.max(1, Math.ceil(words / 200))

      setDocumentStats({
        words,
        characters,
        charactersNoSpaces,
        paragraphs,
        sentences,
        headings,
        images,
        links,
        lists,
        quotes,
        readingTime,
      })
    } catch (error) {
      console.error("Error calculating document stats:", error)
      setDocumentStats(defaultStats)
    }
  }, [debouncedContent])

  // Filter outline based on search query
  const filteredOutline = useMemo(() => {
    if (!searchQuery.trim()) return documentOutline

    const query = searchQuery.toLowerCase()
    return documentOutline.filter((item) => item.title.toLowerCase().includes(query))
  }, [documentOutline, searchQuery])

  // Handle outline item click - scroll to heading
  const handleOutlineClick = useCallback((item: OutlineItem) => {
    try {
      // Find the heading in the document and scroll to it
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      const targetHeading = Array.from(headings).find((heading) => {
        const headingText = heading.textContent?.trim() || ""
        return headingText === item.title || headingText.startsWith(item.title.replace("...", ""))
      })

      if (targetHeading) {
        targetHeading.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })

        // Highlight the heading temporarily
        targetHeading.classList.add("bg-yellow-100", "dark:bg-yellow-800", "transition-colors", "duration-500")
        setTimeout(() => {
          targetHeading.classList.remove("bg-yellow-100", "dark:bg-yellow-800", "transition-colors", "duration-500")
        }, 2000)
      }
    } catch (error) {
      console.error("Error scrolling to heading:", error)
    }
  }, [])

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toLocaleString()
  }

  return (
    <div className="w-80 sm:w-64 lg:w-64 border-r bg-background/95 backdrop-blur-sm lg:bg-muted/30 flex flex-col h-full shadow-lg lg:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background/90 backdrop-blur-sm">
        <h3 className="font-semibold text-sm sm:text-base">{t('sidebar.outline')}</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCompactMode(!isCompactMode)}
            className="p-1.5 h-7 w-7"
            title={isCompactMode ? "展开模式" : "紧凑模式"}
          >
            {isCompactMode ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden p-2">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 sm:p-4 bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('sidebar.searchPlaceholder')}
            className="pl-10 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Outline */}
      <ScrollArea className="flex-1 px-3 sm:px-4 sidebar-scrollbar">
        <div className="space-y-1 py-2">
          {filteredOutline.length > 0 ? (
            filteredOutline.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`flex items-start space-x-2 ${isCompactMode ? 'p-1.5' : 'p-2 sm:p-2.5'} rounded-md hover:bg-muted cursor-pointer text-sm transition-colors group ${
                  item.level === 1
                    ? "font-semibold"
                    : item.level === 2
                      ? `font-medium ${isCompactMode ? 'ml-2' : 'ml-3 sm:ml-4'}`
                      : item.level === 3
                        ? `${isCompactMode ? 'ml-4' : 'ml-6 sm:ml-8'}`
                        : item.level === 4
                          ? `${isCompactMode ? 'ml-6' : 'ml-9 sm:ml-12'}`
                          : `${isCompactMode ? 'ml-8' : 'ml-12 sm:ml-16'}`
                }`}
                onClick={() => handleOutlineClick(item)}
                title={item.title}
              >
                {!isCompactMode && (
                  <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                )}
                <span className={`leading-tight ${isCompactMode ? 'text-xs' : 'text-xs sm:text-sm'} ${isCompactMode ? 'line-clamp-1' : 'line-clamp-2'}`}>
                  <Highlight text={item.title} highlight={searchQuery} />
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-4">
              {searchQuery ? t('document.noResults') : t('document.noHeadings')}
            </div>
          )}
        </div>

        <Separator className="my-3 sm:my-4" />

        {/* Document Stats */}
        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">{t('sidebar.statistics')}</h4>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-2"></div>
          </div>
          
          {/* Two-column compact layout */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            {/* Row 1 */}
            <div className="flex flex-col items-center p-2 rounded-md bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-all duration-200">
              <div className="flex items-center space-x-1 mb-1">
                <div className="p-0.5 rounded bg-blue-500/10">
                  <Type className="w-2 h-2 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-700 dark:text-blue-300 font-medium truncate">{formatNumber(documentStats.words)}</span>
              </div>
              <span className="text-xs text-muted-foreground/80 leading-none">字数</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-md bg-green-50/40 dark:bg-green-950/20 border border-green-200/30 dark:border-green-800/20 hover:bg-green-50/60 dark:hover:bg-green-950/30 transition-all duration-200">
              <div className="flex items-center space-x-1 mb-1">
                <div className="p-0.5 rounded bg-green-500/10">
                  <FileText className="w-2 h-2 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-700 dark:text-green-300 font-medium truncate">{formatNumber(documentStats.characters)}</span>
              </div>
              <span className="text-xs text-muted-foreground/80 leading-none">字符</span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col items-center p-2 rounded-md bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/30 dark:border-orange-800/20 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 transition-all duration-200">
              <div className="flex items-center space-x-1 mb-1">
                <div className="p-0.5 rounded bg-orange-500/10">
                  <FileText className="w-2 h-2 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-orange-700 dark:text-orange-300 font-medium truncate">{formatNumber(documentStats.sentences)}</span>
              </div>
              <span className="text-xs text-muted-foreground/80 leading-none">句子</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-md bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/20 hover:bg-slate-50/60 dark:hover:bg-slate-950/30 transition-all duration-200">
              <div className="flex items-center space-x-1 mb-1">
                <div className="p-0.5 rounded bg-slate-500/10">
                  <FileText className="w-2 h-2 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{formatNumber(documentStats.paragraphs)}</span>
              </div>
              <span className="text-xs text-muted-foreground/80 leading-none">段落</span>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col items-center p-2 rounded-md bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/30 dark:border-indigo-800/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-all duration-200">
              <div className="flex items-center space-x-1 mb-1">
                <div className="p-0.5 rounded bg-indigo-500/10">
                  <Hash className="w-2 h-2 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-indigo-700 dark:text-indigo-300 font-medium truncate">{documentStats.headings}</span>
              </div>
              <span className="text-xs text-muted-foreground/80 leading-none">标题</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-md bg-red-50/40 dark:bg-red-950/20 border border-red-200/30 dark:border-red-800/20 hover:bg-red-50/60 dark:hover:bg-red-950/30 transition-all duration-200">
              <div className="flex items-center space-x-1 mb-1">
                <div className="p-0.5 rounded bg-red-500/10">
                  <Clock className="w-2 h-2 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-red-700 dark:text-red-300 font-medium truncate">{documentStats.readingTime}分</span>
              </div>
              <span className="text-xs text-muted-foreground/80 leading-none">阅读</span>
            </div>

            {/* Conditional Stats - Only show if > 0 */}
            {documentStats.images > 0 && (
              <div className="flex flex-col items-center p-2 rounded-md bg-pink-50/40 dark:bg-pink-950/20 border border-pink-200/30 dark:border-pink-800/20 hover:bg-pink-50/60 dark:hover:bg-pink-950/30 transition-all duration-200">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="p-0.5 rounded bg-pink-500/10">
                    <ImageIcon className="w-2 h-2 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="text-pink-700 dark:text-pink-300 font-medium truncate">{documentStats.images}</span>
                </div>
                <span className="text-xs text-muted-foreground/80 leading-none">图片</span>
              </div>
            )}

            {documentStats.links > 0 && (
              <div className="flex flex-col items-center p-2 rounded-md bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200/30 dark:border-cyan-800/20 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30 transition-all duration-200">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="p-0.5 rounded bg-cyan-500/10">
                    <Link2 className="w-2 h-2 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="text-cyan-700 dark:text-cyan-300 font-medium truncate">{documentStats.links}</span>
                </div>
                <span className="text-xs text-muted-foreground/80 leading-none">链接</span>
              </div>
            )}

            {documentStats.lists > 0 && (
              <div className="flex flex-col items-center p-2 rounded-md bg-yellow-50/40 dark:bg-yellow-950/20 border border-yellow-200/30 dark:border-yellow-800/20 hover:bg-yellow-50/60 dark:hover:bg-yellow-950/30 transition-all duration-200">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="p-0.5 rounded bg-yellow-500/10">
                    <List className="w-2 h-2 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium truncate">{documentStats.lists}</span>
                </div>
                <span className="text-xs text-muted-foreground/80 leading-none">列表</span>
              </div>
            )}

            {documentStats.quotes > 0 && (
              <div className="flex flex-col items-center p-2 rounded-md bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/30 dark:border-teal-800/20 hover:bg-teal-50/60 dark:hover:bg-teal-950/30 transition-all duration-200">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="p-0.5 rounded bg-teal-500/10">
                    <Quote className="w-2 h-2 text-teal-600 dark:text-teal-400" />
                  </div>
                  <span className="text-teal-700 dark:text-teal-300 font-medium truncate">{documentStats.quotes}</span>
                </div>
                <span className="text-xs text-muted-foreground/80 leading-none">引用</span>
              </div>
            )}
          </div>

          {/* Coming Soon: Summary Feature */}
          <div className="mt-6 p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10 hover:bg-muted/20 transition-all duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1 rounded-md bg-primary/10">
                <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-primary">智能总结</span>
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">即将推出</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI 驱动的文档摘要和关键点提取功能正在开发中，敬请期待后续版本更新。
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
