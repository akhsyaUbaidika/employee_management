# Employee Management REST API

## Overview
This project is a **REST API** for managing employees, built using **Node.js**, **Express.js**, **MySQL**, and **JWT Authentication**. The API allows for CRUD operations on employee data and includes user authentication with token-based security.

---

## Features
- User authentication with JWT (JSON Web Tokens).
- Secure endpoints requiring authentication.
- CRUD operations for managing employees.
- Error handling and validation.
- Integration with MySQL database.

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v12 or later)
- [MySQL](https://www.mysql.com/)
- [XAMPP](https://www.apachefriends.org/) (optional, for easy MySQL setup)
- [Postman](https://www.postman.com/) (for testing API endpoints)

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/akhsyaUbaidika/employee_management.git
cd employee_management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the environment
Create a `.env` file in the root directory with the following content:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase
JWT_SECRET=yourlongsecretkey
PORT=3000
```
- Replace `yourpassword` and `yourdatabase` with your MySQL credentials and database name.
- Replace `yourlongsecretkey` with a secure, random string.

### 4. Import the database
1. Open your MySQL client (e.g., phpMyAdmin or MySQL CLI).
2. Create a new database:
   ```sql
   CREATE DATABASE yourdatabase;
   ```
3. Import the SQL file:
   ```bash
   mysql -u root -p yourdatabase < database.sql
   ```

### 5. Start the server
```bash
node server.js
```

---

## API Endpoints

### **Authentication**

#### Register User
**POST** `/register`
```json
{
  "username": "testuser",
  "password": "password123"
}
```

#### Login User
**POST** `/login`
```json
{
  "username": "testuser",
  "password": "password123"
}
```
Response:
```json
{
  "auth": true,
  "token": "your_jwt_token"
}
```

### **Protected Endpoints (Require JWT Token)**
- Add the token in the `Authorization` header for all requests:
  ```
  Authorization: Bearer your_jwt_token
  ```

#### Get All Employees
**GET** `/employees`

#### Get Employee by ID
**GET** `/employees/:id`

#### Add New Employee
**POST** `/employees`
```json
{
  "name": "John Doe",
  "position": "Manager",
  "department": "HR",
  "salary": 5000
}
```

#### Update Employee
**PUT** `/employees/:id`
```json
{
  "name": "John Doe",
  "position": "Senior Manager",
  "department": "HR",
  "salary": 6000
}
```

#### Delete Employee
**DELETE** `/employees/:id`

---

## Project Structure
```
employee_management/
├── database.sql        # MySQL database schema
├── server.js          # Main server file
├── .env               # Environment variables
├── package.json      # Dependencies and scripts
└── README.md         # Project documentation
```

---

## Usage
1. Start the server: `node server.js`
2. Use Postman or any API client to test the endpoints.
3. Authenticate with `/login` and use the token for protected routes.

---

## Contributing
Feel free to fork this project and submit pull requests for any improvements or additional features.

