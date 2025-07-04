import React from "react"

interface DialogProps extends React.PropsWithChildren {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {children}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function DialogContent({ children }: React.PropsWithChildren) {
  return <div>{children}</div>
}

export function DialogHeader({ children }: React.PropsWithChildren) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: React.PropsWithChildren) {
  return <h2 className="text-xl font-bold mb-2">{children}</h2>
}

export function DialogFooter({ children }: React.PropsWithChildren) {
  return <div className="flex justify-end gap-2 mt-6">{children}</div>
}
