import { useState, useEffect, useRef } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // 如果是第一次渲染，立即设置值
    if (isFirstRender.current) {
      setDebouncedValue(value)
      isFirstRender.current = false
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
