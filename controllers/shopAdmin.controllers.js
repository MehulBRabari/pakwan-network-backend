import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";

// 1. Get all "Owner" users for dropdown selection
export const getAvailableOwners = async (req, res) => {
    try {
        const owners = await User.find({ role: "owner" }).select("fullName email");
        return res.status(200).json(owners);
    } catch (error) {
        return res.status(500).json({ message: `Fetch owners error: ${error}` });
    }
};

// 2. Get all Shops for Admin Table
export const getAllShopsForAdmin = async (req, res) => {
    try {
        const shops = await Shop.find()
            .populate("owner", "fullName email mobile")
            .sort({ createdAt: -1 });
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `Fetch admin shops error: ${error}` });
    }
};

// 3. Admin Add New Shop
export const adminAddShop = async (req, res) => {
    try {
        const { name, owner, address, longitude, latitude, image } = req.body;

        // Backend GeoJSON validation
        if (!longitude || !latitude) {
            return res.status(400).json({ message: "Coordinates are required" });
        }

        const newShop = await Shop.create({
          name,
          owner, // Associated User ID
          image: image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", // Default if empty
          address,
          location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)] // Correct Mongo GeoJSON order: [Long, Lat]
          }
        });

        return res.status(201).json({ message: "Shop created successfully", shop: newShop });
    } catch (error) {
        return res.status(500).json({ message: `Admin add shop error: ${error}` });
    }
};

// 4. Admin Edit Shop
export const adminUpdateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, owner, address, longitude, latitude, image } = req.body;

        const updatedData = {
          name,
          owner,
          image,
          address,
          location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
          }
        };

        const updatedShop = await Shop.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedShop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        return res.status(200).json({ message: "Shop updated successfully", shop: updatedShop });
    } catch (error) {
        return res.status(500).json({ message: `Admin update shop error: ${error}` });
    }
};

// 5. Toggle Block/Unblock Shop
export const toggleBlockShop = async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await Shop.findById(id);
        if (!shop) return res.status(404).json({ message: "Shop not found" });

        shop.isBlocked = !shop.isBlocked;
        await shop.save();
        
        return res.status(200).json({ 
            message: `Shop ${shop.isBlocked ? 'blocked' : 'unblocked'} successfully`, 
            shop 
        });
    } catch (error) {
        return res.status(500).json({ message: `Block shop error: ${error}` });
    }
};

// 6. Delete Shop
export const deleteShop = async (req, res) => {
    try {
        const { id } = req.params;
        await Shop.findByIdAndDelete(id);
        return res.status(200).json({ message: "Shop deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete shop error: ${error}` });
    }
};