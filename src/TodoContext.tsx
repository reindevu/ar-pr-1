import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

export type Todo = {
  id: string
  title: string
  completed: boolean
}

export type TodoFilter = 'all' | 'active' | 'completed'


const STORAGE_KEY = 'todo-context-app:todos'

type TodoAction =
  | { type: 'add'; title: string }
  | { type: 'toggle'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'clearCompleted' }

type TodoContextValue = {
  todos: Todo[]
  activeCount: number
  completedCount: number
  storageError: string | null
  addTodo: (title: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearCompleted: () => void
}

const TodoContext = createContext<TodoContextValue | null>(null)

const isTodo = (value: unknown): value is Todo => {
  if (typeof value !== 'object' || value === null) return false

  const todo = value as Record<string, unknown>
  return (
    typeof todo.id === 'string' &&
    typeof todo.title === 'string' &&
    typeof todo.completed === 'boolean'
  )
}

const loadTodos = (): Todo[] => {
  try {
    const savedTodos: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')

    if (Array.isArray(savedTodos) && savedTodos.every(isTodo)) return savedTodos

    console.warn('Сохранённый список задач имеет неверный формат и был сброшен.')
  } catch (error) {
    console.warn('Не удалось прочитать сохранённый список задач.', error)
  }

  return []
}

const todoReducer = (todos: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case 'add': {
      const title = action.title.trim()
      if (!title) return todos

      return [...todos, { id: crypto.randomUUID(), title, completed: false }]
    }
    case 'toggle':
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
      )
    case 'delete':
      return todos.filter((todo) => todo.id !== action.id)
    case 'clearCompleted':
      return todos.filter((todo) => !todo.completed)
  }
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, undefined, loadTodos)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      setStorageError(null)
    } catch (error) {
      console.error('Не удалось сохранить список задач.', error)
      setStorageError('Не удалось сохранить изменения в браузере.')
    }
  }, [todos])

  const value = useMemo<TodoContextValue>(() => {
    const completedCount = todos.filter((todo) => todo.completed).length

    return {
      todos,
      activeCount: todos.length - completedCount,
      completedCount,
      storageError,
      addTodo: (title) => dispatch({ type: 'add', title }),
      toggleTodo: (id) => dispatch({ type: 'toggle', id }),
      deleteTodo: (id) => dispatch({ type: 'delete', id }),
      clearCompleted: () => dispatch({ type: 'clearCompleted' }),
    }
  }, [storageError, todos])

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodos() {
  const context = useContext(TodoContext)

  if (!context) throw new Error('useTodos должен использоваться внутри TodoProvider')

  return context
}
