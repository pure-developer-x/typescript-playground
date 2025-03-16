import { ThemeProvider } from "./providers/theme-provider";
import { PureEditor } from "./components/pure-editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <div className="h-screen">
          <PureEditor />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
