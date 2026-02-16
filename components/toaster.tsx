'use client'

import { Toaster as SonnerToaster } from 'sonner'

export default function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--light-surface, #FFFFFF)',
          border: '1px solid var(--light-border, #E2E8F0)',
          color: 'var(--light-textPrimary, #0F172A)',
        },
      }}
    />
  )
}