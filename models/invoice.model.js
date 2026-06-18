import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    name: String,
    price: Number,
    quantity: Number,
    total: Number
})

const invoiceShopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    shopName: String,
    subtotal: Number,
    items: [invoiceItemSchema]
})

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    customerName: String,
    customerEmail: String,
    customerMobile: String,
    deliveryAddress: {
        text: String,
        latitude: Number,
        longitude: Number
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending'],
        default: 'pending'
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    },
    shopOrders: [invoiceShopOrderSchema],
    subtotal: Number,
    deliveryFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

// Auto-generate invoice number before saving
invoiceSchema.pre('validate', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date()
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const count = await mongoose.model("Invoice").countDocuments() + 1
        this.invoiceNumber = `PKN-${year}${month}-${count.toString().padStart(5, '0')}`
    }
    next()
})

const Invoice = mongoose.model("Invoice", invoiceSchema)
export default Invoice
