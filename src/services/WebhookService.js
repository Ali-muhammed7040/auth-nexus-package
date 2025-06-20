const axios = require("axios")

class WebhookService {
  constructor(config) {
    this.config = config
    this.webhooks = config.webhooks || []
  }

  async trigger(event, data) {
    const promises = this.webhooks
      .filter((webhook) => webhook.events.includes(event))
      .map((webhook) => this.sendWebhook(webhook, event, data))

    await Promise.allSettled(promises)
  }

  async sendWebhook(webhook, event, data) {
    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id || webhook.url,
      }

      const headers = {
        "Content-Type": "application/json",
        "User-Agent": "AuthNexus-Webhook/1.0",
        ...webhook.headers,
      }

      await axios.post(webhook.url, payload, {
        headers,
        timeout: webhook.timeout || 5000,
      })

      console.log(`✅ Webhook sent successfully to ${webhook.url} for event: ${event}`)
    } catch (error) {
      console.error(`❌ Webhook failed for ${webhook.url}:`, error.message)

      // Optionally implement retry logic here
      if (webhook.retries && webhook.retries > 0) {
        // Implement retry logic
      }
    }
  }
}

module.exports = { WebhookService }
