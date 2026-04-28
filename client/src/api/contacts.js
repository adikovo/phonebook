import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export async function listContacts(params = {}) {
  const query = {}
  if (params.search) query.search = params.search
  if (params.tags && params.tags.length) query.tags = params.tags.join(',')
  if (params.favoritesOnly) query.favoritesOnly = 'true'
  const { data } = await api.get('/contacts', { params: query })
  return data
}

export async function getContact(id) {
  const { data } = await api.get(`/contacts/${id}`)
  return data
}

export async function createContact(body) {
  const { data } = await api.post('/contacts', body)
  return data
}

export async function updateContact(id, body) {
  const { data } = await api.put(`/contacts/${id}`, body)
  return data
}

export async function deleteContact(id) {
  await api.delete(`/contacts/${id}`)
}

// Stubs — replaced in later phases.

export async function toggleFavorite(id, isFavorite) {
  const { data } = await api.patch(`/contacts/${id}/favorite`, { isFavorite })
  return data
}

export async function uploadPhoto(_id, _file) {
  throw new Error('uploadPhoto not implemented yet (T052)')
}

export async function deletePhoto(_id) {
  throw new Error('deletePhoto not implemented yet (T052)')
}

export async function listTags() {
  const { data } = await api.get('/tags')
  return data
}

export { api }
