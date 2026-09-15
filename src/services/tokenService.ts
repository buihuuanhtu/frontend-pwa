const TOKEN_KEY = 'authToken'

export const tokenService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  hasToken() {
    return Boolean(localStorage.getItem(TOKEN_KEY))
  },
}