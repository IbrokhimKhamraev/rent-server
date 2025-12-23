const db = require("../connect")

const give = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const customer_name = req.query.name
   const phone_number = req.query.number

   const userId = req.user
   const values = [
      userId,
      req.body.data.customer_id,
      customer_name,
      phone_number,
      req.body.data.seller, 
      req.body.data.description, 
      req.body.data.date, 
      "rent",
      JSON.stringify(req.body.tools)
   ]
   const q = "INSERT INTO rent_details (`user_id`, `customer_id`, `customer_name`, `phone_number`, `seller_name`, `desc`, `created_at`, `type`, `tools`) VALUES (?)"
   
   db.query(q, [values], (err, data) => {
      if(err) return res.status(500).json(err)
      
      const detail_id = data.insertId
      
      const q = "INSERT INTO rent_tool (`tool_id`, `amount`, `price`, `due`, `type_amount`, `additional_name`, `additional_amount`, `detail_id`) VALUES (?)"
      for (let i = 0; i < req.body.tools.length; i++) {
         const values = [
            req.body.tools[i].id,
            req.body.tools[i].amount,
            req.body.tools[i].price,
            req.body.tools[i].due,
            req.body.tools[i].typeAmount,
            req.body.tools[i].nameAdditional || "",
            req.body.tools[i].amountAdditional || 0,
            detail_id
         ]


         db.query(q, [values], (err, data) => {
            if(err) return
            if(data.affectedRows === 1) {
               const q = "UPDATE tools SET in_rent = in_rent + ?  WHERE user_id= ? && id= ?"
               db.query(q, [Number(req.body.tools[i].amount), userId, req.body.tools[i].id], (err, data) => {
                  if(err) return
                  return
               })
            }
         })
      }
      res.json({success: true, message: "Ijara amalga oshdi."})
   })
}

const history = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const userId = req.user
   const customer = req.params.id

   const q = "SELECT * FROM rent_details WHERE customer_id = ? && user_id = ?"

   db.query(q, [customer, userId], (err, data) => {
      if(err) return res.status(500).json(err)

      res.json({success: true, data})
   })
}

const histories = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const userId = req.user
   const customer = req.params.id
   const phoneNumber = req.query.number

   const q = `SELECT * FROM rent_details WHERE customer_id = ${customer} && user_id = ${userId} || phone_number = ${phoneNumber} && user_id = ${userId}`

   db.query(q,  (err, data) => {
      if(err) return res.status(500).json(err)

      res.json({success: true, data})
   })
}

const onRent = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const userId = req.user
   const customer = req.params.id

   const q = "SELECT rt.*, d.created_at, t.img, t.length, t.height, t.tool_name FROM rent_tool AS rt JOIN rent_details AS d ON (rt.detail_id = d.id) JOIN tools AS t ON (rt.tool_id = t.id) WHERE d.customer_id = ? && d.user_id = ?"

   db.query(q, [customer, userId], (err, data) => {
      if(err) return res.status(500).json(err)

      res.json({success: true, all: data, sorted: data})
   })
}

const returnRental = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const customer_name = req.query.name
   const phone_number = req.query.number

   const userId = req.user
   const total = req.body.totalSumm.subtotal - req.body.totalSumm.employeDiscount
   const values = [
      userId,
      req.body.data.customer_id,
      customer_name,
      phone_number,
      req.body.data.seller, 
      req.body.data.description, 
      req.body.data.date, 
      req.body.type,
      req.body.totalSumm.subtotal,
      req.body.totalSumm.employeDiscount,
      JSON.stringify(req.body.tools)
   ]
   const q = "INSERT INTO rent_details (`user_id`, `customer_id`, `customer_name`,  `phone_number`, `seller_name`, `desc`, `created_at`, `type`, `subtotal`, `discount`, `tools`) VALUES (?)"
   
   db.query(q, [values], (err, data) => {
      if(err) return res.status(500).json(err)
      
      const qDelete = "DELETE FROM rent_tool WHERE detail_id = ? && id = ?"
      for (let i = 0; i < req.body.toDelete.length; i++) {
         const {detail_id, id} = req.body.toDelete[i]
         db.query(qDelete, [detail_id, id], (err, data) => {
            return
         })         
      }
      
      const qUpdate = "UPDATE rent_tool SET `amount`=?, `additional_name`=?, `additional_amount`=? WHERE detail_id=? && id=?"
      for (let i = 0; i < req.body.toUpdate.length; i++) {
         const VALUES = [
            req.body.toUpdate[i].amount, 
            req.body.toUpdate[i].additional_name, 
            req.body.toUpdate[i].additional_amount, 
            req.body.toUpdate[i].detail_id, 
            req.body.toUpdate[i].id
         ]
         db.query(qUpdate, [...VALUES], (err, data) => {
            return
         })         
      }
      
      for (let i = 0; i < req.body.tools.length; i++) {
         const {amount, tool_id} = req.body.tools[i]

         const q = "UPDATE tools SET in_rent = in_rent - ?  WHERE user_id= ? && id= ?"
         db.query(q, [Number(amount), userId, tool_id], (err, data) => {
            if(err) return
            return
         })
      }
      
      if(req.body.type === "paid") {
         const q = "INSERT INTO income (`user_id`, `from`, `amount`, `created_at`) VALUES (?)"
      
         const values = [
            userId,
            "rent",
            total,
            req.body.data.date
         ]
         db.query(q, [values], (err, data) => {
            if(err) return
            return
         })
      } else if(req.body.type === "unpaid") {
         const q = "UPDATE customers SET debt = debt + ? WHERE user_id = ? && id = ?"
         db.query(q, [total, userId, req.body.data.customer_id], (err, data) => {
            if(err) return
         })
      }

      res.json({success: true, message: "Ijaradan mahsulotlar qaytarildi."})
   })
}

const changeDebt = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})

   const customer_name = req.query.name
   const phone_number = req.query.number

   const userId = req.user
   const values = [
      userId,
      req.body.customer_id,
      customer_name,
      phone_number,
      req.body.seller, 
      req.body.description, 
      req.body.date, 
      "debt",
      req.body.amount,
      0,
      JSON.stringify("change in debt status")
   ]
   const q = "INSERT INTO rent_details (`user_id`, `customer_id`, `customer_name`, `phone_number`, `seller_name`, `desc`, `created_at`, `type`, `subtotal`, `discount`, `tools`) VALUES (?)"
   
   db.query(q, [values], (err, data) => {
      if(err) return res.status(500).json(err)
      
         const q = "INSERT INTO income (`user_id`, `from`, `amount`, `created_at`) VALUES (?)"
      
         const values = [
            userId,
            "rent",
            req.body.amount,
            req.body.date
         ]
         db.query(q, [values], (err, data) => {
            if(err) return
            return
         })

         const q1 = "UPDATE customers SET debt = debt - ? WHERE user_id = ? && id = ?"
         db.query(q1, [req.body.amount, userId, req.body.customer_id], (err, data) => {
            if(err) return
         })

      res.json({success: true, message: "Mijozning qarzdorlik holati o'zgartirildi."})
   })
}

module.exports = {give, history, onRent, returnRental, changeDebt, histories}