import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { SidebarProvider } from './components/SidebarContext'
import { ChatProvider } from './context/ChatContext'
import { AuthProvider } from './context/AuthContext'
import './css/app.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

function AppTree() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </SidebarProvider>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppTree />
      </GoogleOAuthProvider>
    ) : (
      <AppTree />
    )}
  </StrictMode>,
)
