const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")

module.exports = ({ models, services, config }) => {
  const { User } = models

  // Register endpoint
  router.post("/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" })
      }

      // Create new user
      const user = new User({ email, password, firstName, lastName })
      await user.save()

      // Send verification email if email service is enabled
      if (services.email) {
        const verificationToken = user.generateVerificationToken(config.jwtSecret)
        await services.email.sendVerificationEmail(user, verificationToken, config.baseUrl)
      }

      // Trigger webhook if webhook service is enabled
      if (services.webhook) {
        await services.webhook.trigger("user.registered", { user: user.toObject() })
      }

      const token = user.generateAuthToken(config.jwtSecret)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: user.toObject(),
        token,
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // Login endpoint
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Trigger webhook if webhook service is enabled
      if (services.webhook) {
        await services.webhook.trigger("user.login", { user: user.toObject() })
      }

      const token = user.generateAuthToken(config.jwtSecret)

      res.json({
        success: true,
        message: "Login successful",
        user: user.toObject(),
        token,
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // Get current user profile
  router.get("/me", authMiddleware(config), async (req, res) => {
    res.json({
      success: true,
      user: req.user.toObject(),
    })
  })

  // Verify email endpoint
  router.post("/verify-email", async (req, res) => {
    try {
      const { token } = req.body
      const jwt = require("jsonwebtoken")

      const decoded = jwt.verify(token, config.jwtSecret)
      if (decoded.purpose !== "email_verification") {
        return res.status(400).json({ error: "Invalid verification token" })
      }

      const user = await User.findById(decoded._id)
      if (!user) {
        return res.status(400).json({ error: "User not found" })
      }

      if (user.isVerified) {
        return res.status(400).json({ error: "Email already verified" })
      }

      user.isVerified = true
      await user.save()

      // Trigger webhook if webhook service is enabled
      if (services.webhook) {
        await services.webhook.trigger("user.verified", { user: user.toObject() })
      }

      res.json({
        success: true,
        message: "Email verified successfully",
      })
    } catch (error) {
      res.status(400).json({ error: "Invalid or expired verification token" })
    }
  })

  // Request password reset
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const resetToken = user.generateResetToken(config.jwtSecret)

      if (services.email) {
        await services.email.sendPasswordResetEmail(user, resetToken, config.baseUrl)
      }

      res.json({
        success: true,
        message: "Password reset email sent",
      })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // Reset password
  router.post("/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body
      const jwt = require("jsonwebtoken")

      const decoded = jwt.verify(token, config.jwtSecret)
      if (decoded.purpose !== "password_reset") {
        return res.status(400).json({ error: "Invalid reset token" })
      }

      const user = await User.findById(decoded._id)
      if (!user) {
        return res.status(400).json({ error: "User not found" })
      }

      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: "Password reset successfully",
      })
    } catch (error) {
      res.status(400).json({ error: "Invalid or expired reset token" })
    }
  })

  return router
}
