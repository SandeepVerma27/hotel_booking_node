import express from "express";

import {
  storeHotel,
  getAllHotels,
  getHotels,
  updateHotel,
  deleteHotel,
} from "../controller/hotelManageController.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import createUploader from "../middleware/uploadMiddleware.js";
const hotelUpload = createUploader("hotel-image");

const hotelRoutes = express.Router();
hotelRoutes.get(
  "/hotels",
  authenticateToken,
  authorizeRoles("admin"),
  getAllHotels
);
hotelRoutes.post(
  "/hotel",
  hotelUpload.single("hotel_image"),
  authenticateToken,
  authorizeRoles("admin"),

  storeHotel
);

hotelRoutes.get(
  "/hotel/:id",
  authenticateToken,
  authorizeRoles("admin"),
  
  getHotels
);
hotelRoutes.put(
  "/hotel/:id",
  hotelUpload.single("hotel_image"),
  authenticateToken,
  authorizeRoles("admin"),

  updateHotel
);
hotelRoutes.delete(
  "/hotel/:id",
  authenticateToken,
  authorizeRoles("admin"),
 
  deleteHotel
);

export default hotelRoutes;
