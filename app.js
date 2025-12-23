const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const customerRoutes = require("./routes/customers")
const toolRouters = require("./routes/tools")
const rentRouters = require("./routes/rent")
const historyRouters = require("./routes/history")
const path = require("path")
const io = require("./socket")

const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
   origin: "https://ijara.netlify.app/rent/customers",
   credentials: true,
   exposedHeaders: ["set-cookie"]
}))

app.use("/public", express.static(path.join(__dirname, "public")))

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/tools", toolRouters)
app.use("/api/rent", rentRouters)
app.use("/api/history", historyRouters)

app.listen(PORT, () => {console.log(`Server running on port: ${PORT}, `)})
