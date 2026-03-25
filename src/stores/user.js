import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const role = ref(localStorage.getItem('role') || 'consumer')
  const username = ref(localStorage.getItem('username') || '')
  const avatar = ref(localStorage.getItem('avatar') || '')
  const id = ref(localStorage.getItem('id') || '')

  function login(newToken,newRole,newUsername,newAvatar,newId) {
    token.value = newToken
    role.value = newRole
    username.value = newUsername
    avatar.value = newAvatar
    id.value = newId
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', newRole)
    localStorage.setItem('username', newUsername)
    localStorage.setItem('avatar', newAvatar)
    localStorage.setItem('id', newId)
  }

  function logout() {
    token.value = ''
    role.value = 'consumer'
    username.value = ''
    avatar.value = ''
    id.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('avatar')
    localStorage.removeItem('id')
    localStorage.removeItem('username')
  }

  return { token,role,username,avatar,id, login, logout }
})