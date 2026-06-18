import Invoice from "../models/invoice.model.js"
import Order from "../models/order.model.js"
import { badRequest, forbidden, isValidObjectId } from "../utils/validators.js"

const calculateCharges = (subtotal) => {
    const deliveryFee = subtotal > 500 ? 0 : 40
    const tax = Math.round(subtotal * 0.05)
    return { deliveryFee, tax, totalAmount: subtotal + deliveryFee + tax }
}

export const generateInvoice = async (order, user) => {
    try {
        const existingInvoice = await Invoice.findOne({ order: order._id })
        if (existingInvoice) return existingInvoice

        const subtotal = order.shopOrders.reduce((sum, so) => sum + (so.subtotal || 0), 0)
        const { deliveryFee, tax, totalAmount } = calculateCharges(subtotal)
        const shopOrdersData = order.shopOrders.map(so => ({
            shop: so.shop?._id || so.shop,
            shopName: so.shop?.name || "Restaurant",
            subtotal: so.subtotal,
            items: so.shopOrderItems.map(item => ({
                item: item.item?._id || item.item,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            }))
        }))

        return await Invoice.create({
            order: order._id,
            user: user._id || user,
            customerName: user.fullName || user.name || "Customer",
            customerEmail: user.email || "",
            customerMobile: user.mobile || "",
            deliveryAddress: order.deliveryAddress,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.payment ? "paid" : "pending",
            razorpayPaymentId: order.razorpayPaymentId || "",
            shopOrders: shopOrdersData,
            subtotal,
            deliveryFee,
            tax,
            totalAmount,
            paidAt: order.payment ? new Date() : null
        })
    } catch (error) {
        console.log(`Invoice generation error: ${error.message}`)
        return null
    }
}

export const getInvoiceByOrder = async (req, res) => {
    try {
        const { orderId } = req.params
        if (!isValidObjectId(orderId)) return badRequest(res, "Invalid order id")

        const order = await Order.findById(orderId)
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.shopOrderItems.item", "name image price")
        if (!order) return res.status(404).json({ message: "Order not found" })

        const isOrderOwner = String(order.user._id) === String(req.userId)
        const isShopOwner = order.shopOrders.some(so => String(so.owner) === String(req.userId))
        const isDeliveryBoy = order.shopOrders.some(so => String(so.assignedDeliveryBoy) === String(req.userId))
        if (!isOrderOwner && !isShopOwner && !isDeliveryBoy) return forbidden(res, "Not authorized to view this invoice")

        let invoice = await Invoice.findOne({ order: orderId })
        if (!invoice) {
            invoice = await generateInvoice(order, order.user)
            if (!invoice) return res.status(500).json({ message: "Failed to generate invoice" })
        }
        return res.status(200).json(invoice)
    } catch (error) {
        return res.status(500).json({ message: `Get invoice error: ${error.message}` })
    }
}

export const getInvoiceById = async (req, res) => {
    try {
        const { invoiceId } = req.params
        if (!isValidObjectId(invoiceId)) return badRequest(res, "Invalid invoice id")
        const invoice = await Invoice.findById(invoiceId)
        if (!invoice) return res.status(404).json({ message: "Invoice not found" })

        const order = await Order.findById(invoice.order)
        const isOrderOwner = String(invoice.user) === String(req.userId)
        const isShopOwner = order?.shopOrders?.some(so => String(so.owner) === String(req.userId))
        const isDeliveryBoy = order?.shopOrders?.some(so => String(so.assignedDeliveryBoy) === String(req.userId))
        if (!isOrderOwner && !isShopOwner && !isDeliveryBoy) return forbidden(res, "Not authorized to view this invoice")

        return res.status(200).json(invoice)
    } catch (error) {
        return res.status(500).json({ message: `Get invoice by id error: ${error.message}` })
    }
}

export const markInvoicePaid = async (req, res) => {
    try {
        const { orderId } = req.params
        if (!isValidObjectId(orderId)) return badRequest(res, "Invalid order id")
        const invoice = await Invoice.findOne({ order: orderId })
        if (!invoice) return res.status(404).json({ message: "Invoice not found" })

        const order = await Order.findById(orderId)
        const isAssignedDeliveryBoy = order?.shopOrders?.some(so => String(so.assignedDeliveryBoy) === String(req.userId) && so.status === "delivered")
        if (!isAssignedDeliveryBoy) return forbidden(res, "Not authorized to mark this invoice paid")

        invoice.paymentStatus = "paid"
        invoice.paidAt = new Date()
        await invoice.save()
        return res.status(200).json(invoice)
    } catch (error) {
        return res.status(500).json({ message: `Mark paid error: ${error.message}` })
    }
}
