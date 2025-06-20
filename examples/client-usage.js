const { AuthClient } = require("../src")

// Initialize the client
const authClient = new AuthClient("http://localhost:3000/auth")

async function demonstrateClient() {
  try {
    // Register a new user
    console.log("Registering user...")
    const registerResult = await authClient.register({
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    })
    console.log("Registration result:", registerResult)

    // Login
    console.log("\nLogging in...")
    const loginResult = await authClient.login("test@example.com", "password123")
    console.log("Login result:", loginResult)

    // Get profile
    console.log("\nGetting profile...")
    const profile = await authClient.getProfile()
    console.log("Profile:", profile)
  } catch (error) {
    console.error("Error:", error.message)
  }
}

// Run the demonstration
demonstrateClient()
