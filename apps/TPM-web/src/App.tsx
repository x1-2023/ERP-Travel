import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { KeyboardShortcutsProvider } from '@/components/shortcuts/KeyboardShortcutsProvider';
import AppRouter from './router';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <KeyboardShortcutsProvider>
          <AppRouter />
          <Toaster />
        </KeyboardShortcutsProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
