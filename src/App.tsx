import DocumentEditor from "@/components/document-editor"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const App = () => {
    return (
        <ThemeProvider>
            <div className="h-screen bg-background">
                <DocumentEditor />
                <Toaster />
            </div>
        </ThemeProvider>
    )
}

export default App