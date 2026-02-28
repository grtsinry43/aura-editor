import './styles/index.css'

// --- Core Editor Components ---
export { default as DocumentEditor } from './components/editor/document-editor'
export { default as RichTextEditor } from './components/editor/rich-text-editor'
export { default as DocumentSidebar } from './components/editor/document-sidebar'
export { default as EditorContextMenu } from './components/editor/editor-context-menu'

// --- Providers ---
export { ThemeProvider, useTheme } from './components/providers/theme-provider'

// --- Controls ---
export { LanguageToggle } from './components/controls/language-toggle'
export { default as WelcomeDialog } from './components/controls/welcome-dialog'

// --- UI Primitives ---
export { Button, buttonVariants } from './components/ui/button'
export { Checkbox } from './components/ui/checkbox'
export {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub,
  ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger,
} from './components/ui/context-menu'
export {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
export { Input } from './components/ui/input'
export { Label } from './components/ui/label'
export { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover'
export { ScrollArea, ScrollBar } from './components/ui/scroll-area'
export {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './components/ui/select'
export { Separator } from './components/ui/separator'
export { Toaster } from './components/ui/sonner'
export { ThemeToggle } from './components/ui/theme-toggle'
export {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from './components/ui/tooltip'

// --- Hooks ---
export { useDebounce } from './hooks/use-debounce'

// --- Utilities ---
export { cn } from './lib/utils'

// --- i18n ---
export { initAuraI18n, auraI18nResources } from './i18n'
export type { AuraI18nOptions } from './i18n'

// --- Types ---
export type { EditorContextMenuProps } from './components/editor/editor-context-menu'
export type { RichTextEditorProps } from './components/editor/rich-text-editor'
