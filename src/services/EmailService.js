const nodemailer = require("nodemailer")

class EmailService {
  constructor(config) {
    this.config = config
    this.transporter = this.createTransporter()
  }

  createTransporter() {
    return nodemailer.createTransporter({
      service: this.config.service || "gmail",
      auth: {
        user: this.config.user,
        pass: this.config.password,
      },
    })
  }

  async sendVerificationEmail(user, token, baseUrl) {
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`

    const mailOptions = {
      from: this.config.from || this.config.user,
      to: user.email,
      subject: "Verify Your Email Address",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2>Welcome ${user.firstName || "User"}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }

  async sendPasswordResetEmail(user, token, baseUrl) {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    const mailOptions = {
      from: this.config.from || this.config.user,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.firstName || "User"},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }
}

module.exports = { EmailService }
