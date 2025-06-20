class AuthClient {
  constructor(baseUrl = "http://localhost:3000/auth") {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  async register(userData) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (data.token) {
      this.setToken(data.token)
    }

    return data
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.token) {
      this.setToken(data.token)
    }

    return data
  }

  async getProfile() {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: this.getAuthHeaders(),
    })

    return response.json()
  }

  async verifyEmail(token) {
    const response = await fetch(`${this.baseUrl}/verify-email`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token }),
    })

    return response.json()
  }

  async forgotPassword(email) {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email }),
    })

    return response.json()
  }

  async resetPassword(token, newPassword) {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ token, newPassword }),
    })

    return response.json()
  }

  logout() {
    this.token = null
  }
}

module.exports = AuthClient
