# JWT-Auth API

A secure and easy-to-integrate API providing JSON Web Token (JWT) based authentication for your frontend applications. This API simplifies integration while ensuring robust security practices.

## Features

- **JWT Authentication:** Generate, verify, and refresh tokens for secure user sessions.
- **Easy Integration:** Designed to work seamlessly with any frontend framework.
- **Role-Based Access Control (RBAC):** Limit access to endpoints based on user roles.
- **Token Blacklisting:** Manage token revocation for added security.
- **Extensible Endpoints:** Customize and extend the API functionality as needed.
- **Comprehensive Logging:** Monitor API usage and security events.
- **Scalable Architecture:** Built to handle high traffic and concurrent users.

## Prerequisites

- Node.js (version 23.6.0 or higher)
- Express.js
- A database (e.g., MongoDB) for storing user data and token blacklists

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/jwt-auth.git
   cd jwt-auth
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret
   API_BASE_URL=/api/v1
   MONGO_URI=your_database_connection_string
   ```

4. **Start the Server:**

   ```bash
   npm start
   ```

## Usage

### 1. User Registration

Endpoint to register a new user.

- **URL:** `/api/v1/sign-up`
- **Method:** `POST`
- **Body:**

  ```json
  {
    "username": "exampleUser",
    "password": "examplePass"
  }
  ```

- **Response:**

  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "user_id",
      "username": "exampleUser"
    }
  }
  ```

### 2. User Login

Endpoint to authenticate a user and generate a JWT.

- **URL:** `/api/v1/sign-in`
- **Method:** `POST`
- **Body:**

  ```json
  {
    "username": "exampleUser",
    "password": "examplePass"
  }
  ```

- **Response:**

  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here"
  }
  ```

### 3. Token Verification

Secure endpoints using middleware to verify JWT tokens.

- **Usage in Express Middleware:**

  ```javascript
  const jwt = require("jsonwebtoken");

  function verifyToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid Token" });
    }
  }

  // Use the middleware for secured routes
  app.get("/api/protected", verifyToken, (req, res) => {
    res.json({ message: "This is a secured endpoint" });
  });
  ```

### 4. Token Refresh and Logout

- **Refresh Endpoint:** Issue a new token before expiration.
- **Logout Endpoint:** Revoke tokens by adding the token to a blacklist.

## Integrating with Frontend

- **Setup:** Include the JWT token received upon login with every request to protected endpoints.
- **Example:**

  ```javascript
  // Example using fetch API
  fetch("/api/protected", {
    headers: {
      Authorization: `Bearer ${yourJWTToken}`,
    },
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
  ```

- **Tips:**
  - Store the token securely (e.g., in httpOnly cookies or secure storage).
  - Handle token renewal transparently in your frontend for uninterrupted user experience.

### Role-Based Access Control (RBAC)

Define roles in your user model and protect routes by checking user roles.

```javascript
function permit(...allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user;
    if (allowedRoles.includes(role)) {
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  };
}

// Usage Example:
app.get("/api/admin", verifyToken, permit("admin"), (req, res) => {
  res.json({ message: "Welcome, admin" });
});
```

### Token Blacklisting

Implement a token blacklist store (in-memory, Redis, or your database) to invalidate tokens upon logout or security events.

## Contribution Guidelines

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License.

## Contact

For issues and feature requests, please open an issue on the [jwt-auth Repo](https://github.com/durjoydutta/jwt-auth).
