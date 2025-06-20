const mongoose = require("mongoose")
const express = require("express")
const User = require("../models/User")
const authRoutes = require("../routes/auth")
const { EmailService } = require("../services/EmailService")
const { WebhookService } = require("../services/WebhookService")

class AuthCore {
  constructor(config = {}) {
    this.config = {
      mongoURI: config.mongoURI || process.env.MONGO_URI,
      jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
      baseUrl: config.baseUrl || process.env.BASE_URL || "http://localhost:3000",
      emailConfig: config.emailConfig || {},
      webhookConfig: config.webhookConfig || {},
      ...config,
    }

    this.app = null
    this.models = {}
    this.services = {}
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) {
      return this
    }

    try {
      await this.connectDB()
      this.setupModels()
      this.setupServices()
      this.isInitialized = true

      console.log("🚀 AuthCore initialized successfully")
      return this
    } catch (error) {
      console.error("❌ AuthCore initialization failed:", error)
      throw error
    }
  }

  async connectDB() {
    try {
      await mongoose.connect(this.config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log("🔌 Connected to MongoDB")
    } catch (err) {
      console.error("❌ MongoDB connection error:", err)
      throw err
    }
  }

  setupModels() {
    this.models = {
      User: User,
    }
  }

  setupServices() {
    // Initialize Email Service
    if (this.config.emailConfig && this.config.emailConfig.enabled) {
      this.services.email = new EmailService(this.config.emailConfig)
    }

    // Initialize Webhook Service
    if (this.config.webhookConfig && this.config.webhookConfig.enabled) {
      this.services.webhook = new WebhookService(this.config.webhookConfig)
    }
  }

  getRouter() {
    return authRoutes({
      models: this.models,
      services: this.services,
      config: this.config,
    })
  }

  async createUser(userData) {
    const user = new this.models.User(userData)
    await user.save()

    // Send verification email if email service is enabled
    if (this.services.email) {
      await this.services.email.sendVerificationEmail(user, this.config.baseUrl)
    }

    // Trigger webhook if webhook service is enabled
    if (this.services.webhook) {
      await this.services.webhook.trigger("user.created", { user: user.toObject() })
    }

    return user
  }

  async authenticateUser(email, password) {
    const user = await this.models.User.findOne({ email })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error("Invalid credentials")
    }

    const token = user.generateAuthToken(this.config.jwtSecret)

    // Trigger webhook if webhook service is enabled
    if (this.services.webhook) {
      await this.services.webhook.trigger("user.login", { user: user.toObject() })
    }

    return { user, token }
  }

  async verifyEmail(token) {
    const jwt = require("jsonwebtoken")
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret)
      const user = await this.models.User.findById(decoded._id)

      if (!user) {
        throw new Error("Invalid verification token")
      }

      user.isVerified = true
      await user.save()

      // Trigger webhook if webhook service is enabled
      if (this.services.webhook) {
        await this.services.webhook.trigger("user.verified", { user: user.toObject() })
      }

      return user
    } catch (error) {
      throw new Error("Invalid or expired verification token")
    }
  }
}

module.exports = AuthCore
