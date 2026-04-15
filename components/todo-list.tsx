"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Todo {
  id: string
  text: string
  completed: boolean
}

const STORAGE_KEY = "mushub_todos"

const defaultTodos: Todo[] = [
  { id: "1", text: "Check YouTube Studio analytics", completed: false },
  { id: "2", text: "Update project documentation", completed: true },
  { id: "3", text: "Review Squiduuverse app", completed: false },
]

interface TodoListProps {
  apiKey?: string
}

export function TodoList(_props: TodoListProps) {
  const t = useTranslations()
  const [todos, setTodos] = useState<Todo[]>(defaultTodos)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTodos(parsed)
      } catch (e) {
        // Use default todos if parsing fails
      }
    }
    setIsLoaded(true)
  }, [])

  // Save todos to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }
  }, [todos, isLoaded])
  const [newTodo, setNewTodo] = useState("")

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        { id: Date.now().toString(), text: newTodo.trim(), completed: false },
      ])
      setNewTodo("")
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-foreground">{t("todo.title")}</h2>
      
      <div className="flex gap-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("todo.addItem")}
          className="bg-secondary border-border placeholder:text-muted-foreground"
        />
        <Button
          onClick={addTodo}
          size="icon"
          className="shrink-0 bg-accent hover:bg-accent/80 text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add item</span>
        </Button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="group flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                todo.completed
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-muted-foreground hover:border-accent"
              )}
            >
              {todo.completed && <Check className="h-3 w-3" />}
            </button>
            <span
              className={cn(
                "flex-1 text-sm transition-colors",
                todo.completed && "text-muted-foreground line-through"
              )}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Delete item</span>
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          No items yet. Add one above!
        </p>
      )}
    </div>
  )
}
