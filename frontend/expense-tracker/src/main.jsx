import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      toastOptions={{
        className: "text-xs font-medium",
        style: {
          borderRadius: "5px",
          padding: "4px",
        },
        success: {
          iconTheme: {
            primary: "#CC5500",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  </StrictMode>,
)
