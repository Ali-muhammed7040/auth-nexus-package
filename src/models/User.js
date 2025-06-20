const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        delete ret.resetPasswordToken
        delete ret.resetPasswordExpires
        delete ret.verificationToken
        delete ret.verificationTokenExpires
        return ret
      },
    },
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Generate auth token
userSchema.methods.generateAuthToken = function (jwtSecret) {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      isVerified: this.isVerified,
    },
    jwtSecret,
    { expiresIn: "7d" },
  )
}

// Generate verification token
userSchema.methods.generateVerificationToken = function (jwtSecret) {
  return jwt.sign({ _id: this._id, purpose: "email_verification" }, jwtSecret, { expiresIn: "24h" })
}

// Generate password reset token
userSchema.methods.generateResetToken = function (jwtSecret) {
  return jwt.sign({ _id: this._id, purpose: "password_reset" }, jwtSecret, { expiresIn: "1h" })
}

module.exports = mongoose.model("User", userSchema)
