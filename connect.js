const mysql = require("mysql2")
const {DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT} = process.env

const db = mysql.createConnection({
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT,
   // timezone: 'utc',
   dateStrings: ['DATETIME', 'DATE']
})


db.connect( function (err) {
   if(err) {
      console.log(err);
   } else {
      console.log("Connection estabilished.");
   }
})

module.exports = db