import e from "express";
import connection from "../database/connection.js";

/* Get All Room Lists
@route GET /api/v1/rooms-list
@return {Object} JSON response with success status and room data
*/

export const getRoomLists = async (req, res) => {
  try {
    const query = "SELECT * FROM rooms";
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching rooms:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve rooms. Please try again later.",
          error: error.message,
        });
      }
      res.status(200).json({
        success: true,
        message: "Rooms retrieved successfully.",
        data: results,
      });
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* Store Booking details
@route POST /api/v1/booking
@return {Object} JSON response with success status and booking data
*/
export const addBooking = async (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date, status = 1 } = req.body;

    const user_id = req.user.id;

    if (!room_id || !user_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const overlapQuery = `
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND (
        (? BETWEEN check_in_date AND check_out_date) OR
        (? BETWEEN check_in_date AND check_out_date) OR
        (check_in_date BETWEEN ? AND ?) OR
        (check_out_date BETWEEN ? AND ?)
      )
    `;
    const overlapValues = [
      room_id,
      check_in_date,
      check_in_date,
      check_out_date,
      check_out_date,
      check_in_date,
      check_out_date,
    ];

    connection.query(
      overlapQuery,
      overlapValues,
      (overlapError, overlapResults) => {
        if (overlapError) {
          console.error(
            "Error checking for overlapping bookings:",
            overlapError
          );
          return res.status(500).json({
            message: "Database error",
            error: overlapError.message,
          });
        }

        if (overlapResults.length > 0) {
          return res.status(409).json({
            message: "Room is already booked for the selected dates",
          });
        }

        const created_at = new Date();

        const query = `
        INSERT INTO bookings (
          room_id, user_id, check_in_date, check_out_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
        const values = [
          room_id,
          user_id,
          check_in_date,
          check_out_date,
          status,
          created_at,
          created_at,
        ];

        connection.query(query, values, (error, results) => {
          if (error) {
            console.error("Error inserting data:", error);
            return res.status(500).json({
              message: "Database error",
              error: error.message,
            });
          }

          const bookingId = results.insertId;

          const detailQuery = `
          SELECT 
            b.*, 
            r.room_number AS room_name, 
            r.price_per_night AS room_price, 
            h.name AS hotel_name, 
            h.location AS hotel_location
          FROM bookings AS b
          JOIN rooms r ON b.room_id = r.id
          JOIN hotels h ON r.hotel_id = h.id
          WHERE b.id = ?
        `;

          connection.query(
            detailQuery,
            [bookingId],
            (detailError, detailResults) => {
              if (detailError) {
                console.error("Error fetching booking details:", detailError);
                return res.status(500).json({
                  message: "Database error",
                  error: detailError.message,
                });
              }

              if (detailResults.length === 0) {
                return res.status(404).json({ message: "Booking not found" });
              }

              res.status(201).json({
                status: true,
                message: "Booking created successfully",
                bookingDetails: detailResults[0],
              });
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* Get Booking History
@route GET /api/v1/booking
@return {Object} JSON response with success status and booking history
*/

export const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        b.*, 
        r.room_number AS room_name, 
        r.price_per_night AS room_price,
        h.name AS hotel_name, 
        h.location AS hotel_location
      FROM bookings b 
      JOIN rooms r ON b.room_id = r.id 
      JOIN hotels h ON r.hotel_id = h.id 
      WHERE b.user_id = ?
      ORDER BY b.check_in_date DESC
    `;

    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error("Error fetching booking history: ", error);
        return res.status(500).json({
          status: false,
          message: "Database error",
          error: error.message,
        });
      }
      res.status(200).json({
        status: true,
        message: "Booking history fetched successfully",
        bookings: results,
      });
    });
  } catch (error) {
    console.error("Error in getBookingHistory:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* Cancel Booking
@route DELETE /api/v1/booking/:id
@return {Object} JSON response with success status and cancellation message
*/
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const query = "DELETE FROM bookings WHERE id = ?";
    connection.query(query, [bookingId], (error, results) => {
      if (error) {
        console.error("Error deleting data: ", error);
        return res.status(500).json({
          status: false,
          message: "Database error",
          error: error.message,
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({
          status: false,
          message: "Booking not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Booking cancelled successfully",
      });
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* Search Rooms
@route GET /api/v1/search
@return {Object} JSON response with success status and room data
*/

export const searchingRooms = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, checkInDate, checkOutDate } =
      req.query;

    let conditions = [];
    let values = [];

    if (location) {
      conditions.push("h.location = ?");
      values.push(location);
    }

    if (minPrice) {
      conditions.push("r.price_per_night >= ?");
      values.push(minPrice);
    }

    if (maxPrice) {
      conditions.push("r.price_per_night <= ?");
      values.push(maxPrice);
    }

    if (checkInDate && checkOutDate) {
      conditions.push(`
        r.id NOT IN (
          SELECT b.room_id FROM bookings b
          WHERE (
            (? BETWEEN b.check_in_date AND b.check_out_date)
            OR (? BETWEEN b.check_in_date AND b.check_out_date)
            OR (b.check_in_date BETWEEN ? AND ?)
            OR (b.check_out_date BETWEEN ? AND ?)
          )
        )
      `);
      values.push(
        checkInDate,
        checkOutDate,
        checkInDate,
        checkOutDate,
        checkInDate,
        checkOutDate
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        h.id AS hotel_id,
        h.name AS hotel_name,
        h.location,
        r.id AS room_id,
        r.room_number,
        r.room_type,
        r.price_per_night,
        r.max_guests,
        r.description,
        r.room_image
      FROM hotels h
      JOIN rooms r ON h.id = r.hotel_id
      ${whereClause}
    `;

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error("Error fetching rooms: ", error);
        return res.status(500).json({
          message: "Database error",
          error: error.message,
        });
      }

      res.status(200).json({
        status: true,
        message: "Rooms fetched successfully",
        data: results,
      });
    });
  } catch (error) {
    console.error("Error in searchingRooms:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
