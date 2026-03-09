# HR FormKit API Specification

This document provides a detailed overview of the HR FormKit REST API.

**Base URL:** `https://hr-form-backend.pages.dev/api`  
**Local Development:** `http://localhost:8787/api`

---

## 1. Authentication

The API uses JWT-based stateless authentication. Token must be sent in the `Authorization` header as a Bearer token.

### Login
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  { "email": "admin@hrformkit.com", "password": "Admin@1234" }
  ```
- **Response:**
  ```json
  { "success": true, "data": { "accessToken": "...", "refreshToken": "...", "user": { ... } } }
  ```

### Refresh Token
- **Endpoint:** `POST /auth/refresh`
- **Request Body:**
  ```json
  { "refreshToken": "..." }
  ```

### Logout
- **Endpoint:** `DELETE /auth/logout`

---

## 2. Forms (Authenticated)

All form endpoints require a valid JWT `Authorization` header.

### Get All Forms
- **Endpoint:** `GET /forms`
- **Query Params:** `page` (default: 1), `pageSize` (default: 20), `active` (true/false)

### Create Form
- **Endpoint:** `POST /forms`
- **Request Body:**
  ```json
  { "title": "Job Application", "description": "...", "blocks": [], "logoUrl": "..." }
  ```

### Update Form
- **Endpoint:** `PUT /forms/:id` or `PATCH /forms/:id`
- **Request Body:** Partial or full form object.

### Delete Form
- **Endpoint:** `DELETE /forms/:id`

### Generate Share Link
- **Endpoint:** `POST /forms/:id/share`
- **Request Body:**
  ```json
  { "expiresIn": 2592000 } // Expiration in seconds
  ```
- **Response:**
  ```json
  { "success": true, "data": { "token": "...", "shareUrl": "/f/..." } }
  ```

---

## 3. Responses (Authenticated)

Manage form submissions received from applicants.

### Get All Responses
- **Endpoint:** `GET /responses`
- **Query Params:** `page`, `pageSize`, `status`, `formId`, `starred`

### Update Response Status
- **Endpoint:** `PATCH /responses/:id`
- **Request Body:**
  ```json
  { "status": "approved", "starred": true }
  ```

### Delete Response
- **Endpoint:** `DELETE /responses/:id`

---

## 4. Public API (Rate Limited)

These endpoints do **not** require authentication and are used by the public form page.

### Fetch Public Form
- **Endpoint:** `GET /public/forms/:token`
- **Response:**
  ```json
  { "success": true, "data": { "form": { ... }, "token": "...", "expiresAt": 1741564800000 } }
  ```

### Submit Public Form
- **Endpoint:** `POST /public/forms/:token/submit`
- **Request Body:**
  ```json
  {
    "applicant": { "name": "...", "email": "...", "phone": "..." },
    "data": { "field_id_1": "answer", ... }
  }
  ```

### Upload File
- **Endpoint:** `POST /public/upload`
- **Request Format:** `multipart/form-data`
- **Request Body:** `file` (Binary), `responseId` (String)
- **Response:**
  ```json
  { "success": true, "data": { "uploadId": "...", "key": "..." } }
  ```

---

## 5. Errors

The API returns consistent error responses.

| HTTP Status | Meaning |
|---|---|
| 400 | Bad Request (Validation failed) |
| 401 | Unauthorized (Missing/invalid token) |
| 403 | Forbidden (Insufficient permissions) |
| 404 | Not Found |
| 410 | Gone (Expired form link) |
| 429 | Too Many Requests (Rate limit exceeded) |
| 500 | Internal Server Error |

**Error Format:**
```json
{
  "success": false,
  "error": "Detailed error message here"
}
```

---

*Last Updated: March 10, 2026*
