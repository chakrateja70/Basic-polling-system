import jwt from "jsonwebtoken";

export const verifyInstitute = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).send("Access denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "0") {
      return res
        .status(403)
        .send("Access denied. Only institutes are allowed.");
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token.");
  }
};
