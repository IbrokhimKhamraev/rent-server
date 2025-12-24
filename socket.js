const {Server} = require("socket.io")
const https = require("https")
const express = require("express")

const app = express()
const server = https.createServer(app)
const io = new Server(server, {
   cors: {
      origin: "https://ijara2.netlify.app",
      credentials: true
   }
})


let users = []

const addUser = (userId, connectId, socketId) => {
   !users.some(user => user.connectId === connectId) &&
   users.push({userId, connectId, socketId})
}

const removeUser = (socketId) => {
   users = users.filter(user => user.socketId !== socketId)
}


const getUsers = (userId) => {
   const filteredUsers = users
   return filteredUsers.filter(user => user.userId === userId).map(u => u.socketId)
}


io.on("connection", (socket) => {
   // when connect
   console.log("a user connected");
   // take userId and socketId from user
   socket.on("addUser", (userId, connectId) => {
      addUser(userId, connectId, socket.id)
      io.emit("getUsers", users) 
   })

   // add customer
   socket.on("addCustomer", (userId) => {
      const users = getUsers(userId)
      io.to([...users]).emit("fetchCustomers", userId)
   })   

   // delete customer
   socket.on("deleteCustomer", (userId) => {
      const users = getUsers(userId)
      io.to([...users]).emit("fetchCustomers", userId)
   }) 
   
   // add, update and delete tool
   socket.on("updateTools", (userId) => {
      const users = getUsers(userId)
      io.to([...users]).emit("fetchTools", userId)
   }) 

   // when disconnect
   socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id)
      // io.emit("getUsers", users)
   })

})

module.exports = {io, app, server}