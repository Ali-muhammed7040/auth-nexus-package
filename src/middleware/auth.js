const jwt = require("jsonwebtoken")

module.exports = (config) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "")

      if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." })
      }

      const decoded = jwt.verify(token, config.jwtSecret)
      const User = require("../models/User")
      const user = await User.findById(decoded._id)

      if (!user) {
        return res.status(401).json({ error: "Invalid token. User not found." })
      }

      req.user = user
      req.token = token
      next()
    } catch (error) {
      res.status(401).json({ error: "Invalid token." })
    }
  }
}
