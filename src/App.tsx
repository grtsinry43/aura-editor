import DocumentEditor from "@/components/document-editor"
import { ThemeProvider } from "@/components/theme-provider"

const App = () => {
    return (
        <ThemeProvider>
            <div className="h-screen bg-background">
                <DocumentEditor />
            </div>
        </ThemeProvider>
    )
}

export default App