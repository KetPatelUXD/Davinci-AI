import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@davinci-ai/react';
import '@davinci-ai/react/base.css';
import '@fontsource-variable/inter/index.css';
import { MarketsDashboard } from '@davinci-ai/examples';

const params = new URLSearchParams(location.search);
const theme = params.get('theme') === 'light' ? 'light' : 'dark';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme={theme} canvas attachToRoot>
      <MarketsDashboard />
    </ThemeProvider>
  </StrictMode>,
);
