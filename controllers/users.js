const db = require("../connect")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const getUser = (req, res) => {
   
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const userId = req.user

   const q = "SELECT * FROM users WHERE id = ?"

   db.query(q, [userId], (err, data) => {
      if(err) return res.status(500).json(err)
      if(data.length === 0) return res.status(403).json({success: false, message: "Foydalanuvchi topilmadi"})
      
      const token = jwt.sign({id: data[0].id, admin: data[0].admin}, process.env.JWT_SECRET, {expiresIn: "180d"})
      const {password, ...others} = data[0]

      res
         .status(200)
         .cookie("rent_tools", token, {httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 180})
         .json({user: others, success: true})
   })
}

const getUserDetails = (req, res) => {
   
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const userId = req.params.id

   const q = "SELECT u.*, SUM(i.amount) AS incomes, i.created_at AS last_trade_date, i.amount AS last_trade_amount FROM users AS u LEFT JOIN income AS i ON (u.id = i.user_id) WHERE u.id = ? ORDER BY i.created_at ASC"
   db.query(q, [userId], (err, data) => {
      console.log(err);
      if(err) return res.status(500).json(err)
      const {password, ...others} = data[0]
      
      res.status(200).json({user: {...others, customers: data}, success: true})
   })
}

const updateUserDetails = (req, res) => {
   
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const userId = req.params.id
   const q = "SELECT * FROM users WHERE username = ?";

   const username = req.body.username
   const password = req.body.password
   const discount = req.body.discount || "simple"
   const admin = 0
   const rent = req.body.checkList.find(item => item.text === "Uskunalar ijarasi").have ? 1 : 0
   const hardware = req.body.checkList.find(item => item.text === "Qurilish mollari").have ? 1 : 0
   const grocery = req.body.checkList.find(item => item.text === "Oziq-ovqat").have ? 1 : 0
   const active = req.body.checkList.find(item => item.text === "Faol").have ? 1 : 0

   if(password.length > 0) {
   const salt = bcrypt.genSaltSync(10)

   bcrypt.hash(password, salt, (err, hash) => {
      if(err) {
         return res.status(500).json(err)
      }

      db.query(q, [username], (err, data) => {
         if(err) return res.status(500).json(err)
         if(data.length &&  data[0].id !== Number(userId)) return res.status(409).json({success: false, message: `"${data[0].username}" nomli foydalanuvhi allaqachon ro'yxatdan o'tgan`})

         const q = "UPDATE users SET `username`=?, `password`=?, `discount`=?, `admin`=?, `rent`=?, `hardware`=?, `grocery`=?, `active`=? WHERE id = ?";
         const values = [username, hash, discount, admin, rent, hardware, grocery, active, userId]

         db.query(q, [...values], (err, data) => {
            if(err) return res.status(500).json(err)
            return res.status(200).json({success: true, message: "Foydalanuvchi ro'yxatdan o'tdi."})
         })
      })
   })
   } else {
      
      db.query(q, [username], (err, data) => {
         if(err) return res.status(500).json(err)
         if(data.length &&  data[0].id !== Number(userId)) return res.status(409).json({success: false, message: `"${data[0].username}" nomli foydalanuvhi allaqachon ro'yxatdan o'tgan`})

         const q = "UPDATE users SET `username`=?, `discount`=?, `admin`=?, `rent`=?, `hardware`=?, `grocery`=?, `active`=? WHERE id = ?";
         const values = [username, discount, admin, rent, hardware, grocery, active, userId]

         db.query(q, [...values], (err, data) => {
            if(err) return res.status(500).json(err)
            return res.status(200).json({success: true, message: "Foydalanuvchi ma'lumotlari o'zgartirildi."})
         })
      })
   }




   // const q = "SELECT * FROM users WHERE id = ?"

   // db.query(q, [userId], (err, data) => {
   //    if(err) return res.status(500).json(err)
   //    const {password, ...others} = data[0]
      
   //    res.status(200).json({user: {...others, customers: data}, success: true})
   // })

   // res.status(200).json({success: true, user: req.body})
}

const getUsers = (req, res) => {
   const q = "SELECT * FROM users"
   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      res.status(200).json({success: true, users: data})
   })
}

const deleteUser = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const userId = req.params.id
   if(!userId) return res.status(500).json({success: false, message: "Serverda xatolik"})
   const q = `DELETE FROM users WHERE id = '${userId}'`
   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      res.status(200).json({success: true, message: "Foydalanuvhi o'chirildi."})
   })
}

const getUserInfo = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})

   const userId = req.user

   const q = "SELECT u.username, SUM(i.amount) AS incomes FROM users AS u LEFT JOIN income AS i ON (u.id = i.user_id) WHERE u.id = ?"

   db.query(q, [userId], (err, data) => {
      if(err) return res.status(500).json(err)
      res.status(200).json({success: true, user: data[0]})
   })
}

module.exports = {getUser, getUserDetails, getUsers, updateUserDetails, deleteUser, getUserInfo} 