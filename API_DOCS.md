# Endpoints

---

## `POST /api/auth/signup`

**Description**: Send an email verification code for account registration.

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `full_name` | string | ✅ | User’s full name |
| `email` | string | ✅ | User’s email address |
| `password` | string | ✅ | User's password |
| `user_type` | string | ✅ | User type |

### ✅ **Success Response**

**Status**: `200 OK`

> Verification code expires at `expires_at`
> 

> Repeat the request after `resend_at` to resend a code again.
> 

```json
{
  "ok": true,
  "message": "A verification code has been sent to your email address.",
  "data": {
    "expires_at": 1744314993328,
    "resend_at": 1744314982328
  }
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied.",
  "error": {
    "full_name": "…",
    "email": "Invalid email address."
  }
}
```

**Status**: `400 Bad Request`

Which one is better for the client side **`message`** or **`error.email`**?

```json
{
  "ok": false,
  "error_code": "EMAIL_EXISTS",
  "message": "Email address already exists.",
  "error": {
    "email": "Email address already exists."
  }
}
```

**Status**: `400 Bad Request`

> Repeating the request before `resend_at` results in the following error message.
> 

> There may be other error messages with similar response structure too.
> 

```json
{
  "ok": false,
  "message": "Verification code already sent."
}
```

---

## `POST /api/auth/signup-verify`

**Description**: Verify and complete account registration.

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | ✅ | User’s email address |
| `user_type` | string | ✅ | User type |
| `otp_code` | string (6 digit number) | ✅ | OTP code |

### ✅ **Success Response**

**Status**: `201 Created`

```json
{
  "ok": true
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied.",
  "error": {
    "otp_code": "…"
  }
}
```

**Status**: `404 Not Found`

```json
{
  "ok": false,
  "message": "Verification doesn't exist, it is either expired or completed."
}
```

**Status**: `400 Bad Request`

Which one is better for the client side **`message`** or **`error.otp_code`**?

```json
{
  "ok": false,
  "message": "Incorrect otp code."
  "error": {
    "otp_code": "Incorrect otp code."
  }
}
```

**Status**: `429 Too Many Requests`

```json
{
  "ok": false,
  "message": "Too many trials."
}
```

---

## `POST /api/auth/login`

**Description**: Login.

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | ✅ | User’s email |
| `user_type` | string | ✅ | User type |
| `password` | string | ✅ | User’s password |
| `remember_me` | boolean | ❌ | Optional, default is `false`, includes `refresh_token` if true |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "access_token": "…",
    "refresh_token": "…",
    "type": "Bearer",
    "expires_at": 1744356634815,
    "user_type": "customer"
  }
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

> Input field validation errors.
> 

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied."
  "error": {
    "email": "Email is required.",
    "password": "Password is required."
  }
}
```

**Status**: `400 Bad Request`

> Set of possible error messages with similar response structure.
> 

```json
{
  "ok": false,
  "message": "…"
}
```

**Status**: `403 Access Denied`

```json
{
  "ok": false,
  "error_code": "INVALID_CREDENTIALS",
  "message": "Incorrect email or password."
}
```

---

## `POST /api/auth/refresh-token`

**Description**: Allows the user to exchange a valid refresh token for a new access token.

### 🔒 Header

`Authorization: <type> <refresh_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "access_token": "…",
    "type": "Bearer",
    "expires_at": 1744356634815,
    "user_type": "customer"
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

> Time to login again.
> 

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `DELETE /api/auth/logout`

**Description**: Delete or revoke current user session including the access and refresh token.

### 🔒 Header

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `POST /api/auth/forgot-password`

**Description**: Send password reset link and otp code to user’s email address.

Link format `https://medlink.com/reset-password/{PASS_RESET_TOKEN}`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | ✅ | User’s email |
| `user_type` | string | ✅ | User type |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "message": "A password reset link has been sent to your email address.",
  "data": {
    "expires_at": 1744356634815,
    "resent_at": 1744356635732
  }
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

