import DocumentEditor from "@/components/document-editor"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const App = () => {
    return (
        <ThemeProvider>
            <TooltipProvider 
                delayDuration={300}
                skipDelayDuration={100}
                disableHoverableContent={false}
            >
                <div className="h-screen bg-background">
                    <DocumentEditor />
                    <Toaster />
                </div>
            </TooltipProvider>
        </ThemeProvider>
    )
}

export default App