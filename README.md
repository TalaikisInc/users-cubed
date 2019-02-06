# Users Cubed

This is user management service API, currently storing data only on hosts' disk.

## NOTE!

Improvement work in progress, current will break.

After readd:

```
"husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "lint-staged"
    }
  },
  "lint-staged": {
    "*.(js|jsx|mjs)": [
      "npm run test"
    ]
  },
```

### Main system

* Unconfirmed (secondary) method confirm path
* Phone/ email change - should also change all joined data points
* MOve everything under POST and action pattern
* Ability to easily change first confirm method (finalize remaining)
* More logs

## Run

```bash
npm i
npm run start
```

## Debug

```bash
npm i
npm run debug
```

## System requirements

* Passwords > 12 chars

## Routes

There is only one '/' route that accepts only POST requests.

### Tokens

Login.

```json
// POST /tokens
{
    "email": "test@gmail.com",
    "password": "testpassword369",
    "action": "TOKEN_CREATE"
}
```

Get token information.

```json
// POST /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6",
    "action": "TOKEN_GET"
}
```

Extend token expiration.

```json
// POST /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6",
    "action": "TOKEN_EXTEND"
}
```

Logout.

```json
// POST /tokens

{
    "tokenId": "02a2ba7d-468a-467b-823a-e90b117957f6",
    "action": "TOKEN_DESTROY"
}
```

Token autodestroys after time defined in config.

### Users

Register

```json
// POST /users
{
    "phone": "37061415694",
    "firstName": "John",
    "lastName": "Doe",
    "email": "info@talaikis.com",
    "password": "testpassword369",
    "tosAgreement": true,
    "action": "USER_CREATE"
}
```

Get user data.

```json
// POST /users
// needs auth token

{
  "email": "test@gmail.com",
  "action": "USER_GET"
}
```

Edit user data.

```json
// POST /users
// needs auth token
{
    "phone": "37061415694",
    "firstName": "John Renamed",
    "lastName": "Doe Renamed",
    "email": "info@test.com",
    "password": "testpassword369123",
    "_action": "put"
}
```

Delete user.

```json
// POST /users
// needs auth token

{
    "phone": "37061415694",
    "_action": "delete"
}
```

### URLS

Create new url.

```json
// POST /urls
{
    "protocol": "https",
    "url": "google.com",
    "method": "GET",
    "successCodes": [200, 201, 301],
    "timeout": 5,
    "_action": "post"
}
```

Get url data.

```json
// POST /urls
// needs auth token
{
  "phone": "37061415694",
  "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",,
  "_action": "get"
}
```

Edit url.

```json
// POST /urls
// needs auth token
{
    "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",
    "protocol": "https",
    "url": "google2.com",
    "method": "GET",
    "successCodes": [200, 201, 301],
    "timeout": 5,
    "phone": "37061415694",
    "_action": "put"
}
```

Delete Url.

```json
// POST /urls
// needs auth token
{
    "urlId": "d668af45-6a81-4767-8b73-b8cf3ecc8dc9",
    "phone": "37061415694",
    "_action": "delete"
}
```

### Password reset

```json
// POST /reset

{
    "phone": "37061415694"
}
```

### Confirms

```json
// POST /confirm
{
    "token": "fc8c0abeeb4448f9dc96f36b9b6a84a75330ac9adf82b6f197142c8aebbb0137"
}
```

### Refer

Referral sends invite.

```json
// POST /refer
// needs auth
{
    "_action": "refer",
    "refEmail": "invited@test.com",
    "phone": "37061415694"
}
```

Referred user clicks.

```json
{
    "_action": "use",
    "token": "e137e903-b54d-40d8-9f0e-8a83abb0ef19"
}
```

Called after refrered user registration.

```json
{
    "_action": "register",
    "token": "e137e903-b54d-40d8-9f0e-8a83abb0ef19"
}
```

### Menu

Get menu.

```json
// POST /menu
// needs auth
{
    "_action": "get",
    "phone": "37061415694"
}
```

Add to menu.

```json
// POST /menu
// needs auth and **admin** role
{
    "_action": "add",
    "name": "Product",
    "price": 3.99
}
```

### Orders

Get products in cart.

```json
// POST /orders
// needs auth
{
    "_action": "get_cart",
    "phone": "37061415694"
}
```

Get user's order history.

```json
// POST /orders
// needs auth
{
    "_action": "get_orders",
    "phone": "37061415694",
}
```

Add / edit products to basket.

```json
// POST /orders
// needs auth
{
    "_action": "add_cart",
    "phone": "37061415694",
    "items": [0, 1, 2]
}
```

Clear cart.

```json
// POST /orders
// needs auth
{
    "_action": "delete_cart",
    "phone": "37061415694"
}
```

Buy / pay.

```json
// POST /orders
// needs auth
{
    "_action": "buy",
    "phone": "37061415694"    
}
```

Get user's order.

```json
// POST /orders
// needs auth
{
    "_action": "get_order",
    "phone": "37061415694",
    "orderId": "bd71c2bc-cdef-44a2-991d-ce25dbf307c8"
}
```
