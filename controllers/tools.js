const db = require("../connect");

const addTool = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})

   const userId = req.user
   const image = req.body.imageUrl
   const toolName = req.body.toolName.toLowerCase()
   const toolAmount = req.body.toolAmount || 0
   const toolHeight = req.body.toolHeight || 0
   const toolLength = req.body.toolLength || 0


   const q = toolHeight > 0 
   ? `SELECT * FROM tools WHERE user_id = '${userId}' && height = '${toolHeight}' && length = '${toolLength}'`
   : `SELECT * FROM tools WHERE user_id = '${userId}' && tool_name = '${toolName}'`

   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
            
      if(data.length > 0) return res.status(409).json({success: false, message: toolHeight > 0 ? `"${toolName}: ${toolHeight}x${toolLength}" allaqachon mavjud!` : `"${toolName}" allaqachon mavjud!`})
      
      
      const q = "INSERT INTO tools (tool_name, img, amount, height, length, user_id) VALUES(?, ?, ?, ?, ?, ?)"
      db.query(q, [toolName, image, toolAmount, toolHeight, toolLength, userId], (err, data) => {
         if(err) return res.status(500).json(err)
         res.status(200).json({success: true, tool: data, message: "Mahsulot qo'shildi."})
      })
   }) 
}

const getTools = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const userId = req.user
   const searchTerm = req.query.searchTerm || ''
   const sort = req.query.sort || 'id DESC'
   const q = `SELECT * FROM tools WHERE user_id = ${userId} && tool_name LIKE '%${searchTerm}%' ORDER BY ${sort}`
   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      res.status(200).json({success: true, tools: data})
   })
}

const updateTool = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})

   const userId = req.user
   const id = req.params.id
   const toolImage = req.body.image
   const toolName = req.body.toolName.toLowerCase()
   const toolAmount = req.body.toolAmount || 0
   const toolHeight = req.body.toolHeight || 0
   const toolLength = req.body.toolLength || 0
   
   const q = "UPDATE tools SET `tool_name`=?, `img`=?, `amount`=?, `height`=?, `length`=? WHERE user_id=? && id=?"
   db.query(q, [toolName, toolImage, toolAmount, toolHeight, toolLength, userId, id], (err, data) => {
      if(err) return res.status(500).json(err)

      return res.status(200).json({success: true, tool: data, message: "Mahsulot yangilandi."})
   })
}

const deleteTool = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const userId = req.user
   const tool = req.params.name
   const toolHeight = req.query.tool_height
   const toolLength = req.query.tool_length
   if(!tool) return res.status(500).json({success: false, message: "Serverda xatolik"})

   const q = toolHeight > 0
      ? `DELETE FROM tools WHERE height = '${toolHeight}' && length = '${toolLength}' && user_id = '${userId}'`
      : `DELETE FROM tools WHERE tool_name = '${tool}' && user_id = '${userId}'`
   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)

      return res.status(200).json({success: true, message: "Mahsulot o'chirildi."})
   })
}

module.exports = {addTool, getTools, deleteTool, updateTool} 