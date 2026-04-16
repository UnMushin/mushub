"use client"

import { AlertTriangle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DisconnectModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning"
}

export function DisconnectModal({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: DisconnectModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            variant === "danger" ? "bg-destructive/10" : "bg-amber-500/10"
          }`}>
            {variant === "danger"
              ? <AlertTriangle className="h-5 w-5 text-destructive" />
              : <LogOut className="h-5 w-5 text-amber-500" />
            }
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            variant={variant === "danger" ? "destructive" : "outline"}
            className={variant === "warning" ? "border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950" : ""}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
