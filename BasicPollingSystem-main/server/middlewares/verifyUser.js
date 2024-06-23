export const verifyUser = (req, res, next) => {
  // console.log("req.user\n", req.user);
  const { email } = req.params;
  if (email !== req.user.email) {
    // console.log("email\n", email);
    // console.log("req.user.email\n", req.user.email);
    return res.status(200).send("Please login U R not authorised!");
  }
  // console.log("email\n", email);
  next();
};
