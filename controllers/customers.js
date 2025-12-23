const db = require('../connect')

const addCustomer = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   
   const customerName = req.body.customerName.toLowerCase()
   const phoneNumber = req.body.phoneNumber
   const userId = req.user

   const q = `SELECT * FROM customers WHERE customer_name = '${customerName}' && user_id = '${userId}'`

   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      if(data.length > 0) return res.status(409).json({success: false, message: `"${customerName}" nomli mijoz allaqachon mavjud!`})
      const q = "INSERT INTO customers (`customer_name`, `phone_number`, `user_id`) VALUES  (?)"
      const values = [
         customerName,
         phoneNumber,
         userId
      ]
      db.query(q, [values], (err, data) => {
         if(err) return res.status(500).json(err)

         res.status(200).json({success: true, message: "Mijoz qo'shildi.", data})
      })
   })
}

const getCustomers = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const id = req.user
   const searchTerm = req.query.searchTerm || ''

   const q = `SELECT * FROM customers WHERE user_id = ${id} && customer_name LIKE '%${searchTerm}%' OR user_id = ${id} && phone_number LIKE '%${searchTerm}%' ORDER BY id DESC`
   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      res.status(200).json({success: true, customers: data})
   })
}

const getCustomer = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const customer = req.params.name
   if(!customer) return res.status(500).json({success: false, message: "Serverda xatolik"})
   const q = `SELECT * FROM customers WHERE customer_name = '${customer}' && user_id = '${req.user}'`
   db.query(q, (err, data) => {
      if(err) return res.status(500).json(err)
      res.status(200).json({success: true, customer: data[0]})
   })
}

const deleteCustomer = (req, res) => {
   if(!req.user) return res.status(401).json({success: false, message: "Ro'yxatdan o'tmagansiz!"})
   const id = req.query.id
   const name = req.query.name
   const phoneNumber = req.query.number
   
   const q = "UPDATE rent_details SET `customer_name`=?, `phone_number`=? WHERE customer_id = ?"

   db.query(q, [name, phoneNumber, id], (err, data) => {
      if(err) return res.status(500).json(err)
      const q = `DELETE FROM customers WHERE id = '${id}' && user_id = '${req.user}'`
   
      db.query(q, (err, data) => {
         if(err) return res.status(500).json(err)
         res.status(200).json({success: true, message: "Mijoz o'chirildi."})
      })
   })


}

module.exports = {addCustomer, getCustomers, getCustomer, deleteCustomer}