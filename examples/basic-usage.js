require("dotenv").config()
const express = require("express")
const { AuthCore } = require("../src")

const app = express()

// Initialize AuthCore with configuration
const authCore = new AuthCore({
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/auth-nexus",
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  baseUrl: process.env.BASE_URL || "http://localhost:3000",

  // Email configuration (optional)
  emailConfig: {
    enabled: true,
    service: "gmail",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },

  // Webhook configuration (optional)
  webhookConfig: {
    enabled: true,
    webhooks: [
      {
        url: "https://your-webhook-endpoint.com/auth-events",
        events: ["user.registered", "user.login", "user.verified"],
        headers: {
          "X-Webhook-Secret": "your-webhook-secret",
        },
      },
    ],
  },
})

async function startServer() {
  try {
    // Initialize the auth core
    await authCore.initialize()

    // Use express middleware
    app.use(express.json())

    // Mount auth routes
    app.use("/auth", authCore.getRouter())

    // Example protected route
    const { AuthMiddleware } = require("../src")
    app.get("/protected", AuthMiddleware(authCore.config), (req, res) => {
      res.json({
        message: "This is a protected route",
        user: req.user,
      })
    })

    // Basic route
    app.get("/", (req, res) => {
      res.json({
        message: "Auth Nexus API is running!",
        endpoints: {
          register: "POST /auth/register",
          login: "POST /auth/login",
          profile: "GET /auth/me",
          verifyEmail: "POST /auth/verify-email",
          forgotPassword: "POST /auth/forgot-password",
          resetPassword: "POST /auth/reset-password",
        },
      })
    })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📚 Auth endpoints available at http://localhost:${PORT}/auth`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
