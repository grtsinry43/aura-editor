import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2, Download, Star, Clock, MoreHorizontal, Menu } from "lucide-react"
import DocumentSidebar from "./document-sidebar"
import RichTextEditor from "./rich-text-editor"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const initialContent = `
<h1>Project Proposal: Next-Generation Collaboration Platform</h1>

<h2>Introduction</h2>
<p>In today's rapidly evolving digital landscape, effective collaboration has become the cornerstone of successful organizations. This proposal outlines our vision for developing a next-generation collaboration platform that will revolutionize how teams work together, regardless of their physical location.</p>

<h2>Project Overview</h2>
<p>Our proposed collaboration platform will integrate cutting-edge technologies to provide seamless real-time collaboration, intelligent document management, and enhanced communication tools. The platform will serve as a comprehensive solution for modern workplace challenges.</p>

<h3>Goals and Objectives</h3>
<ul>
  <li>Develop an intuitive, user-friendly interface that requires minimal training</li>
  <li>Implement real-time collaboration features with conflict resolution</li>
  <li>Ensure enterprise-grade security and compliance standards</li>
  <li>Provide seamless integration with existing business tools</li>
  <li>Support scalability for organizations of all sizes</li>
</ul>

<h2>Timeline</h2>
<p>The project is structured in four phases, spanning 12 months from initiation to full deployment.</p>

<blockquote>
  <p>"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill</p>
</blockquote>

<h3>Q1 Milestones</h3>
<p>During the first quarter, we will focus on foundational development and core feature implementation. This includes setting up the development environment, creating the basic architecture, and implementing essential collaboration features.</p>

<h3>Q2 Deliverables</h3>
<p>The second quarter will concentrate on advanced features, user interface refinement, and initial testing phases. We will also begin integration work with popular third-party applications.</p>

<h2>Budget Analysis</h2>
<p>The total project budget is estimated at <strong>$2.5 million</strong>, distributed across development, infrastructure, testing, and deployment phases. This investment will yield significant returns through improved productivity and reduced operational costs.</p>

<h3>Resource Allocation</h3>
<p>Our team consists of experienced developers, UX designers, project managers, and quality assurance specialists. Each team member brings unique expertise that contributes to the project's success.</p>

<h1>Conclusion</h1>
<p>This collaboration platform represents a significant opportunity to transform how organizations operate in the digital age. With proper execution and stakeholder support, we can deliver a solution that exceeds expectations and drives meaningful business value.</p>
`

export default function DocumentEditor() {
  const [documentTitle, setDocumentTitle] = useState("Project Proposal Document")
  const [showSidebar, setShowSidebar] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>()
  const [documentContent, setDocumentContent] = useState(initialContent)
  const titleInputRef = useRef<HTMLInputElement>(null)

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

  const handleContentChange = (content: string) => {
    setDocumentContent(content)
    setLastSaved(new Date())
  }

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
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden">
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <div className="flex flex-col">
              {isEditing ? (
                <Input
                  ref={titleInputRef}
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-muted px-2 py-1 rounded"
                />
              ) : (
                <h1
                  className="text-lg font-semibold cursor-pointer hover:bg-muted px-2 py-1 rounded"
                  onClick={handleTitleEdit}
                >
                  {documentTitle}
                </h1>
              )}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {lastSaved && <span>Last saved {lastSaved.toLocaleTimeString()}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <Button variant="ghost" size="sm">
            <Star className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>

          <Button className="bg-primary hover:bg-primary/90">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && <DocumentSidebar onClose={() => setShowSidebar(false)} documentContent={documentContent} />}

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden editor-scrollbar">
          <RichTextEditor initialContent={initialContent} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  )
}
