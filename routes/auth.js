const express = require("express")
const { register, login, checkAuth, logout } = require("../controllers/auth")
const {verifyUser} = require("../utils/verifyUser")


const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/check-auth", verifyUser, checkAuth)
router.post("/logout", logout)

module.exports = router