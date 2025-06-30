import React from "react"
import { useTranslation } from "react-i18next"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Copy,
  Scissors,
  Clipboard,
  Undo,
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
  Quote,
  Code,
  Link,
  ImageIcon,
  Table,
  Search,
  Type,
  Indent,
  Outdent,
  RemoveFormatting,
  MousePointer,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Replace,
} from "lucide-react"

interface EditorContextMenuProps {
  children: React.ReactNode
  onCopy?: () => void
  onCut?: () => void
  onPaste?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSelectAll?: () => void
  onBold?: () => void
  onItalic?: () => void
  onUnderline?: () => void
  onStrikethrough?: () => void
  onAlignLeft?: () => void
  onAlignCenter?: () => void
  onAlignRight?: () => void
  onAlignJustify?: () => void
  onBulletList?: () => void
  onNumberedList?: () => void
  onQuote?: () => void
  onCode?: () => void
  onLink?: () => void
  onImage?: () => void
  onTable?: () => void
  onFind?: () => void
  onReplace?: () => void
  onIndent?: () => void
  onOutdent?: () => void
  onRemoveFormatting?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
  canUndo?: boolean
  canRedo?: boolean
  hasSelection?: boolean
}

export default function EditorContextMenu({
  children,
  onCopy,
  onCut,
  onPaste,
  onUndo,
  onRedo,
  onSelectAll,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onBulletList,
  onNumberedList,
  onQuote,
  onCode,
  onLink,
  onImage,
  onTable,
  onFind,
  onReplace,
  onIndent,
  onOutdent,
  onRemoveFormatting,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo = false,
  canRedo = false,
  hasSelection = false,
}: EditorContextMenuProps) {
  const { t } = useTranslation()

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Common operations */}
        <ContextMenuItem onClick={onUndo} disabled={!canUndo}>
          <Undo className="mr-2 h-4 w-4" />
          {t('contextMenu.undo')}
          <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onRedo} disabled={!canRedo}>
          <RotateCcw className="mr-2 h-4 w-4" />
          {t('contextMenu.redo')}
          <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onCut} disabled={!hasSelection}>
          <Scissors className="mr-2 h-4 w-4" />
          {t('contextMenu.cut')}
          <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopy} disabled={!hasSelection}>
          <Copy className="mr-2 h-4 w-4" />
          {t('contextMenu.copy')}
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste}>
          <Clipboard className="mr-2 h-4 w-4" />
          {t('contextMenu.paste')}
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onSelectAll}>
          <MousePointer className="mr-2 h-4 w-4" />
          {t('contextMenu.selectAll')}
          <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        {/* Format submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Bold className="mr-2 h-4 w-4" />
            {t('contextMenu.format')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onBold}>
              <Bold className="mr-2 h-4 w-4" />
              {t('contextMenu.bold')}
              <ContextMenuShortcut>Ctrl+B</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onItalic}>
              <Italic className="mr-2 h-4 w-4" />
              {t('contextMenu.italic')}
              <ContextMenuShortcut>Ctrl+I</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onUnderline}>
              <Underline className="mr-2 h-4 w-4" />
              {t('contextMenu.underline')}
              <ContextMenuShortcut>Ctrl+U</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onStrikethrough}>
              <Strikethrough className="mr-2 h-4 w-4" />
              {t('contextMenu.strikethrough')}
            </ContextMenuItem>
            <ContextMenuSeparator />
            {/* Alignment submenu */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AlignLeft className="mr-2 h-4 w-4" />
                {t('contextMenu.alignment')}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={onAlignLeft}>
                  <AlignLeft className="mr-2 h-4 w-4" />
                  {t('contextMenu.alignLeft')}
                </ContextMenuItem>
                <ContextMenuItem onClick={onAlignCenter}>
                  <AlignCenter className="mr-2 h-4 w-4" />
                  {t('contextMenu.alignCenter')}
                </ContextMenuItem>
                <ContextMenuItem onClick={onAlignRight}>
                  <AlignRight className="mr-2 h-4 w-4" />
                  {t('contextMenu.alignRight')}
                </ContextMenuItem>
                <ContextMenuItem onClick={onAlignJustify}>
                  <AlignJustify className="mr-2 h-4 w-4" />
                  {t('contextMenu.alignJustify')}
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onBulletList}>
              <List className="mr-2 h-4 w-4" />
              {t('contextMenu.bulletList')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onNumberedList}>
              <ListOrdered className="mr-2 h-4 w-4" />
              {t('contextMenu.numberedList')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onQuote}>
              <Quote className="mr-2 h-4 w-4" />
              {t('contextMenu.quote')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onCode}>
              <Code className="mr-2 h-4 w-4" />
              {t('contextMenu.code')}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        {/* Insert submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Link className="mr-2 h-4 w-4" />
            {t('contextMenu.insert')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onLink}>
              <Link className="mr-2 h-4 w-4" />
              {t('contextMenu.link')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onImage}>
              <ImageIcon className="mr-2 h-4 w-4" />
              {t('contextMenu.image')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onTable}>
              <Table className="mr-2 h-4 w-4" />
              {t('contextMenu.table')}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        {/* Search/Replace submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Search className="mr-2 h-4 w-4" />
            {t('contextMenu.search')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onFind}>
              <Search className="mr-2 h-4 w-4" />
              {t('contextMenu.find')}
              <ContextMenuShortcut>Ctrl+F</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onReplace}>
              <Replace className="mr-2 h-4 w-4" />
              {t('contextMenu.replace')}
              <ContextMenuShortcut>Ctrl+H</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        {/* Indent submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Indent className="mr-2 h-4 w-4" />
            {t('contextMenu.indent')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onIndent}>
              <Indent className="mr-2 h-4 w-4" />
              {t('contextMenu.indent')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onOutdent}>
              <Outdent className="mr-2 h-4 w-4" />
              {t('contextMenu.outdent')}
            </ContextMenuItem>
            <ContextMenuItem onClick={onRemoveFormatting}>
              <RemoveFormatting className="mr-2 h-4 w-4" />
              {t('contextMenu.removeFormatting')}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        {/* Zoom submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ZoomIn className="mr-2 h-4 w-4" />
            {t('contextMenu.zoom')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onZoomIn}>
              <ZoomIn className="mr-2 h-4 w-4" />
              {t('contextMenu.zoomIn')}
              <ContextMenuShortcut>Ctrl++</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onZoomOut}>
              <ZoomOut className="mr-2 h-4 w-4" />
              {t('contextMenu.zoomOut')}
              <ContextMenuShortcut>Ctrl+-</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onResetZoom}>
              <Type className="mr-2 h-4 w-4" />
              {t('contextMenu.resetZoom')}
              <ContextMenuShortcut>Ctrl+0</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
} 