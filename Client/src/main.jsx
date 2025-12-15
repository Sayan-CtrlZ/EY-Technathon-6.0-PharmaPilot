import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter } from 'react-router-dom'
import {AppContextProvider} from './context/AppContext.jsx'
import { initializeFetchInterceptor } from './utils/fetchInterceptor.js'

// Initialize fetch interceptor for automatic token refresh
initializeFetchInterceptor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
