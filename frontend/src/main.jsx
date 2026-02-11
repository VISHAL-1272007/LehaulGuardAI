import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Add error handling
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    rootElement.innerHTML = `
      <div style="padding: 40px; color: white; background: #1a1a2e; min-height: 100vh;">
        <h1 style="color: #ef4444;">Failed to load app</h1>
        <pre style="color: #fca5a5; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px;">
          ${error.message}
        </pre>
      </div>
    `
  }
}


