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
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">{t('sidebar.outline')}</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('sidebar.searchPlaceholder')}
            className="pl-10 h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Outline */}
      <ScrollArea className="flex-1 px-4 sidebar-scrollbar">
        <div className="space-y-1">
          {filteredOutline.length > 0 ? (
            filteredOutline.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`flex items-start space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer text-sm transition-colors group ${
                  item.level === 1
                    ? "font-semibold"
                    : item.level === 2
                      ? "font-medium ml-4"
                      : item.level === 3
                        ? "ml-8"
                        : item.level === 4
                          ? "ml-12"
                          : "ml-16"
                }`}
                onClick={() => handleOutlineClick(item)}
                title={item.title}
              >
                <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                <span className="truncate leading-tight">
                  <Highlight text={item.title} highlight={searchQuery} />
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? t('document.noResults') : t('document.noHeadings')}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Document Stats */}
        <div className="space-y-3 pb-4">
          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">{t('sidebar.statistics')}</h4>
          <div className="space-y-2 text-sm">
            {/* Basic Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-blue-500" />
                <span>{t('document.wordCount')}</span>
              </div>
              <span className="font-medium">{formatNumber(documentStats.words)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span>{t('document.characterCount')}</span>
              </div>
              <span className="font-medium">{formatNumber(documentStats.characters)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>{t('document.characterCountNoSpaces')}</span>
              </div>
              <span className="font-medium">{formatNumber(documentStats.charactersNoSpaces)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>{t('document.sentenceCount')}</span>
              </div>
              <span className="font-medium">{formatNumber(documentStats.sentences)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{t('document.paragraphCount')}</span>
              </div>
              <span className="font-medium">{formatNumber(documentStats.paragraphs)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-indigo-500" />
                <span>{t('document.headingCount')}</span>
              </div>
              <span className="font-medium">{documentStats.headings}</span>
            </div>

            {/* Reading Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{t('document.readingTime')}</span>
              </div>
              <span className="font-medium">{documentStats.readingTime} {t('document.minutes')}</span>
            </div>

            {/* Conditional Stats - Only show if > 0 */}
            {documentStats.images > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  <span>{t('document.imageCount')}</span>
                </div>
                <span className="font-medium">{documentStats.images}</span>
              </div>
            )}

            {documentStats.links > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4 text-cyan-500" />
                  <span>{t('document.linkCount')}</span>
                </div>
                <span className="font-medium">{documentStats.links}</span>
              </div>
            )}

            {documentStats.lists > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <List className="w-4 h-4 text-yellow-500" />
                  <span>{t('document.listCount')}</span>
                </div>
                <span className="font-medium">{documentStats.lists}</span>
              </div>
            )}

            {documentStats.quotes > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Quote className="w-4 h-4 text-teal-500" />
                  <span>{t('document.quoteCount')}</span>
                </div>
                <span className="font-medium">{documentStats.quotes}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {documentStats.words > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="text-xs text-primary font-medium mb-1">Document Summary</div>
              <div className="text-xs text-primary/80">
                {documentStats.words > 1000 ? "Long" : documentStats.words > 500 ? "Medium" : "Short"} document with{" "}
                {documentStats.headings} section{documentStats.headings !== 1 ? "s" : ""}. {documentStats.readingTime}{" "}
                minute{documentStats.readingTime !== 1 ? "s" : ""} to read.
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
