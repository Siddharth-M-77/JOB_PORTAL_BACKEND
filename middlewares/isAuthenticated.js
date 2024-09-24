import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // Retrieve the token from cookies
    const token = req.cookies.token;
    

    if (!token) {
      return res
        .status(401)
        .json({ message: "User is not authenticated", success: false });
    }

    // Verify the token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid token", success: false });
      }

      // Attach user ID to request object
      req.id = decoded.userId;
      next();
    });
  } catch (error) {
    console.log("Authentication Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export default isAuthenticated;
