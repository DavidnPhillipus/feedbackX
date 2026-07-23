import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { SidebarProvider } from './components/SidebarContext'
import { ChatProvider } from './context/ChatContext'
import { AuthProvider } from './context/AuthContext'
import './css/app.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </SidebarProvider>
    </AuthProvider>
  </StrictMode>,
)
