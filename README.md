# 🏨 Hotel Booking API

A fully functional **Node.js Express REST API** for a hotel booking system with **JWT authentication**, **role-based access (admin/user)**, **MySQL database**, and **Multer file uploads**. Built for learning backend structure and authentication from scratch.

---

## 🚀 Features

- User/Admin Authentication with JWT
- Role-based protected routes
- Admin can manage hotels and rooms
- Users can book rooms and see booking history
- File upload support with Multer (hotel & room images)
- RESTful APIs using Express
- Data validation with Express Validator
- Modular code (routes/controllers/middleware)
- Full documentation for setup and API usage

---

## 🧾 .env Setup

Create a `.env` file in the root folder with the following:

```env
PORT=8080
JWT_SECRET=9b2fa4d4d$13a!@W3rANDOM_LONG_KEY@#12
```

---

## 📂 Project Folder Structure

```
.
├── controllers/
├── routes/
├── database/
├── middleware/
├── uploads/
├── server.js
├── package.json
└── .env
```

---

## 📦 Installation & Run

```bash
npm install
npm start         # Or
nodemon server.js
```

---

## 🔐 Authentication API

### 📮 Register

**POST** `/api/auth/register`

**Body**

```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "password",
  "role": "admin"
}
```

### 🔐 Login

**POST** `/api/auth/login`

**Body**

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response**

```json
{
  "token": "JWT_TOKEN"
}
```

Use this token in headers:  
`Authorization: Bearer <token>`

### 🔓 Logout

**GET** `/api/auth/logout`

---

## 🏨 Hotel Routes (Admin Only)

### ➕ Add Hotel

**POST** `/api/hotel`

**Form-Data**

- `hotel_image`: File (image)
- `name`: String
- `location`: String
- `description`: String
- `contact_number`: String
- `email`: String
- `is_active`: Boolean
- `is_featured`: Boolean

> 🔒 Requires: `Authorization: Bearer <admin_token>`

### 📄 List Hotels

**GET** `/api/hotels`

### 📃 Get Hotel by ID

**GET** `/api/hotel/:id`

### 📝 Update Hotel

**PUT** `/api/hotel/:id`

Same body as add.

### ❌ Delete Hotel

**DELETE** `/api/hotel/:id`

---

## 🚪 Room Routes (Admin Only)

### ➕ Add Room

**POST** `/api/room`

**Form-Data**

- `room_image`: File (image)
- `hotel_id`: Number
- `name`: String
- `type`: String
- `price`: Number
- `capacity`: Number
- `is_available`: Boolean

### 📄 List Rooms

**GET** `/api/rooms`

### 📃 Get Room by ID

**GET** `/api/room/:id`

### 📝 Update Room

**PUT** `/api/room/:id`

### ❌ Delete Room

**DELETE** `/api/room/:id`

---

## 📅 Booking Routes (User Only)

### 🏨 View Room List

**GET** `/api/rooms-list`

> Show available rooms to users.

### 🛏 Book a Room

**POST** `/api/booking`

**Body**

```json
{
  "hotel_id": 1,
  "room_id": 1,
  "check_in_date": "2025-05-10",
  "check_out_date": "2025-05-12"
}
```

### 📜 Booking History

**GET** `/api/booking`

> Returns list of user's bookings.

### ❌ Cancel Booking

**DELETE** `/api/booking/:id`

### 🔎 Search Available Rooms

**GET** `/api/search?location=Delhi&minPrice=1000&maxPrice=5000&checkInDate=2025-05-10&checkOutDate=2025-05-15`

---

## 🛡️ Middleware

### ✅ `authenticateToken`

Verifies the JWT token from header.

### ✅ `authorizeRoles(...roles)`

Example:

```js
authorizeRoles("admin");
```

Used to protect routes per user role.

---

## 📁 File Uploads

- Hotels → `/uploads/hotel-image`
- Rooms → `/uploads/rooms-images`

Returned as full URL in response.

---

## 📬 Postman Testing

1. Register/Login to get token
2. Use Bearer token in `Authorization` header
3. Test `admin` APIs by logging in with admin
4. Test `user` APIs by logging in with user
5. Use correct content type for:
   - JSON body → `application/json`
   - Image upload → `multipart/form-data`

---

## 📌 Future Improvements

- Add pagination for listings
- Email notifications on booking
- Password hashing with bcrypt
- Add Swagger API Docs
- Add refresh token system

---

## 🧑‍💻 Author

Made by a beginner in Node.js to showcase:

- JWT authentication
- Modular structure
- Real-world REST API skills

---

## ✅ Final Notes

This project is excellent to demonstrate:

- Backend API development
- Secure role-based systems
- Real project structure and setup
