import { useCallback, useEffect, useState } from 'react'
import { listContacts } from '@/api/contacts'

export function useContacts(params = {}) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramsKey = JSON.stringify(params)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listContacts(JSON.parse(paramsKey))
      setContacts(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [paramsKey])

  useEffect(() => {
    reload()
  }, [reload])

  return { contacts, loading, error, reload }
}
