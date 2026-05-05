import express from "express";
import { adminAddUser, deleteUser, getAllUsers, getDashboardStats, toggleBlockUser, updateUser } from "../controllers/admin.controllers.js";
import { 
  getAvailableOwners, 
  getAllShopsForAdmin, 
  adminAddShop, 
  adminUpdateShop, 
  toggleBlockShop, 
  deleteShop 
} from "../controllers/shopAdmin.controllers.js";

import { 
  getAvailableShops, getAllItemsForAdmin, adminAddItem, 
  adminUpdateItem, toggleItemAvailability, deleteItem 
} from "../controllers/itemAdmin.controllers.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.put("/users/block/:id", toggleBlockUser);
router.delete("/users/:id", deleteUser);
router.post("/users/add", adminAddUser);
router.put("/users/edit/:id", updateUser); 

// Shop Management Routes
router.get("/owners/available", getAvailableOwners); // For form dropdown
router.get("/shops", getAllShopsForAdmin);
router.post("/shops/add", adminAddShop);
router.put("/shops/edit/:id", adminUpdateShop);
router.put("/shops/block/:id", toggleBlockShop);
router.delete("/shops/:id", deleteShop);

// Item Management Routes
router.get("/shops/available", getAvailableShops); // For dropdown
router.get("/items", getAllItemsForAdmin);
router.post("/items/add", adminAddItem);
router.put("/items/edit/:id", adminUpdateItem);
router.put("/items/availability/:id", toggleItemAvailability);
router.delete("/items/:id", deleteItem);
router.get("/dashboard-stats", getDashboardStats);

export default router;