> Input field validation errors.
> 

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied."
  "error": {
    "email": "Email is required."
  }
}
```

**Status**: `404 Not Found`

```json
{
  "ok": false,
  "message": "Account doesn't exist.",
  "error": {
    "email": "Account doesn't exist."
  }
}
```

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "message": "A password reset link already sent to your email, resend after a few moments or check your inbox."
}
```

---

## `POST /api/auth/verify-password-reset`

**Description**: Verify and get a password reset token.

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | ✅ | User’s email |
| `user_type` | string | ✅ | User type |
| `token` | string | ❌ | `PASS_RESET_TOKEN` extracted from the password reset link |
| `otp_code` | string (6 digit number) | Required If `token` is not specified | OTP code |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "token": "c05b4d08688e6f85cfa184c2096772b6dc64e7ef1f20a1a33509aa5f2d472cab",
    "expires_at": 1747806775644
  }
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "message": "Invalid or expired OTP code."
}
```

---

## `POST /api/auth/reset-password`

**Description**: Set a new password.

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | ✅ | User’s email |
| `user_type` | string | ✅ | User type |
| `password` | string | ✅ | New password |
| `token` | string | ✅ | `token` from [`/verify-password-reset`](https://www.notion.so/Endpoints-1ce4d5150e9f809da020ec6f7f875c55?pvs=21) response body |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "message": "Your password reset session has expired. Please try again."
}
```

---

## `GET /api/user/profile`

**Description**: Retrieves the user's profile information (retrieve basic registration information).

### 🔒 Header

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "6592008029c8c3e4dc76256c",
    "full_name": "John Doe",
    "email": "user@example.com",
    "user_type": "customer",
    "created_at": "2025-04-11T07:47:54.076Z",
    "updated_at": "2025-04-11T07:47:54.076Z"
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

**Status**: `401 Unauthorized`

> This doesn’t actually happen because tokens are stored in the cache.
> 

```json
{
  "ok": false,
  "error_code": "TOKEN_EXPIRED",
  "message": "The provided token has expired."
}
```

---

## `POST /api/user/customer/profile`

