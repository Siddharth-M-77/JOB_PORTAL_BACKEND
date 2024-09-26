import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // Retrieve the token from cookies
    const token = req.cookies?.token; // Check if cookies are available
    console.log(token)
    if (!token) {
      return res
        .status(401)
        .json({ message: "User is not authenticated", success: false });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res
            .status(401)
            .json({ message: "Token expired", success: false });
        }
        return res
          .status(401)
          .json({ message: "Invalid token", success: false });
      }

      // Ensure userId exists in the token payload
      if (!decoded || !decoded.userId) {
        return res
          .status(401)
          .json({ message: "Invalid token payload", success: false });
      }

      // Attach user ID to request object
      req.id = decoded.userId;

      next(); // Proceed to the next middleware
    });
  } catch (error) {
    console.log("Authentication Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export default isAuthenticated;
