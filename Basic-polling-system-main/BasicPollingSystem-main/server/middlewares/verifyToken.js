import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).send("Token is required");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).send("Invalid token");
    }
    // console.log("decoded.role\n", decoded.role);
    req.user = decoded;
    next();
  });
};
