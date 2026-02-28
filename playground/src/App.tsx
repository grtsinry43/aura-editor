import {
  DocumentEditor,
  ThemeProvider,
  Toaster,
  TooltipProvider,
} from 'aura-editor'

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <div className="h-screen bg-background">
          <DocumentEditor />
          <Toaster />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}
