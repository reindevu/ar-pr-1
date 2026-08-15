import { useMemo, useState, type FormEvent } from 'react';
import { useTodos, type TodoFilter } from './TodoContext';

const filters: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Готово' },
]

export default function App() {
  const {
    todos,
    activeCount,
    completedCount,
    storageError,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  } = useTodos()
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<TodoFilter>('all')

  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === 'active') return !todo.completed
        if (filter === 'completed') return todo.completed
        return true
      }),
    [filter, todos],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) return

    addTodo(title)
    setTitle('')
  }

  const emptyMessage = todos.length
    ? 'В этой категории пока ничего нет.'
    : 'Список пуст. Добавьте первую задачу.'

  return (
    <main className="grid min-h-screen min-w-80 place-items-center bg-[#f6f4ef] px-5 py-12 font-sans text-[#27251f]">
      <section
        className="w-full max-w-[680px] overflow-hidden rounded-[28px] border border-[#27251f]/8 bg-white/88 backdrop-blur-2xl"
        aria-labelledby="page-title"
      >
        <header className="bg-[#415f4f] px-[42px] pt-[42px] pb-[30px] text-[#f8f5ed]">
          <p className="m-0 text-[0.72rem] font-bold text-[#e7c98e] uppercase">
            План на сегодня
          </p>
          <h1
            className="mt-1 mb-2 text-[clamp(2rem,8vw,3.2rem)] leading-[1.05] font-bold"
            id="page-title"
          >
            Мои задачи
          </h1>
          <p className="m-0 text-[#f8f5ed]/75">
            {activeCount ? `Осталось выполнить: ${activeCount}` : 'Всё выполнено — отличный день!'}
          </p>
        </header>

        <form
          className="flex gap-2.5 px-[42px] pt-7 pb-5"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="new-todo">
            Новая задача
          </label>

          <input
            id="new-todo"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Что нужно сделать?"
            maxLength={120}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-[13px] border border-[#dedbd2] bg-[#fbfaf7] px-4 py-[13px] text-[#27251f] placeholder:text-[#9a968c]"
          />
          <button
            className="cursor-pointer rounded-[13px] bg-[#c16f49] px-5 font-bold text-white transition enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
            type="submit"
            disabled={!title.trim()}
          >
            Добавить
          </button>
        </form>

        {storageError && (
          <p
            className="mx-[42px] mt-0 mb-3 rounded-[10px] bg-[#fce9e5] px-3 py-2.5 text-[0.85rem] text-[#8a2f26]"
            role="alert"
          >
            {storageError}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 border-b border-[#ece9e1] px-[42px] pt-2 pb-[18px]">
          <div className="flex gap-1 rounded-[11px] bg-[#f1efe9] p-1" aria-label="Фильтр задач">
            {filters.map(({ value, label }) => (
              <button
                className="cursor-pointer rounded-lg px-[11px] py-[7px] text-[0.78rem] font-semibold text-[#77736a] aria-pressed:bg-white aria-pressed:text-[#334b3e]"
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-[0.78rem] text-[#8b877e]">
            Всего: {todos.length}
          </span>
        </div>

        {visibleTodos.length ? (
          <ul className="m-0 grid list-none gap-px p-0">
            {visibleTodos.map((todo) => (
              <li
                className="flex min-h-16 items-center gap-3 border-b border-[#f0ede6] px-[42px] py-2.5"
                key={todo.id}
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-[13px]">
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span
                    className="grid size-[23px] shrink-0 place-items-center rounded-full border-2 border-[#c9c5bb] text-xs font-bold text-transparent transition-colors peer-checked:border-[#547563] peer-checked:bg-[#547563] peer-checked:text-white"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <span
                    className={`wrap-anywhere ${todo.completed ? 'text-[#a09c93] line-through' : ''}`}
                  >
                    {todo.title}
                  </span>
                </label>

                <button
                  className="size-[34px] shrink-0 cursor-pointer rounded-[10px] bg-transparent text-[1.45rem] leading-none text-[#a09c93]"
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Удалить задачу «${todo.title}»`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 px-[42px] py-[58px] text-center text-[#918d84]">
            {emptyMessage}
          </p>
        )}

        <footer className="flex min-h-[66px] items-center justify-between gap-5 px-[42px] py-4 text-[0.8rem] text-[#8b877e]">
          <span>Выполнено: {completedCount}</span>
          {completedCount > 0 && (
            <button
              className="cursor-pointer bg-transparent py-1.25 font-semibold text-[#a4553e]"
              type="button"
              onClick={clearCompleted}
            >
              Очистить выполненные
            </button>
          )}
        </footer>
      </section>
    </main>
  )
}
