const db = require("../connect")

const customersHistory = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const id = req.user

   const searchTerm = req.query.searchTerm || ''
   const selectedDate = req.query.date
   const q = `SELECT * FROM rent_details WHERE user_id = ${id} && customer_name LIKE '%${searchTerm}%' && created_at LIKE '%${selectedDate}%' OR user_id = ${id} && phone_number LIKE '%${searchTerm}%' && created_at LIKE '%${selectedDate}%' ORDER BY created_at DESC`

   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      
      res.status(200).json({success: true, customers: data})
      
   })
}

const tradeHistory = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const id = req.user

   const date1 = req.query.date1
   const date2 = req.query.date2
   const today = req.query.today
   const tomorrow = req.query.tomorrow
   const weekstart = req.query.weekstart
   const monthstart = req.query.monthstart
   const yearstart = req.query.yearstart

   const q = `CALL new_procedure( ${id},'${date1}', '${date2}', '${today}', '${tomorrow}', '${weekstart}', '${monthstart}', '${yearstart}')`

   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)

      // console.log({first: data[0], second: data[1]});
      res.status(200).json({success: true, data})
   })
}

module.exports = {customersHistory, tradeHistory}