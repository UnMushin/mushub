"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface DisconnectModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DisconnectModal({ open, onConfirm, onCancel }: DisconnectModalProps) {
  const t = useTranslations("disconnect")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground mb-2">{t("title")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("warning")}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm}>{t("confirm")}</Button>
        </div>
      </div>
    </div>
  )
}
