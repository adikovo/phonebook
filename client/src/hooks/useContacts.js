import { useCallback, useEffect, useState } from 'react'
import { listContacts } from '@/api/contacts'

export function useContacts(params = {}) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    let cancelled = false

    listContacts(JSON.parse(paramsKey))
      .then((data) => {
        if (cancelled) return
        setContacts(data)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.response?.data?.error || err.message || 'Failed to load contacts')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [paramsKey, refreshKey])

  const reload = useCallback(() => {
    setLoading(true)
    setRefreshKey((k) => k + 1)
  }, [])

  return { contacts, loading, error, reload }
}
