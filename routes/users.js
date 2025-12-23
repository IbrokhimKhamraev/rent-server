const express = require("express")
const { getUser, getUsers, getUserDetails, updateUserDetails, deleteUser, getUserInfo } = require("../controllers/users")
const {verifyUser, adminOnly} = require("../utils/verifyUser")

const router = express.Router()

router.get("/get-user", verifyUser, getUser)
router.get("/get-user-detail/:id", verifyUser, adminOnly, getUserDetails)
router.put("/update-user-detail/:id", verifyUser, adminOnly, updateUserDetails)
router.get("/get-users", verifyUser, adminOnly, getUsers)
router.delete("/delete-user/:id", verifyUser, adminOnly, deleteUser)
router.get("/user-info", verifyUser, getUserInfo)
router.get("/test", getUsers)

module.exports = router