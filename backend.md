# Backend Issues — Veyra Frontend Integration Report

This document describes problems discovered in the frontend during integration with the backend API. Each section includes the observed behavior, the expected behavior, and the impact on the frontend.

---

## 1. `GET /users/{userId}/subscriptions/active` — Error response when no subscription exists

**Observed:** When a user has no active subscription, the endpoint returns a `500 Internal Server Error` (or an unstructured error body).

**Expected:** Should return `404 Not Found` with a consistent JSON error body, e.g.:
```json
{ "status": 404, "error": "Not Found", "message": "No active subscription found for user {userId}" }
```

**Impact:** The frontend uses this endpoint right after sign-in to decide where to redirect admin users. A `404` means "go to `/payments/choose`"; any other status code causes the same redirect, but makes error handling ambiguous and may silently swallow real server errors.

---

## 2. `POST /nursing-homes/{nursingHomeId}/activities` — Returns raw integer instead of resource object

**Observed:** The endpoint returns a plain integer (the created activity ID), e.g.:
```
7
```

**Expected:** Should return the created activity object:
```json
{
  "activityId": 7,
  "hour": "09:00",
  "activityName": "Morning Exercise",
  "areaToDevelop": "Physical",
  "attendantName": "Dr. Smith",
  "status": "PENDING"
}
```

**Impact:** The frontend cannot display the newly created activity immediately after creation; it must do a full reload of the activity list. Returning the full resource also follows REST conventions and is consistent with other endpoints (e.g., `POST /residents` returns the full resident object).

---

## 3. Stripe test mode — `pm_card_visa` token must be accepted

**Observed:** The backend processes real Stripe payment methods. If the Stripe account is in live mode, the test payment method token `pm_card_visa` will be rejected.

**Expected:** The backend Stripe client must be configured with the **test secret key** (`sk_test_...`) for all non-production environments so that Stripe's built-in test payment method tokens (`pm_card_visa`, `pm_card_mastercard`, etc.) are accepted without a real card number.

**Impact:** The checkout flow cannot be tested end-to-end in development or staging environments without a real card number unless Stripe is in test mode.

---

## 4. CORS — Firebase Hosting domain not whitelisted

**Observed:** API calls from `https://veyra-frontend-application.web.app` are blocked by CORS policy in some environments.

**Expected:** The backend CORS configuration must explicitly allow:
```
https://veyra-frontend-application.web.app
```
In addition to `http://localhost:4200` for local development.

**Recommended headers to include in `Access-Control-Allow-Origin`:**
- `https://veyra-frontend-application.web.app`
- `http://localhost:4200`

**Impact:** All API calls fail in the deployed Firebase environment if CORS is not configured.

---

## 5. MFA endpoints — Consistency and existence verification needed

The frontend integrates with the following MFA endpoints. Please confirm they exist and return the documented shapes:

| Method | Path | Expected response |
|--------|------|-------------------|
| `POST` | `/mfa/setup` | `{ qrCodeUrl: string, secret: string }` |
| `POST` | `/mfa/enable` | `204 No Content` or `{ success: true }` |
| `DELETE` | `/mfa/disable` | `204 No Content` |
| `POST` | `/mfa/verify` | `{ token: string }` (JWT for the session) |

**Impact:** The MFA flow (setup → scan QR → verify → enable) relies on all four endpoints. If any return different field names or status codes, the frontend will silently fail or show a blank state.

---

## 6. `PATCH /residents/{residentId}/room` — Room assignment endpoint

**Observed:** The frontend sends `PATCH /residents/{residentId}/room` with body `{ roomId: number }` to assign a resident to a room.

**Expected:**
- Endpoint exists and accepts `{ roomId: number }` in the request body.
- Returns the updated resident object or `204 No Content`.

**Impact:** If this endpoint does not exist or uses a different path (e.g., `PUT /residents/{residentId}` with a full body), room assignment will silently fail in the UI.

---

## 7. Questions endpoints — Existence and response format

The frontend references a questions module. Please confirm the following endpoints exist:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/nursing-homes/{id}/questions` | List questions for a nursing home |
| `POST` | `/nursing-homes/{id}/questions` | Create a new question |
| `GET` | `/nursing-homes/{id}/questions/{questionId}` | Get a single question |
| `DELETE` | `/nursing-homes/{id}/questions/{questionId}` | Delete a question |

**Expected response shape for a question:**
```json
{
  "id": 1,
  "text": "How are you feeling today?",
  "category": "WELLNESS",
  "createdAt": "2026-06-20T09:00:00Z"
}
```

**Impact:** If these endpoints are missing or return a different shape, the questions screen will display empty or crash.

---

## 8. `GET /nursing-homes/{id}/residents` — Resident list includes room assignment

**Observed:** The resident list response does not always include the assigned room information.

**Expected:** Each resident object should include a `roomId` (or `null` if unassigned) so the frontend can display room status without a separate request per resident:
```json
{
  "id": 1,
  "firstName": "Ana",
  "lastName": "García",
  "roomId": 3,
  ...
}
```

**Impact:** The residents table cannot show room assignments without this field, requiring N additional requests.

---

## Summary table

| # | Endpoint | Severity | Issue |
|---|----------|----------|-------|
| 1 | `GET /users/{id}/subscriptions/active` | High | Returns 500 instead of 404 when no subscription |
| 2 | `POST /nursing-homes/{id}/activities` | Medium | Returns integer instead of full resource |
| 3 | Stripe config | High | Must be in test mode for dev/staging |
| 4 | CORS | High | Firebase domain not whitelisted |
| 5 | MFA endpoints | Medium | Need to confirm all 4 exist with documented shapes |
| 6 | `PATCH /residents/{id}/room` | Medium | Need to confirm endpoint exists |
| 7 | Questions endpoints | Low | Need to confirm all 4 exist |
| 8 | `GET /nursing-homes/{id}/residents` | Low | Missing roomId in response |
