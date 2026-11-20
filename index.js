import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import adminRouter from "./routes/admin.routes.js";
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"

const app=express()
const server=http.createServer(app)

// 2. Socket.IO CORS
const io=new Server(server,{
   cors:{
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://pakwan-network.vercel.app"   // <-- add this
    ],
    credentials:true,
    methods:['POST','GET', 'PUT','DELETE']
}
})

app.set("io",io)

const port=process.env.PORT || 5000

app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://pakwan-network.vercel.app"   // <-- add this
    ],
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())
// Prevent 304 Not Modified caching for all API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/shop",shopRouter)
app.use("/api/item",itemRouter)
app.use("/api/order",orderRouter)
app.use("/api/admin", adminRouter);

// Turn upload errors (wrong file type, file too large) and any other
// unhandled error into a clear JSON response instead of an HTML 500 page.
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err)
    if (err.name === "MulterError") {
        const message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 5 MB)" : err.message
        return res.status(400).json({ message })
    }
    if (err.status === 400) return res.status(400).json({ message: err.message })
    console.error("Unhandled error:", err)
    return res.status(500).json({ message: "Something went wrong on the server" })
})

socketHandler(io)
server.listen(port,()=>{
    connectDb()
    console.log(`Server is running on port ${port}`)
})

