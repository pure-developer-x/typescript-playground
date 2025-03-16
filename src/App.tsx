import { ThemeProvider } from "./providers/theme-provider";
import { PureEditor } from "./components/pure-editor";

function App() {
  return (
    <ThemeProvider>
      <div className="h-screen">
        <PureEditor />
      </div>
    </ThemeProvider>
  );
}

export default App;