**Description**: Create or update customer profile.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string (2519…) | ✅ | User's primary phone number |
| `gender` | string (M or F) | ✅ | User's gender |
| `alternate_phone_number` | string | ❌ | An alternate phone number |
| `date_of_birth` | date | ❌ | User's date of birth (≥ 13 years old) |
| `delivery_address` | object | ✅ | User's delivery address |
| └── `street` | string | ✅ | Street name (2–100 characters) |
| └── `city` | string | ✅ | Valid city name (letters, spaces, -') |
| └── `state` | string | ✅ | Valid state name (letters, spaces, -') |
| └── `zip_code` | string | ✅ | ZIP code (4–10 digits) |
| `emergency_contact` | object | ❌ | Emergency contact information |
| └── `name` | string | ❌ | Emergency contact name (2–100 characters) |
| └── `phone` | string | ❌ | Emergency contact phone number |
| `health_details` | array of [`HealthCondition`](https://www.notion.so/Endpoints-1ce4d5150e9f809da020ec6f7f875c55?pvs=21) | ❌ | User’s health-related conditions ([see valid values](https://www.notion.so/Endpoints-1ce4d5150e9f809da020ec6f7f875c55?pvs=21)) |
| `image` | string (base64) | ❌ | Base64 string in Data URL format (`data:image/jpeg;base64,BASE64_ENCODED_DATA`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied.",
  "error": {
    "phone_number": "Phone number is required",
    "delivery_address.zip_code": "ZIP code is required",
    "health_details[0]": "health_details[0] must be one of the following values: diabetes, hypertension, pregnancy",
    "health_details[1]": "This health condition is not valid for your gender"
  }
}
```

**Status**: `401 Unauthorized`

> Invalid access token or user other than `customer` is trying to access the endpoint.
> 

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `GET /api/user/customer/profile`

**Description**: Get customer profile.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "6805f03b68e44aaf1597ed62",
    "full_name": "John Doe",
    "email": "johndoe@example.com",
    "user_type": "customer",
    "created_at": "2025-04-21T07:14:03.819Z",
    "updated_at": "2025-04-21T07:18:02.090Z",
    "has_complete_profile": true,
    "profile": {
      "created_at": "2025-04-21T12:47:16.965Z",
      "updated_at": "2025-04-21T12:47:16.965Z",
      "delivery_address": {
        "street": "…",
        "city": "Addis Ababa",
        "state": "…",
        "zip_code": "1000"
      },
      "emergency_contact": {},
      "health_details": [],
      "phone_number": "2519123456789",
      "gender": "M",
      "profile_picture": "6805f03b68e44aaf1597ed62.jpeg"
    }
  }
}
```

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "6805f03b68e44aaf1597ed62",
    "full_name": "John Doe",
    "email": "johndoe@example.com",
    "user_type": "customer",
    "created_at": "2025-04-21T07:14:03.819Z",
    "updated_at": "2025-04-21T07:18:02.090Z",
    "has_complete_profile": false,
    "profile": null
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `POST /api/user/pharmacy/profile`

**Description**: Create or update pharmacy profile.

### 🔒 Authorization `pharmacist`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `phone_number` | string (2519…) | ✅ | Pharmacy's phone number |
| `address` | object | ✅ | Pharmacy’s address |
| └── `street` | string | ✅ | Street name (2–100 characters) |
| └── `city` | string | ✅ | Valid city name (letters, spaces, -') |
| └── `state` | string | ✅ | Valid state name (letters, spaces, -') |
| └── `zip_code` | string | ✅ | ZIP code (6 digits) |
| `location` | object | ✅ | Pharmacy’s location coordinate |
| └── `lat` | number | ✅ | Latitude (Range: `-90 to 90`) |
| └── `lng` | number | ✅ | Longitude (Range `-180 to 180`) |
| `license_number` | string | ✅ | Pharmacy license number (uppercase, numbers, hyphens) |
| `open_hours` | array of objects | ✅ | Array of opening hours for each day |
| └── `day` | string | ✅ | Day of the week, must be one of: `'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'` |
| └── `open` | string (HH:mm) | ✅ | Opening time (HH:mm format)
Time must be converted to UTC.
`HH ranges from 00 to 23
 mm ranges from 00 to 59` |
| └── `close` | string (HH:mm) | ✅ | Closing time (HH:mm format)
Time must be converted to UTC.
`HH ranges from 00 to 23
 mm ranges from 00 to 59` |
| `pharmacy_name` | string | ✅ | Pharmacy name (3–100 characters) |
| `description` | string | ❌ | Optional pharmacy description (max 200 characters) |
| `delivery` | boolean | ❌ | Whether the pharmacy provides delivery (Default: `false`) |
| `website` | string (URL) | ❌ | Optional website URL |
| `person_name` | string | ❌ | Name of the person managing the pharmacy (3–100 characters) |
| `image` | string (base64) | ❌ | Base64 string in Data URL format `data:image/jpeg;base64,BASE64_ENCODED_DATA` |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied.",
  "error": {
    "address.city": "City is required",
    "license_number": "License number is required",
    "open_hours[0].open": "Open time is required",
    "open_hours": "Overlap detected: \"08:49 - 08:50\" and \"08:49 - 08:52\" on Tue"
  }
}
```

**Status**: `401 Unauthorized`

> Invalid access token or user other than `pharmacist` is trying to access the endpoint.
> 

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `GET /api/user/pharmacy/profile`

**Description**: Get pharmacy profile.

### 🔒 Authorization `pharmacist`

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "6806909cc7ea0f562eaf1c56",
    "full_name": "John Doe",
    "email": "johndoe@examp.com",
    "user_type": "pharmacist",
    "created_at": "2025-04-21T18:38:20.462Z",
    "updated_at": "2025-04-21T18:38:20.462Z",
    "has_complete_profile": true,
    "profile": {
      "created_at": "2025-04-21T18:46:05.597Z",
      "updated_at": "2025-04-21T18:46:40.362Z",
      "license_number": "PH-A453",
      "open_hours": [
        {
          "day": "Tue",
          "open": "03:00",
          "close": "20:59"
        },
        {
          "day": "Tue",
          "open": "22:00",
          "close": "23:59"
        }
      ],
      "pharmacy_name": "ALPHA Medicine",
      "address": {
        "street": "…",
        "city": "…",
        "state": "…",
        "zip_code": "1243"
      },
      "phone_number": "2519123456",
      "pharmacy_logo": "6806909cc7ea0f562eaf1c56.jpeg"
    }
  }
}
```

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "6806909cc7ea0f562eaf1c56",
    "full_name": "John Doe",
    "email": "johndoe@example.com",
    "user_type": "pharmacist",
    "created_at": "2025-04-21T18:38:20.462Z",
    "updated_at": "2025-04-21T18:38:20.462Z",
    "has_complete_profile": false,
    "profile": null
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `GET /api/user/pharmacy/profile/status`

**Description**: Get pharmacy profile status.

### 🔒 Authorization `pharmacist`

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "has_complete_profile": true,
    "verified": false,
    "rejection": null
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `PUT /api/user/pharmacy/medicine`

**Description**: Add medicine.

### 🔒 Authorization `pharmacist`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | ✅ | **Generic** or **brand** name of the medicine (e.g., “Paracetamol”, “Tylenol”). |
| `description` | string | ❌ | Additional info about the medicine. |
| `dosage` | string | ✅ | Dosage or strength (e.g., “500mg”, “10ml”). |
| `form` | string | ✅ | Form of the medicine. Must be one of: `MedicineForms`. |
| `category` | string | ✅ | Category of the medicine. Must be one of the values in `MedicineCategories`. |
| `quantity` | number | ✅ | Must be a **positive** number. Represents the quantity in stock (e.g., 50). |
| `price` | number | ✅ | Price per unit (must be **greater than 0**). |
| `batch_number` | string | ❌ | For tracking (e.g., “B12345”). |
| `manufactured_date` | date | ✅ | Must be a **past** date. |
| `expiry_date` | date | ✅ | Must be a **future** date (strictly after today). |
| `prescription_required` | boolean | ✅ | Whether a **prescription** is required. |
| `manufacturer` | string | ❌ | Name of the manufacturer (e.g., “Pfizer”). |
| `storage_instructions` | string | ❌ | Any special storage instructions (e.g., “Store below 25°C”). |
| `stock_threshold` | number | ❌ | Used to trigger **low-stock alerts**. Must be ≥ 0. Default is `0`. |
| `image` | string (base64) | ❌ | Base64 string in Data URL format `data:image/jpeg;base64,BASE64_ENCODED_DATA` |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

---

## `PATCH /api/user/pharmacy/medicine`

**Description**: Add medicine.

### 🔒 Authorization `pharmacist`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

[Includes all properties from PUT request body above](https://www.notion.so/Endpoints-1ce4d5150e9f809da020ec6f7f875c55?pvs=21)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | ✅ | Medicine ID |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

---

## `GET /api/user/pharmacy/medicines`

**Description**: Get medicines added by the pharmacist.

### 🔒 Authorization `pharmacist`

`Authorization: <type> <access_token>`

### 📝 **Request Query**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | number | ❌ | Number of medicines to return (Default: `10`, Max: `20`) |
| `page` | number | ❌ | Page number (Default: `1`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "id": "6815136d3d75e66f324efb3d",
      "name": "Paracetamol",
      "dosage": "500mg",
      "form": "tablet",
      "quantity": 10,
      "price": 150,
      "manufactured_date": "2024-12-31T21:00:00.000Z",
      "expiry_date": "2025-12-31T21:00:00.000Z",
      "prescription_required": false,
      "stock_threshold": 0
    }
  ]
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `GET api/user/image/{FILENAME}`

**Description**: Get pharmacy or user profile image.

> The filename can be retrieved from profile endpoints or medicine endpoints. `pharmacy_logo` for pharmacist, `profile_picture` for customer and `image` for medicine. If the user, pharmacy or medicine has no profile picture the property will not be present in the response object or it could be null.
> 

### 🔒 Authorization

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

> Returns raw image file.
> 

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `POST api/user/pharmacy/find`

**Description**: Find pharmacies.

### 🔒 Authorization

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | ❌ | Pharmacy’s name |
| `address` | string | ❌ | Pharmacy’s street, city or state |
| `location` | object | ❌ | Customer’s location coordinates |
| └── `lat` | number | ✅ | Latitude (Range: `-90 to 90`) |
| └── `lng` | number | ✅ | Longitude (Range `-180 to 180`) |
| └── `distance` | number | ❌ | Find pharmacies within the distance from customer’s current location in meters (Default: `5000 meters`) |
| `open_hours` | object | ❌ | Filter pharmacies that are open in the specified day and hour range |
| └── `day` | string | ✅ | Day of the week, must be one of: `'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'` |
| └── `open` | string (HH:mm) | ❌ | Opening time (HH:mm format)
Time must be converted to UTC.
`HH ranges from 00 to 23
 mm ranges from 00 to 59` |
| └── `close` | string (HH:mm) | ❌ | Closing time (HH:mm format)
Time must be converted to UTC.
`HH ranges from 00 to 23
 mm ranges from 00 to 59` |
| `delivery` | boolean | ❌ | Whether to filter pharmacies that provide delivery |
| `rating` | number | ❌ | Find pharmacies having the given rating or more (Range `1 to 5`) |
| `next` | number | ❌ | Use this to load additional results by increasing the number (Default: `0`).
`0`  - get the first page results
`1`  - load the 2nd page results
and soon

When no more data exists, an empty array will be returned (meaning it's the last page). |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "id": "680b5258622b6d2a546aac8d",
      "pharmacy_name": "ALPHA Medicine",
      "pharmacy_logo": "6806909cc7ea0f562eaf1c56.jpeg",
      "isOpen": true,
      "closes": "23:59",
      "delivery": false,
      "rating": null, // unrated
      "reviews": 0,
      "address": {
        "street": "...",
        "city": "Addis Ababa",
        "state": "...",
        "zipCode": "1243"
      },
      "distance": 8602.394650103215 // in meters
    },
    {
      "id": "...",
      "pharmacy_name": "...",
      "pharmacy_logo": "...",
      "isOpen": false,
      "closes": null,
      "delivery": false,
      "rating": 4,
      "reviews": 10,
      "address": {
        "street": "...",
        "city": "Addis Ababa",
        "state": "...",
        "zipCode": "1243"
      },
      "distance": null
    }
  ]
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `POST api/user/pharmacy/medicine/search`

**Description**: Search medicine.

### 🔒 Authorization

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `pharmacy_id` | string | ❌ | Search medicine within a specific pharmacy. |
| `name` | string | ❌ | Medicine name. |
| `category` | string | ❌ | Category of the medicine (e.g., `"antibiotic"`). |
| `form` | string | ❌ | Dosage form (`"tablet"`, `"syrup"`, `"cream"`,`”injection”`). |
| `dosage` | string | ❌ | Strength or dosage of the medicine (e.g., `"500mg"`). |
| `price_range` | object | ❌ | Filter medicines within a specified price range. |
| └── `min` | number (≥ 0) | ❌ | Minimum price. |
| └── `max` | number (≥ min) | ❌ | Maximum price. |
| `availability` | string | ❌ | Stock availability: one of `"in_stock"`, `"low_stock"`, or `"out_of_stock"`. |
| `prescription_required` | boolean | ❌ | Whether the medicine requires a prescription. |
| `manufacturer` | string | ❌ | Manufacturer’s name. |
| `next` | number (integer ≥ 0) | ❌ | Used for paginated results. Default: `0` (first page).`1` → second page, and so on. Returns an **empty array** when no more results are available. |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "id": "6815136d3d75e66f324efb3d",
      "pharmacy_id": "680b5258622b6d2a546aac8d",
      "pharmacy_name": "ALPHA Medicine",
      "name": "Paracetamol",
      "dosage": "100mg",
      "form": "tablet",
      "prescription_required": false,
      "availability": "in_stock",
      "category": "paracetamol",
      "price": 150,
      "quantity": 10,
      "image": "med-6815136d3d75e66f324efb3d.jpeg"
    },
    {
      "id": "681bc0c59632f4fcfc9fa864",
      "pharmacy_id": "680b5258622b6d2a546aac8d",
      "pharmacy_name": "ALPHA Medicine",
      "name": "Paracetamol",
      "dosage": "500mg",
      "form": "tablet",
      "prescription_required": false,
      "availability": "in_stock",
      "category": "paracetamol",
      "price": 150,
      "quantity": 10
    }
  ]
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `POST api/user/pharmacy/medicine/ask-ai`

**Description**: Search medicine with AI.

### 🔒 Authorization

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | ✅ | Description of the symptom or disease. |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "medicines": [
      "Ibuprofen",
      "Acetaminophen",
      "Aspirin",
      "Naproxen"
    ],
    "explanation": "These medicines can help relieve headache pain. Ibuprofen, naproxen, and aspirin are NSAIDs that reduce inflammation. Acetaminophen relieves pain and fever. Always follow dosage instructions and consult with a doctor if your headache is severe or frequent."
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

---

## `GET api/user/pharmacy/detail/{pharmacy_id}`

**Description**: Get pharmacy details.

### 🔒 Authorization

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "680b5258622b6d2a546aac8d",
    "pharmacy_name": "ALPHA Medicine",
    "description": null,
    "pharmacy_logo": "6806909cc7ea0f562eaf1c56.jpeg",
    "isOpen": false,
    "closes": null, // when isOpen=true, HH:mm eg. 23:59
    "open_hours": [
      {
        "day": "Tue",
        "open": "08:49", // UTC 00-23hr
        "close": "08:50"
      },
      {
        "day": "Mon",
        "open": "00:00",
        "close": "13:59"
      },
      {
        "day": "Tue",
        "open": "08:50",
        "close": "08:52"
      }
    ],
    "delivery": false,
    "rating": 4,
    "reviews": 9, 
    "address": {
      "street": "Adwa Street",
      "city": "Addis Ababa",
      "state": "Piaza",
      "zipCode": "1243"
    },
    "website": null,
    "location": { // nullable
      "lat": 8.972896941782244,
      "lng": 38.74208869569524
    },
    "phone_number": "251912345678"
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied.",
  "error": {
    "pharmacy_id": "pharmacy_id is invalid"
  }
}
```

**Status**: `404 Not Found`

```json
{
  "ok": false,
  "message": "Pharmacy not found."
}
```

---

## `GET api/user/pharmacy/medicine/{medicine_id}`

**Description**: Get medicine details.

### 🔒 Authorization

`Authorization: <type> <access_token>`

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "id": "6815136d3d75e66f324efb3d",
    "pharmacy_id": "680b5258622b6d2a546aac8d",
    "pharmacy_name": "ALPHA Medicine",
    "name": "Paracetamol",
    "description": null, // string
    "dosage": "100mg",
    "form": "tablet",
    "quantity": 10,
    "price": 150,
    "category": "paracetamol",
    "batch_number": null, // string
    "manufactured_date": "2024-12-31T21:00:00.000Z",
    "expiry_date": "2025-12-31T21:00:00.000Z",
    "prescription_required": false,
    "availability": "in_stock",
    "storage_instructions": null, // string
    "image": "med-6815136d3d75e66f324efb3d.jpeg"
  }
}
```

