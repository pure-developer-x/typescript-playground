import { ThemeProvider } from "./providers/theme-provider";
import { PureEditor } from "./components/pure-editor";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="h-screen">
          <PureEditor />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
