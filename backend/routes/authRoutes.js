const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUserInfo,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  res.status(200).json({ imageUrl });
});

module.exports = router;
