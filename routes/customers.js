const express = require('express')
const { addCustomer, getCustomer, getCustomers, deleteCustomer } = require('../controllers/customers')
const {verifyUser} = require('../utils/verifyUser')

const router = express.Router()

router.post('/add', verifyUser, addCustomer)
router.get('/get-customers', verifyUser, getCustomers)
router.get("/get-customer/:name", verifyUser, getCustomer)
router.delete("/delete-customer", verifyUser, deleteCustomer)

module.exports = router