### ❌ **Error Responses**

**Status**: `401 Unauthorized`

```json
{
  "ok": false,
  "error_code": "AUTH_REQUIRED",
  "message": "Authorization required."
}
```

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "error_code": "INVALID_INPUT",
  "message": "Invalid user input supplied.",
  "error": {
    "medicine_id": "medicine_id is invalid"
  }
}
```

**Status**: `404 Not Found`

```json
{
  "ok": false,
  "message": "Medicine not found."
}
```

---

## `GET api/user/pharmacy/medicine/categories`

**Description**: Get list of medicine categories.

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "label": "Paracetamol",
      "value": "paracetamol"
    },
    {
      "label": "Ibuprofen",
      "value": "ibuprofen"
    }
    ...
  ]
}
```

---

## `GET api/user/pharmacy/medicine/forms`

**Description**: Get list of medicine forms.

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "label": "Tablet",
      "value": "tablet"
    },
    {
      "label": "Syrup",
      "value": "syrup"
    },
    {
      "label": "Injection",
      "value": "injection"
    },
    {
      "label": "Cream",
      "value": "cream"
    }
  ]
}
```

---

## `GET api/user/customer/health-conditions`

**Description**: Get list of health conditions.

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "label": "Diabetes",
      "value": "diabetes"
    },
    {
      "label": "Hypertension",
      "value": "hypertension"
    },
    {
      "label": "Pregnancy",
      "value": "pregnancy"
    }
  ]
}
```

