import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// FormData sends missing values as the strings "undefined" / "null"
const cleanText = (value) => {
  const text = String(value ?? "").trim();
  return text === "undefined" || text === "null" ? "" : text;
};

export const createEditShop = async (req, res) => {
  try {
    const name = cleanText(req.body.name);
    const city = cleanText(req.body.city);
    const state = cleanText(req.body.state);
    const address = cleanText(req.body.address);

    const missing = [
      ["name", name],
      ["city", city],
      ["state", state],
      ["address", address],
    ]
      .filter(([, value]) => !value)
      .map(([field]) => field);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Please fill in the shop ${missing.join(", ")}.` });
    }

    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop && !req.file) {
      return res.status(400).json({ message: "Please upload a shop image." });
    }

    let image;
    if (req.file) {
      try {
        image = await uploadOnCloudinary(req.file.path);
      } catch (uploadError) {
        return res.status(500).json({ message: uploadError.message });
      }
    }

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
      await shop.populate("owner items");
      return res.status(201).json(shop);
    }

    const updates = { name, city, state, address };
    if (image) updates.image = image; // keep the old image if no new one was uploaded
    shop = await Shop.findByIdAndUpdate(shop._id, updates, {
      new: true,
      runValidators: true,
    });
    await shop.populate("owner items");
    return res.status(200).json(shop);
  } catch (error) {
    console.error("create/edit shop error:", error);
    return res.status(500).json({ message: `create shop error ${error.message}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });
    if (!shop) {
      // return null
      return res.status(200).json(null);
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get my shop error ${error}` });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shops) {
      return res.status(400).json({ message: "shops not found" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get shop by city error ${error}` });
  }
};

// Add this to the bottom of shop.controllers.js

export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the shop by its ID and populate the menu items
    const shop = await Shop.findById(id)
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }, // Keeps the newest items at the top!
      })
      .populate("owner", "fullName email"); // Optional: get basic owner info

    if (!shop) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get shop by id error ${error}` });
  }
};
