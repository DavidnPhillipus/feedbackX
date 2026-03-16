import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { SidebarProvider } from './components/SidebarContext'
import './css/index.css'
import './css/clean-base.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  </StrictMode>,
)
