# Auth Nexus

A comprehensive, production-ready authentication package for Node.js applications with MongoDB, JWT tokens, email verification, and webhook support.

## Features

- 🔐 **Complete Authentication System** - Registration, login, logout
- 📧 **Email Verification** - Automated email verification with customizable templates
- 🔑 **Password Reset** - Secure password reset functionality
- 🎣 **Webhook Support** - Real-time event notifications
- 🛡️ **JWT Authentication** - Secure token-based authentication
- 📱 **Client SDK** - Easy-to-use client library
- 🔒 **Security Best Practices** - Bcrypt hashing, input validation
- 🚀 **Easy Integration** - Simple setup and configuration

## Installation

\`\`\`bash
npm install auth-nexus
\`\`\`

## Quick Start

\`\`\`javascript
const express = require('express');
const { AuthCore } = require('auth-nexus');

const app = express();
const authCore = new AuthCore({
  mongoURI: 'mongodb://localhost:27017/myapp',
  jwtSecret: 'your-secret-key'
});

(async () => {
  await authCore.initialize();
  app.use('/auth', authCore.getRouter());
  app.listen(3000);
})();
\`\`\`

## Configuration

### Basic Configuration

\`\`\`javascript
const authCore = new AuthCore({
  mongoURI: 'mongodb://localhost:27017/myapp',
  jwtSecret: 'your-secret-key',
  baseUrl: 'http://localhost:3000'
});
\`\`\`

### Email Configuration

\`\`\`javascript
const authCore = new AuthCore({
  // ... basic config
  emailConfig: {
    enabled: true,
    service: 'gmail',
    user: 'your-email@gmail.com',
    password: 'your-app-password',
    from: 'noreply@yourapp.com'
  }
});
\`\`\`

### Webhook Configuration

\`\`\`javascript
const authCore = new AuthCore({
  // ... basic config
  webhookConfig: {
    enabled: true,
    webhooks: [
      {
        url: 'https://your-app.com/webhooks/auth',
        events: ['user.registered', 'user.login', 'user.verified']
      }
    ]
  }
});
\`\`\`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/verify-email` | Verify email address |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

## Client SDK Usage

\`\`\`javascript
const { AuthClient } = require('auth-nexus');

const client = new AuthClient('http://localhost:3000/auth');

// Register
const result = await client.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Login
await client.login('user@example.com', 'password123');

// Get profile
const profile = await client.getProfile();
\`\`\`

## Middleware Usage

\`\`\`javascript
const { AuthMiddleware } = require('auth-nexus');

app.get('/protected', AuthMiddleware(authCore.config), (req, res) => {
  res.json({ user: req.user });
});
\`\`\`

## Webhook Events

The following events are triggered:

- `user.registered` - When a new user registers
- `user.login` - When a user logs in
- `user.verified` - When a user verifies their email
- `password.reset` - When a user resets their password

## Environment Variables

\`\`\`env
MONGO_URI=mongodb://localhost:27017/auth-nexus
JWT_SECRET=your-super-secret-jwt-key
BASE_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
\`\`\`

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first.