---

## `GET api/user/customer/health-conditions/gender`

**Description**: Get list of health conditions that apply only to a single gender.

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "label": "Pregnancy", // applies to female only
      "value": "F"
    }
  ]
}
```

---

## `POST /api/user/pharmacy/review/write`

**Description**: Post new or update existing pharmacy review.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `pharmacy_id` | string | ✅ | Pharmacy ID |
| `rate` | number | ✅ | Rating (Range: `1 to 5`) |
| `content` | string | ❌ | Review message (Min Length: `10`, Max Length: `2000`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

---

## `GET /api/user/pharmacy/reviews`

**Description**: Retrieve pharmacy reviews.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Query**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `pharmacy_id` | string | ✅ | Pharmacy ID |
| `count` | number | ❌ | Number of medicines to return (Default: `3`, Max: `10`) |
| `page` | number | ❌ | Page number (Default: `1`) |
| `my` | boolean | ❌ | Fetch only my reviews
(Default: `false`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "id": "68272bb9f27c3c54b78d3d1c",
      "name": "John Doe",
      "content": null,
      "rate": 3,
      "date": "14 minutes ago",
      "my": true
    }
  ]
}
```

---

## `DELETE /api/user/pharmacy/review`

**Description**: Delete a review.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | ✅ | Review ID |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

