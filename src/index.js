const AuthCore = require("./core/AuthCore")
const AuthMiddleware = require("./middleware/auth")
const AuthClient = require("./client/AuthClient")
const { EmailService } = require("./services/EmailService")
const { WebhookService } = require("./services/WebhookService")

module.exports = {
  AuthCore,
  AuthMiddleware,
  AuthClient,
  EmailService,
  WebhookService,
}
