import { useCallback, useEffect, useState } from 'react'
import { listTags } from '@/api/contacts'

export function useTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    listTags()
      .then((data) => {
        if (cancelled) return
        setTags(data)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.response?.data?.error || err.message || 'Failed to load tags')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const reload = useCallback(() => {
    setLoading(true)
    setRefreshKey((k) => k + 1)
  }, [])

  return { tags, loading, error, reload }
}
