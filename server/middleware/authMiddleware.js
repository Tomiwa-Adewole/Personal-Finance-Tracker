const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Step A: Get the token from the request headers
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Step B: Extract the token (Expected format: "Bearer <token>")
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. Invalid token format." });
    }

    // Step C: Verify the token using our secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Debug log to see what the token payload looks like
    console.log("DECODED JWT PAYLOAD:", verified);

    // Safely assign user ID regardless of key name (.id, .userId, or ._id)
    req.userId = verified.id || verified.userId || verified._id;

    // Proceed to the actual route handler
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
