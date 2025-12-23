const express = require("express")
const { give, history, onRent, returnRental, changeDebt, histories } = require("../controllers/rent")
const { verifyUser } = require("../utils/verifyUser")

const router = express.Router()

router.post("/give", verifyUser, give)
router.post("/return", verifyUser, returnRental)
router.post("/change-debt", verifyUser, changeDebt)
router.get("/on-rent/:id", verifyUser, onRent)
router.get("/history/:id", verifyUser, history)
router.get("/all-history/:id", verifyUser, histories)

module.exports = router