### ❌ **Error Responses**

**Status**: `400 Bad Request`

```json
{
  "ok": false,
  "message": "Failed to delete the review."
}
```

---

## `POST api/user/pharmacy/medicine/review/write`

**Description**: Write a review/comment for a medicine.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `medicine_id` | string | ✅ | Medicine ID |
| `message` | string | ✅ | Review message (Min Length: `1`, Max Length: `2000`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true
}
```

---

## `GET /api/user/pharmacy/medicine/reviews`

**Description**: Retrieve medicine reviews.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Query**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `medicine_id` | string | ✅ | Medicine ID |
| `count` | number | ❌ | Number of medicines to return (Default: `3`, Max: `10`) |
| `page` | number | ❌ | Page number (Default: `1`) |
| `my` | boolean | ❌ | Fetch only my reviews
(Default: `false`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "id": "68272588e762e6ffa9636af6",
      "name": "John Doe",
      "message": "...",
      "date": "a few seconds ago",
      "my": true
    },
    {
      "id": "6827158a60c7a5e84d725c6f",
      "name": "John Doe",
      "message": "...",
      "date": "an hour ago",
      "my": true
    }
  ]
}
```

---

## `DELETE api/user/pharmacy/medicine/reviews`

**Description**: Delete medicine reviews.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Body**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `ids` | array of string | ✅ | Review IDs |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": {
    "deleted": 2
  }
}
```

---

## `GET api/user/customer/recommendations`

**Description**: Get medicine recommendations.

### 🔒 Authorization `customer`

`Authorization: <type> <access_token>`

### 📝 **Request Query**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `count` | number | ❌ | Number of medicines to return (Default: `5`, Max: `10`) |
| `page` | number | ❌ | Page number (Default: `1`) |

### ✅ **Success Response**

**Status**: `200 OK`

```json
{
  "ok": true,
  "data": [
    {
      "id": "682b259023baf0a817af9ceb",
      "name": "Calcium",
      "pharmacy_id": "680b5258622b6d2a546aac8d",
      "pharmacy_name": "ALPHA Medicine",
      "dosage": "250mg",
      "form": "tablet",
      "prescription_required": false,
      "availability": "in_stock",
      "category": "...",
      "price": 150,
      "quantity": 10,
      "image": "med-682b259023baf0a817af9ceb.jpeg"
    }
  ]
}
```

---