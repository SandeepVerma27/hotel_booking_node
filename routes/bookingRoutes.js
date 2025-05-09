import express from "express";

import {
  getRoomLists,
  addBooking,
  getBookingHistory,
  cancelBooking,
  searchingRooms,
} from "../controller/bookingHotelManageController.js";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const bookingRoutes = express.Router();
bookingRoutes.get(
  "/rooms-list",
  authenticateToken,
  authorizeRoles("user"),
  getRoomLists
);

bookingRoutes.post(
  "/booking",
  authenticateToken,
  authorizeRoles("user"),
  addBooking
);
bookingRoutes.get(
  "/booking",
  authenticateToken,
  authorizeRoles("user"),
  getBookingHistory
);
bookingRoutes.delete(
  "/booking/:id",
  authenticateToken,
  authorizeRoles("user"),
  cancelBooking
);
bookingRoutes.get(
  "/search",
  authenticateToken,
  authorizeRoles("user"),
  searchingRooms
);

export default bookingRoutes;
