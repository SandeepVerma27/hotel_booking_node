import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connection from "../database/connection.js";
import dotenv from "dotenv";


dotenv.config();

export const register = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const created_at = Date.now();

  const query =
    "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [name, email, hashedPassword, role, created_at, created_at];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error registering user:", err);
      return res.status(500).json({
        message: "Database error.",
        error: err.message,
      });
    }

    const userId = results.insertId;

    const fetchUserQuery =
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
    connection.query(fetchUserQuery, [userId], (fetchErr, userResults) => {
      if (fetchErr) {
        console.error("Error fetching user details:", fetchErr);
        return res.status(500).json({
          message: "Database error while fetching user details.",
          error: fetchErr.message,
        });
      }

      const user = userResults[0];
      res.status(201).json({
        message: "User registered successfully.",
        user,
      });
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      Token: token,
    });
  });
};

export const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token is required for logout." });
  }
  const invalidatedTokens = new Set();

  invalidatedTokens.add(token);

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
