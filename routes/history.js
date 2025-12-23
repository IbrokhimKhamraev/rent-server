const express = require("express")
const {customersHistory, tradeHistory} = require("../controllers/history")
const {verifyUser} = require("../utils/verifyUser")

const router = express.Router()

router.get("/get-customers", verifyUser, customersHistory)
router.get("/get-trade", verifyUser, tradeHistory)

module.exports = router