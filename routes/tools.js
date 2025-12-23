const express = require("express")
const { addTool, getTools, deleteTool, updateTool } = require("../controllers/tools")
const { upload } = require("../utils/image")
const {verifyUser} = require("../utils/verifyUser")

const router = express.Router()

router.post("/add", verifyUser, addTool)
router.put("/update/:id", verifyUser, updateTool)
router.get("/get-tools", verifyUser, getTools)
router.delete("/delete/:name", verifyUser, deleteTool)


router.post("/upload-image", upload.single("image"), (req, res) => {
   if(!req.file) return res.status(400).json({success: false, message: "Rasm topilmadi." });

   // const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

   res.status(200).json({success: true,  imageUrl: req.file.filename})
})

module.exports = router