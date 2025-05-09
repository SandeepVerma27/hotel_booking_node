import { error } from "console";
import connection from "../database/connection.js";
import fs from "fs";
import path from "path";
import e from "express";

/*
 Get All Room Lists
@route GET /api/v1/room
@return {Object} JSON response with success status and room data  
*/

export const getAllRooms = async (req, res) => {
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

/*
 Store Room details
@route POST /api/v1/room
@return {Object} JSON response with success status and room data 
*/
export const addRoom = async (req, res) => {
  try {
    const {
      hotel_id,
      room_number,
      room_type,
      price_per_night,
      max_guests,
      is_available,
      is_active,
      is_featured,
      description,
      size,
      amenities,
    } = req.body;

    const room_image = req.file ? req.file.filename : null;

    if (
      !hotel_id ||
      !room_number ||
      !room_type ||
      !price_per_night ||
      !max_guests ||
      !description ||
      !size ||
      !amenities ||
      !room_image
    ) {
      return res
        .status(400)
        .json({ message: "All fields including image are required." });
    }

    const created_at = new Date();

    const checkQuery = `
      SELECT * FROM rooms WHERE hotel_id = ? AND room_number = ?
    `;
    connection.query(
      checkQuery,
      [hotel_id, room_number],
      (checkErr, checkResults) => {
        if (checkErr) {
          console.error("Error checking for duplicate room:", checkErr);
          return res.status(500).json({
            error: checkErr.message,
            message: "Database error",
          });
        }

        if (checkResults.length > 0) {
          return res
            .status(400)
            .json({ message: "Room number already exists in this hotel." });
        }

        const insertQuery = `
        INSERT INTO rooms (
          hotel_id, room_number, room_type, price_per_night, max_guests,
          is_available, is_active, is_featured, description, size, amenities,
          room_image, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const values = [
          hotel_id,
          room_number,
          room_type,
          price_per_night,
          max_guests,
          is_available,
          is_active,
          is_featured,
          description,
          size,
          amenities,
          room_image,
          created_at,
          created_at,
        ];

        connection.query(insertQuery, values, (insertErr, insertResults) => {
          if (insertErr) {
            console.error("Error inserting room:", insertErr);
            return res.status(500).json({
              error: insertErr.message,
              message: "Database error",
            });
          }

          const fetchQuery = `
            SELECT rooms.*, hotels.name AS hotel_name 
            FROM rooms 
            JOIN hotels ON rooms.hotel_id = hotels.id 
            WHERE rooms.id = ?
          `;
          connection.query(
            fetchQuery,
            [insertResults.insertId],
            (fetchErr, fetchResults) => {
              if (fetchErr) {
                console.error("Error fetching newly added room:", fetchErr);
                return res.status(500).json({
                  error: fetchErr.message,
                  message: "Database error",
                });
              }

              return res.status(201).json({
                success: true,
                message: "Room added successfully",
                data: fetchResults[0],
                image_url: `${req.protocol}://${req.get(
                  "host"
                )}/rooms/${room_image}`,
              });
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Error adding room:", error);
    res.status(500).json({
      error: error.message,
      message: "Internal server error",
    });
  }
};

/*
 Get Room by ID
@route GET /api/v1/room/:id
@return {Object} JSON response with success status and room data 
*/

export const getRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    const query = `
      SELECT rooms.*, hotels.name AS hotel_name 
      FROM rooms 
      JOIN hotels ON rooms.hotel_id = hotels.id 
      WHERE rooms.id = ?
    `;
    connection.query(query, [roomId], (error, results) => {
      if (error) {
        console.error("Error fetching data: ", error);
        return res.status(500).json({
          message: "Database error",
          error: error.message,
        });
      }
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Room fetched successfully",
        data: results[0],
      });
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const {
      hotel_id,
      room_number,
      room_type,
      price_per_night,
      max_guests,
      is_available,
      is_active,
      is_featured,
      description,
      size,
      amenities,
    } = req.body;

    const room_image = req.file ? req.file.filename : null;

    if (
      !hotel_id ||
      !room_number ||
      !room_type ||
      !price_per_night ||
      !max_guests ||
      !description ||
      !size ||
      !amenities
    ) {
      return res
        .status(400)
        .json({ message: "All fields except image are required." });
    }

    const updated_at = new Date();

    const query = `
      UPDATE rooms 
      SET 
        hotel_id = ?, 
        room_number = ?, 
        room_type = ?, 
        price_per_night = ?, 
        max_guests = ?, 
        is_available = ?, 
        is_active = ?, 
        is_featured = ?, 
        description = ?, 
        size = ?, 
        amenities = ?, 
        ${room_image ? "room_image = ?, " : ""} 
        updated_at = ? 
      WHERE id = ?
    `;

    const values = [
      hotel_id,
      room_number,
      room_type,
      price_per_night,
      max_guests,
      is_available,
      is_active,
      is_featured,
      description,
      size,
      amenities,
      ...(room_image ? [room_image] : []),
      updated_at,
      roomId,
    ];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error("Error updating data: ", error);
        return res.status(500).json({
          message: "Database error",
          error: error.message,
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      const fetchQuery = `
        SELECT rooms.*, hotels.name AS hotel_name 
        FROM rooms 
        JOIN hotels ON rooms.hotel_id = hotels.id
      `;
      connection.query(fetchQuery, (fetchError, fetchResults) => {
        if (fetchError) {
          console.error("Error fetching updated data: ", fetchError);
          return res.status(500).json({
            message: "Database error",
            error: fetchError.message,
          });
        }

        res.status(200).json({
          success: true,
          message: "Room updated successfully",
          data: fetchResults[0],
          ...(room_image && {
            image_url: `${req.protocol}://${req.get(
              "host"
            )}/rooms/${room_image}`,
          }),
        });
      });
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    const fetchQuery = "SELECT room_image FROM rooms WHERE id = ?";
    connection.query(fetchQuery, [roomId], (fetchError, fetchResults) => {
      if (fetchError) {
        console.error("Error fetching room data: ", fetchError);
        return res.status(500).json({
          message: "Database error",
          error: fetchError.message,
        });
      }
      if (fetchResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      const roomImage = fetchResults[0].room_image;

      const deleteQuery = "DELETE FROM rooms WHERE id = ?";
      connection.query(deleteQuery, [roomId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error("Error deleting data: ", deleteError);
          return res.status(500).json({
            message: "Database error",
            error: deleteError.message,
          });
        }
        if (deleteResults.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Room not found",
          });
        }

        if (roomImage) {
          const imagePath = path.join("uploads/rooms", roomImage);
          fs.unlink(imagePath, (unlinkError) => {
            if (unlinkError) {
              console.error("Error deleting image file: ", unlinkError);
            }
          });
        }

        res.status(200).json({
          success: true,
          message: "Room deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
