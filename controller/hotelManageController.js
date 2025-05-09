import e from "express";
import connection from "../database/connection.js";
import fs from "fs";
import path from "path";

/* Get ALl Hotel Lists
@route GET /api/v1/hotel
@return {Object} JSON response with success status and hotel data

*/
export const getAllHotels = async (req, res) => {
  try {
    const query = "SELECT * FROM hotels";
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching data: ", error);
        return res.status(500).json({
          message: "Database error",
          error: error.message,
        });
      }
      res.status(200).json({
        suceess: true,
        message: "Hotels fetched successfully",
        data: results,
      });
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* Store Hotel details
@route POST /api/v1/hotel
@return {Object} JSON response with success status and hotel data
 */
export const storeHotel = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      is_active,
      is_featured,
      contact_number,
      email,
    } = req.body;

    const hotel_image = req.file ? req.file.filename : null;
    const created_by = req.user?.id;

    if (
      !name ||
      !location ||
      !description ||
      !created_by ||
      !contact_number ||
      !email ||
      !is_active ||
      !is_featured ||
      !hotel_image
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required including the image." });
    }

    const checkQuery = "SELECT * FROM hotels WHERE name = ? OR email = ?";
    connection.query(checkQuery, [name, email], (checkError, checkResults) => {
      if (checkError) {
        console.error("Error checking existing hotel:", checkError);
        return res.status(500).json({
          message: "Database error",
          error: checkError.message,
        });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({
          message: "A hotel with the same name or email already exists.",
        });
      }

      const created_at = new Date();
      const query = `
        INSERT INTO hotels 
        (name, location, description, created_by, hotel_image, is_active, is_featured, contact_number, email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        name,
        location,
        description,
        created_by,
        hotel_image,
        is_active,
        is_featured,
        contact_number,
        email,
        created_at,
        created_at,
      ];

      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error inserting hotel:", error);
          return res.status(500).json({
            message: "Database error",
            error: error.message,
          });
        }

        const insertedHotelId = results.insertId;

        const fetchQuery = "SELECT * FROM hotels WHERE id = ?";
        connection.query(
          fetchQuery,
          [insertedHotelId],
          (fetchError, fetchResults) => {
            if (fetchError) {
              console.error("Error fetching newly added hotel:", fetchError);
              return res.status(500).json({
                message: "Database error",
                error: fetchError.message,
              });
            }

            return res.status(201).json({
              message: "Hotel added successfully",
              hotel: fetchResults[0],
              image_url: `${req.protocol}://${req.get(
                "host"
              )}/hotel-image/${hotel_image}`,
            });
          }
        );
      });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      message: "Something went wrong on the server.",
      error: err.message,
    });
  }
};

/* Get Hotel by ID
@route GET /api/v1/hotel/:id
@return {Object} JSON response with success status and hotel data 
  */
export const getHotels = async (req, res) => {
  try {
    const hotelId = req.params.id;

    const query = "SELECT * FROM hotels WHERE id = ?";
    connection.query(query, [hotelId], (error, results) => {
      if (error) {
        console.error("Error fetching data: ", error);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Hotel not found" });
      }
      res.status(200).json({
        success: true,
        message: "Hotel fetched successfully",
        data: results[0],
      });
    });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/*
Update Hotel details
@route PUT /api/v1/hotel/:id
@return {Object} JSON response with success status and updated hotel data
 */
export const updateHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;

    const {
      name,
      location,
      description,
      is_active,
      is_featured,
      contact_number,
      email,
    } = req.body;

    const hotel_image = req.file ? req.file.filename : null;
    const created_by = req.user?.id;

    if (
      !name ||
      !location ||
      !description ||
      !created_by ||
      !contact_number ||
      !email ||
      !is_active ||
      !is_featured
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required except the image." });
    }

    let query = `UPDATE hotels SET name = ?, location = ?, description = ?, created_by = ?, is_active = ?, is_featured = ?, contact_number = ?, email = ?`;
    
    const values = [
      name,
      location,
      description,
      created_by,
      is_active,
      is_featured,
      contact_number,
      email,
    ];

    if (hotel_image) {
      query += `, hotel_image = ?`;
      values.push(hotel_image);
    }

    query += ` WHERE id = ?`;
    values.push(hotelId);

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error("Error updating data: ", error);
        return res
          .status(500)
          .json({ message: "Database error", error: error.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      const fetchQuery = "SELECT * FROM hotels WHERE id = ?";
      connection.query(fetchQuery, [hotelId], (fetchError, fetchResults) => {
        if (fetchError) {
          console.error("Error fetching updated hotel data:", fetchError);
          return res.status(500).json({
            message: "Database error",
            error: fetchError.message,
          });
        }

        res.status(200).json({
          success: true,
          message: "Hotel updated successfully",
          data: fetchResults[0],
          ...(hotel_image && {
            image_url: `${req.protocol}://${req.get(
              "host"
            )}/hotel-image/${hotel_image}`,
          }),
        });
      });
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/* Delete Hotel by ID
@route DELETE /api/v1/hotel/:id
@return {Object} JSON response with success status and message
 */
export const deleteHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;

    const fetchQuery = "SELECT hotel_image FROM hotels WHERE id = ?";
    connection.query(fetchQuery, [hotelId], (fetchError, fetchResults) => {
      if (fetchError) {
        console.error("Error fetching hotel data: ", fetchError);
        return res.status(500).json({
          message: "Database error",
          error: fetchError.message,
        });
      }
      if (fetchResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      const hotelImage = fetchResults[0].hotel_image;

      const deleteQuery = "DELETE FROM hotels WHERE id = ?";
      connection.query(deleteQuery, [hotelId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error("Error deleting data: ", deleteError);
          return res.status(500).json({
            message: "Database error",
            error: deleteError.message,
          });
        }
        if (deleteResults.affectedRows === 0) {
          return res.status(404).json({ message: "Hotel not found" });
        }

        
        if (hotelImage) {
          const imagePath = path.join("public/hotel-image/", hotelImage);
          fs.unlink(imagePath, (unlinkError) => {
            if (unlinkError) {
              console.error("Error deleting image file: ", unlinkError);
            }
          });
        }

        res.status(200).json({
          success: true,
          message: "Hotel deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
