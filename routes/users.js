require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

const express = require("express");
const router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const mime = require("mime-types");

// Configuration de Cloudinary via CLOUDINARY_URL
cloudinary.config();

// Route POST pour s'inscrire
router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["username", "email", "password"])) {
    return res.json({ result: false, error: "Missing fields" });
  }
  try {
    const existingUser = await User.findOne({ username: new RegExp(req.body.username, "i") });
    if (existingUser) return res.json({ result: false, error: "User already exists" });
    const hash = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      token: uid2(32),
    });
    const savedUser = await newUser.save();
    res.json({ result: true, username: savedUser.username, token: savedUser.token });
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// Route POST pour se connecter
router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Missing fields" });
  }
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      return res.json({
        result: true,
        username: user.username,
        email: user.email,
        token: user.token,
        _id: user._id,
      });
    }
    res.json({ result: false, error: "User not found or password error" });
  } catch (error) {
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// GÉNÉRER UNE SIGNATURE POUR CLOUDINARY
router.get("/uploadAvatar", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder: "avatars",
    upload_preset: "avatars"
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret
  );

  res.json({
    signature,
    timestamp,
    api_key: cloudinary.config().api_key,
    upload_preset: "avatars",
    cloudName: cloudinary.config().cloud_name
  });
});



// METTRE À JOUR L’AVATAR DE L’UTILISATEUR
router.post("/updateAvatar", async (req, res) => {
  const { userId, avatarUrl } = req.body;
  if (!userId || !avatarUrl) return res.status(400).json({ result: false, error: "Missing data" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ result: false, error: "User not found" });

    if (user.avatarUrl) {
      const publicId = user.avatarUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({ result: true, avatarUrl: user.avatarUrl });
  } catch (error) {
    res.status(500).json({ result: false, error: "Server error" });
  }
});


// Route GET pour récupérer les avatars
router.get("/avatars", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "avatars",
      max_results: 20,
      next_cursor: req.query.cursor || null,
    });
    const avatars = result.resources
      .filter((r) => r.resource_type === "image")
      .map((r) => r.secure_url);
    res.json({ avatars, nextCursor: result.next_cursor || null });
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve avatars", details: error.message });
  }
});

// Route GET pour générer la signature pour un upload signé via le preset "avatars"
router.get("/uploadAvatar", (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder: "avatars",
    upload_preset: "avatars",
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);
  res.json({
    signature,
    timestamp,
    api_key: cloudinary.config().api_key,
    upload_preset: "avatars",
  });
});

module.exports = router;
