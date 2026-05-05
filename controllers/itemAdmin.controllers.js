import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";

// 1. Get all Shops for the dropdown selection when creating an item
export const getAvailableShops = async (req, res) => {
    try {
        const shops = await Shop.find().select("name");
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `Fetch shops error: ${error}` });
    }
};

// 2. Get all Items for Admin Table
export const getAllItemsForAdmin = async (req, res) => {
    try {
        const items = await Item.find()
            .populate("shop", "name") // Bring in the restaurant name
            .sort({ createdAt: -1 });
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: `Fetch admin items error: ${error}` });
    }
};

// 3. Admin Add New Item
export const adminAddItem = async (req, res) => {
    try {
        const { name, price, description, image, shop, isAvailable } = req.body;

        const newItem = await Item.create({
            name,
            price: Number(price),
            description,
            image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", // Default food image
            shop,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });

        return res.status(201).json({ message: "Item created successfully", item: newItem });
    } catch (error) {
        return res.status(500).json({ message: `Admin add item error: ${error}` });
    }
};

// 4. Admin Edit Item
export const adminUpdateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, image, shop, isAvailable } = req.body;

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { name, price: Number(price), description, image, shop, isAvailable },
            { new: true }
        );

        if (!updatedItem) return res.status(404).json({ message: "Item not found" });

        return res.status(200).json({ message: "Item updated successfully", item: updatedItem });
    } catch (error) {
        return res.status(500).json({ message: `Admin update item error: ${error}` });
    }
};

// 5. Toggle Item Availability (In Stock / Out of Stock)
export const toggleItemAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.isAvailable = !item.isAvailable;
        await item.save();
        
        return res.status(200).json({ 
            message: `Item marked as ${item.isAvailable ? 'In Stock' : 'Out of Stock'}`, 
            item 
        });
    } catch (error) {
        return res.status(500).json({ message: `Toggle item availability error: ${error}` });
    }
};

// 6. Delete Item
export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Item.findByIdAndDelete(id);
        return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete item error: ${error}` });
    }
};