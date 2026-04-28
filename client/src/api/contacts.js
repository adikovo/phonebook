import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Stubs — replaced with real implementations across T023, T033, T042, T052.
// They throw so any premature caller fails loudly instead of silently no-oping.

export async function listContacts(_params) {
  throw new Error('listContacts not implemented yet (T023)')
}

export async function getContact(_id) {
  throw new Error('getContact not implemented yet (T023)')
}

export async function createContact(_body) {
  throw new Error('createContact not implemented yet (T023)')
}

export async function updateContact(_id, _body) {
  throw new Error('updateContact not implemented yet (T023)')
}

export async function deleteContact(_id) {
  throw new Error('deleteContact not implemented yet (T023)')
}

export async function toggleFavorite(_id, _isFavorite) {
  throw new Error('toggleFavorite not implemented yet (T042)')
}

export async function uploadPhoto(_id, _file) {
  throw new Error('uploadPhoto not implemented yet (T052)')
}

export async function deletePhoto(_id) {
  throw new Error('deletePhoto not implemented yet (T052)')
}

export async function listTags() {
  throw new Error('listTags not implemented yet (T033)')
}

export { api }
