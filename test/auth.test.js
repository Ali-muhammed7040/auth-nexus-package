const request = require("supertest")
const express = require("express")
const { AuthCore } = require("../src")

describe("Auth Nexus", () => {
  let app
  let authCore

  beforeAll(async () => {
    app = express()
    authCore = new AuthCore({
      mongoURI: "mongodb://localhost:27017/auth-nexus-test",
      jwtSecret: "test-secret",
    })

    await authCore.initialize()
    app.use(express.json())
    app.use("/auth", authCore.getRouter())
  })

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      }

      const response = await request(app).post("/auth/register").send(userData).expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.token).toBeDefined()
    })

    it("should not register user with existing email", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      }

      await request(app).post("/auth/register").send(userData).expect(400)
    })
  })

  describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/auth/login").send(loginData).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
    })

    it("should not login with invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      }

      await request(app).post("/auth/login").send(loginData).expect(401)
    })
  })
})
