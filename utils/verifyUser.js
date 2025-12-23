const jwt = require("jsonwebtoken")

const verifyUser = (req, res, next) => {
   const token = req?.cookies.rent_tools
   if(!token) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if(err) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
      req.user = data.id
      next()
   })
}

const adminOnly = (req, res, next) => {
   const token = req?.cookies.rent_tools
   if(!token) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if(err) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
      if(data.admin > 0) {
         next()
      } else {
         return res.status(403).json({success: false, message: "Access denied, admin only"})
      }
   })
}



module.exports = {verifyUser, adminOnly}