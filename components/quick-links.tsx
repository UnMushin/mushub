"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Plus, FileText, Youtube, Globe, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface QuickLink {
  id: string
  name: string
  url: string
  icon: "docs" | "youtube" | "globe"
}

const defaultLinks: QuickLink[] = [
  {
    id: "1",
    name: "Google Docs",
    url: "https://docs.google.com",
    icon: "docs",
  },
  {
    id: "2",
    name: "YouTube Studio",
    url: "https://studio.youtube.com",
    icon: "youtube",
  },
  {
    id: "3",
    name: "Squiduuverse",
    url: "https://app.squiduuverse.com",
    icon: "globe",
  },
]

const iconMap = {
  docs: FileText,
  youtube: Youtube,
  globe: Globe,
}

const STORAGE_KEY = "mushub_quick_links"

interface QuickLinksProps {
  apiKey?: string
}

export function QuickLinks(_props: QuickLinksProps) {
  const t = useTranslations()
  const [links, setLinks] = useState<QuickLink[]>(defaultLinks)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load links from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setLinks(parsed)
      } catch (e) {
        // Use default links if parsing fails
      }
    }
    setIsLoaded(true)
  }, [])

  // Save links to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
    }
  }, [links, isLoaded])
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [open, setOpen] = useState(false)

  const addLink = () => {
    if (newName.trim() && newUrl.trim()) {
      setLinks([
        ...links,
        {
          id: Date.now().toString(),
          name: newName.trim(),
          url: newUrl.startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`,
          icon: "globe",
        },
      ])
      setNewName("")
      setNewUrl("")
      setOpen(false)
    }
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">{t("links.title")}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add link</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add new link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="bg-secondary border-border"
              />
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL (e.g. google.com)"
                className="bg-secondary border-border"
              />
              <Button
                onClick={addLink}
                className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                Add Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = iconMap[link.icon] || Globe
          return (
            <div key={link.id} className="group relative">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <span className="text-xs text-center text-foreground group-hover:text-accent transition-colors line-clamp-1 w-full">
                  {link.name}
                </span>
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  deleteLink(link.id)
                }}
                className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-card rounded-full p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove link</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
