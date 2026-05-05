import bcrypt from "bcryptjs";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
// Get all users (Customers, Owners, Delivery Boys)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `Fetch users error: ${error}` });
    }
};

// Toggle Block/Unblock status
export const toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();
        
        return res.status(200).json({ 
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, 
            user 
        });
    } catch (error) {
        return res.status(500).json({ message: `Block user error: ${error}` });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete user error: ${error}` });
    }
};

// Add User Directly from Admin Panel
export const adminAddUser = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role,
            isVerified: true // Auto-verify admin-created accounts
        });

        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        return res.status(500).json({ message: `Admin Add User Error: ${error}` });
    }
};

// Edit/Update User Details
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, mobile, role } = req.body;

        // Find the user and update their details
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { fullName, email, mobile, role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        return res.status(500).json({ message: `Update user error: ${error}` });
    }
};

// Fetch all orders for the Admin
export const getAllOrders = async (req, res) => {
    try {
        // Populate all necessary fields to show names instead of raw IDs
        const orders = await Order.find()
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
            .sort({ createdAt: -1 });
            
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `Fetch orders error: ${error}` });
    }
};

// Admin manually updates an order status
export const adminUpdateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Find the specific shop's order inside the main order
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

        shopOrder.status = status;
        await order.save();

        return res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        return res.status(500).json({ message: `Admin update order status error: ${error}` });
    }
};

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Count documents in parallel for maximum speed
        const [userCount, shopCount, orderCount, itemCount] = await Promise.all([
            User.countDocuments(),
            Shop.countDocuments(),
            Order.countDocuments(),
            Item.countDocuments()
        ]);

        // Get the 5 most recent orders for a quick-glance table
        const recentOrders = await Order.find()
            .populate("user", "fullName")
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            counts: {
                users: userCount,
                shops: shopCount,
                orders: orderCount,
                items: itemCount
            },
            recentOrders
        });
    } catch (error) {
        return res.status(500).json({ message: `Dashboard stats error: ${error}` });
    }
};