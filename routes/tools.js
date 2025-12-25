const express = require("express")
const { addTool, getTools, deleteTool, updateTool } = require("../controllers/tools")
const {verifyUser} = require("../utils/verifyUser")

const router = express.Router()

router.post("/add", verifyUser, addTool)
router.put("/update/:id", verifyUser, updateTool)
router.get("/get-tools", verifyUser, getTools)
router.delete("/delete/:name", verifyUser, deleteTool)

module.exports = router