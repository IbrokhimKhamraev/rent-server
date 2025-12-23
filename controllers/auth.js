const db = require("../connect")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const register = (req, res) => {
   const q = "SELECT * FROM users WHERE username = ?";

   const username = req.body.username
   const password = req.body.password
   const discount = req.body.discount || "simple"
   const admin = 0
   const rent = req.body.checkList.find(item => item.text === "Uskunalar ijarasi").have ? 1 : 0
   const hardware = req.body.checkList.find(item => item.text === "Qurilish mollari").have ? 1 : 0
   const grocery = req.body.checkList.find(item => item.text === "Oziq-ovqat").have ? 1 : 0


   const salt = bcrypt.genSaltSync(10)

   bcrypt.hash(password, salt, (err, hash) => {
      if(err) {
         return res.status(500).json(err)
      }

      db.query(q, [username], (err, data) => {
         if(err) return res.status(500).json(err)
         console.log(data);
         if(data.length) return res.status(409).json({success: false, message: `"${data[0].username}" nomli foydalanuvhi allaqachon ro'yxatdan o'tgan`})


         const q = "INSERT INTO users (`username`, `password`, `discount`, `admin`, `rent`, `hardware`, `grocery`) VALUE (?)";
         const values = [username, hash, discount, admin, rent, hardware, grocery]

         db.query(q, [values], (err, data) => {
            if(err) return res.status(500).json(err)
            return res.status(200).json({success: true, message: "Foydalanuvchi ro'yxatdan o'tdi."})
         })
      })
   })
}

const login = (req, res) => {
   const username = req.body.username
   const password = req.body.password
   const q = "SELECT * FROM users WHERE username = ?"

   db.query(q, [username], (err, data) => {
      if(err) return res.status(500).json(err)
      if(data.length === 0) return res.status(403).json({success: false, message: "Foydalanuvchi nomi yoki parol noto'g'ri"})
      
      bcrypt.compare(password, data[0].password, (error, response) => {
         if(error)  return res.status(403).json({success: false, message: "Foydalanuvchi nomi yoki parol noto'g'ri"})
         if(!response)  return res.status(403).json({success: false, message: "Foydalanuvchi nomi yoki parol noto'g'ri"})

         const connectId = Math.random().toString(32).slice(-8)
         const token = jwt.sign({id: data[0].id, admin: data[0].admin}, process.env.JWT_SECRET, {expiresIn: "180d"})
         const {password, ...others} = data[0]
         res
            .status(200)
            .cookie("rent_tools", token, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 180})
            .json({user: {...others, connectId}, success: true})
      })
   })
}

const checkAuth = (req, res) => {
   
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const q = "SELECT * FROM users WHERE id = ?"
   
   db.query(q, [req.user], (err, data) => {
      if(err) return res.status(500).json(err)
      if(data.length === 0) return res.status(403).json({success: false, message: "Foydalanuvchi topilmadi"})
      if(data[0].active === 0) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
      
      const connectId = req.query.connectId !== "undefined" ? req.query.connectId : Math.random().toString(32).slice(-8)

      const token = jwt.sign({id: data[0].id, admin: data[0].admin}, process.env.JWT_SECRET, {expiresIn: "180d"})
      const {password, ...others} = data[0]

      res
         .status(200)
         .cookie("rent_tools", token, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 180})
            .json({user: {...others, connectId}, success: true})
   })
}

const logout = (req, res) => {
   res.clearCookie("rent_tools", {
      secure: true,
      sameSite: "none"
   }).status(200).json({success: true, message: "Foydalanuvchi tizimdan chiqdi."})
}


module.exports = {register, login, checkAuth, logout}