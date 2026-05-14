'use client'
import { useEffect } from 'react'

export function Modal({ onClose, children, maxWidth = 660 }: {
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/72 z-[500] flex items-center justify-center p-5 backdrop-blur-[4px]"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-card2 border border-bdr2 rounded-[14px] w-full max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,.8)]"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <h2 className="font-serif text-[20px] text-ink font-normal">{title}</h2>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-[8px] border border-bdr flex items-center justify-center text-ink3 hover:border-red-400 hover:text-red-400 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-4">{children}</div>
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-t border-bdr flex justify-end gap-2">
      {children}
    </div>
  )
}
