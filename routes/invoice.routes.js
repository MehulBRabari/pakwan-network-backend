import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getInvoiceByOrder, getInvoiceById, markInvoicePaid } from "../controllers/invoice.controllers.js"

const invoiceRouter = express.Router()

invoiceRouter.get("/by-order/:orderId", isAuth, getInvoiceByOrder)
invoiceRouter.get("/:invoiceId", isAuth, getInvoiceById)
invoiceRouter.patch("/mark-paid/:orderId", isAuth, markInvoicePaid)

export default invoiceRouter
