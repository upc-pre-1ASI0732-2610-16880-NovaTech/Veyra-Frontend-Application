# Veyra Frontend

**Veyra** is the frontend application built by NovaPeru Tech to connect nursing homes with families of older adults. The app's goal is to improve safety, monitoring and communication for residents while providing nursing-home staff with organized, controlled and auditable management of resident data.

This documentation covers the frontend implementation details and how to run, develop and contribute to the project.

## Tech Stack

- **Angular** (TypeScript) - Core framework
- **Angular Material** - UI components and theming
- **ngx-translate** - Internationalization (i18n)
- **RxJS** - Reactive state management and streams
- **Angular Signals** - Modern state management (if implemented)
- **Angular HTTP Client** - REST API communication
# Veyra Platform — Frontend Integration Guide

**Base URL:** `https://<your-azure-domain>/api/v1`  
**Auth:** Bearer JWT — añadir header `Authorization: Bearer <token>` en todas las rutas marcadas con 🔒.

---

## Índice
1. [Autenticación (IAM)](#1-autenticación-iam)
2. [MFA / 2FA (TOTP)](#2-mfa--2fa-totp)
3. [Planes de Suscripción](#3-planes-de-suscripción-público)
4. [Pagos y Suscripciones (Stripe)](#4-pagos-y-suscripciones-stripe)
5. [Nursing Home (Casa de Reposo)](#5-nursing-home)
6. [Residentes](#6-residentes)
7. [Medicamentos](#7-medicamentos)
8. [Habitaciones](#8-habitaciones)
9. [Familiares (Relatives)](#9-familiares-relatives)
10. [Preguntas de Familiares (Comunicación)](#10-preguntas-de-familiares-us20)
11. [Empleados / Staff (HCM)](#11-empleados--staff-hcm)
12. [Actividades](#12-actividades)
13. [Analíticas / Dashboard](#13-analíticas--dashboard)
14. [Perfiles](#14-perfiles)
15. [Variables de Entorno Azure](#15-variables-de-entorno-azure)

---

## 1. Autenticación (IAM)

### Sign-Up
```
POST /authentication/sign-up
```
**Body:**
```json
{
  "username": "admin@veyra.com",
  "password": "SecurePass123!",
  "roles": []
}
```
**Respuesta 201:**
```json
{ "id": 1, "username": "admin@veyra.com", "roles": ["ROLE_USER"] }
```

---

### Sign-In
```
POST /authentication/sign-in
```
**Body:**
```json
{ "username": "admin@veyra.com", "password": "SecurePass123!" }
```
**Respuesta 200 — sin MFA:**
```json
{
  "id": 1,
  "username": "admin@veyra.com",
  "roles": ["ROLE_ADMIN"],
  "token": "eyJhbGci...",
  "mfaRequired": false
}
```
**Respuesta 200 — con MFA activo:**
```json
{
  "id": 1,
  "username": "admin@veyra.com",
  "roles": ["ROLE_ADMIN"],
  "token": "",
  "mfaRequired": true
}
```
> Cuando `mfaRequired: true`, el `token` está vacío. Debes llamar a `/authentication/mfa/verify` con el `id` del usuario y el código TOTP para obtener el JWT real.

---

## 2. MFA / 2FA (TOTP)

### Flujo completo de activación

#### 2.1 Iniciar setup (genera secreto)
```
POST /authentication/mfa/setup   🔒
```
**Respuesta 200:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpAuthUrl": "otpauth://totp/Veyra:admin@veyra.com?secret=JBSWY3DPEHPK3PXP&issuer=Veyra&algorithm=SHA1&digits=6&period=30"
}
```
> Renderizar `otpAuthUrl` como QR code en el frontend (usar lib como `qrcode.react`) para que el usuario lo escanee con Google Authenticator o Authy.

#### 2.2 Confirmar y activar MFA
```
POST /authentication/mfa/enable   🔒
```
**Body:**
```json
{ "code": "123456" }
```
**Respuesta 200:** vacío (status OK)  
**Respuesta 400:** `"Invalid TOTP code"` o `"MFA setup not initiated"`

#### 2.3 Desactivar MFA
```
DELETE /authentication/mfa/disable   🔒
```
**Respuesta 200:** vacío (status OK)

---

### Flujo de Sign-In con MFA

#### 2.4 Verificar TOTP durante login
```
POST /authentication/mfa/verify
```
> Este endpoint es **público** (no requiere token).

**Body:**
```json
{
  "userId": 1,
  "code": "123456"
}
```
**Respuesta 200:**
```json
{ "token": "eyJhbGci..." }
```
**Respuesta 400:** `"Invalid TOTP code"`

**Implementación sugerida en el frontend:**
```typescript
const signIn = async (username, password) => {
  const res = await post('/authentication/sign-in', { username, password });
  if (res.mfaRequired) {
    // Mostrar input de código TOTP al usuario
    showMfaPrompt(res.id);
  } else {
    saveToken(res.token);
  }
};

const verifyMfa = async (userId, code) => {
  const res = await post('/authentication/mfa/verify', { userId, code });
  saveToken(res.token);
};
```

---

## 3. Planes de Suscripción (público)

```
GET /plans
```
No requiere autenticación. Usar en landing page.

**Respuesta 200:**
```json
[
  {
    "id": "FAMILY",
    "displayName": "Family Plan",
    "description": "For families who want to stay connected...",
    "prices": [
      { "period": "MONTHLY", "price": 30.0, "currency": "USD" },
      { "period": "ANNUALLY", "price": 300.0, "currency": "USD" }
    ],
    "features": [
      { "name": "Resident profile access", "included": true },
      { "name": "Daily activity updates", "included": true },
      { "name": "Send questions to staff", "included": true },
      { "name": "Medication tracking view", "included": true },
      { "name": "Multi-resident management", "included": false }
    ]
  },
  {
    "id": "NURSING_HOME",
    "displayName": "Nursing Home Plan",
    "description": "Complete management suite...",
    "prices": [
      { "period": "MONTHLY", "price": 300.0, "currency": "USD" },
      { "period": "ANNUALLY", "price": 3000.0, "currency": "USD" }
    ],
    "features": [...]
  }
]
```

---

## 4. Pagos y Suscripciones (Stripe)

### Crear suscripción
```
POST /users/{userId}/subscriptions   🔒
```
**Body:**
```json
{
  "planType": "NURSING_HOME",
  "period": "MONTHLY",
  "paymentMethodId": "pm_card_visa"
}
```
> `paymentMethodId` se obtiene del frontend con Stripe.js / `stripe.createPaymentMethod()`.

**Respuesta 201:**
```json
{
  "id": 1,
  "userId": 1,
  "planType": "NURSING_HOME",
  "period": "MONTHLY",
  "status": "ACTIVE",
  "stripeSubscriptionId": "sub_xxx",
  "currentPeriodStart": "2026-06-19T00:00:00",
  "currentPeriodEnd": "2026-07-19T00:00:00"
}
```

### Obtener suscripción activa
```
GET /users/{userId}/subscriptions/active   🔒
```

### Listar todas las suscripciones del usuario
```
GET /users/{userId}/subscriptions   🔒
```

### Actualizar suscripción
```
PUT /users/{userId}/subscriptions/{subscriptionId}   🔒
```
**Body:** `{ "planType": "FAMILY", "period": "ANNUALLY" }`

### Cancelar suscripción
```
POST /users/{userId}/subscriptions/{subscriptionId}/cancel   🔒
```

### Obtener pago por ID
```
GET /payments/{paymentId}   🔒
```

### Historial de pagos de una suscripción
```
GET /subscriptions/{subscriptionId}/payments   🔒
```

---

## 5. Nursing Home

### Crear Nursing Home (onboarding del admin)
```
POST /administrators/{administratorId}/nursing-homes   🔒
```
**Body:**
```json
{
  "businessName": "Casa Serena",
  "ruc": "20123456789",
  "emailAddress": "info@casaserena.com",
  "phoneNumber": "+51987654321",
  "street": "Av. Principal",
  "number": "123",
  "city": "Lima",
  "postalCode": "15001",
  "country": "Peru",
  "photo": "<base64-image>"
}
```
**Respuesta 201:** `NursingHomeResource`

### Obtener Nursing Home del administrador
```
GET /administrators/{administratorId}/nursing-homes   🔒
```

### Obtener por ID
```
GET /nursing-homes/{nursingHomeId}   🔒
```

### Listar todos
```
GET /nursing-homes   🔒
```

**NursingHomeResource:**
```json
{
  "id": 1,
  "businessName": "Casa Serena",
  "ruc": "20123456789",
  "emailAddress": "info@casaserena.com",
  "phoneNumber": "+51987654321",
  "street": "Av. Principal",
  "number": "123",
  "city": "Lima",
  "postalCode": "15001",
  "country": "Peru",
  "photoUrl": "https://res.cloudinary.com/..."
}
```

---

## 6. Residentes

### Crear residente en una casa de reposo
```
POST /nursing-homes/{nursingHomeId}/residents   🔒
```
**Body:**
```json
{
  "dni": "12345678",
  "firstName": "Carlos",
  "lastName": "García",
  "birthDate": "1945-03-15",
  "age": 81,
  "emailAddress": "carlos@email.com",
  "street": "Jr. Las Flores",
  "number": "42",
  "city": "Lima",
  "postalCode": "15001",
  "country": "Peru",
  "photoBase64": "<base64-image>",
  "phoneNumber": "+51987123456",
  "legalRepresentativeFirstName": "María",
  "legalRepresentativeLastName": "García",
  "legalRepresentativePhoneNumber": "+51987654321",
  "emergencyContactFirstName": "Luis",
  "emergencyContactLastName": "García",
  "emergencyContactPhoneNumber": "+51976543210"
}
```
**Respuesta 201:** `ResidentResource`

### Listar residentes de una casa de reposo
```
GET /nursing-homes/{nursingHomeId}/residents   🔒
```

### Obtener residente por ID
```
GET /residents/{residentId}   🔒
```

### Actualizar residente (TS-RM-005)
```
PATCH /residents/{residentId}   🔒
```
**Body:** mismo formato que creación.

### Eliminar residente
```
DELETE /residents/{residentId}   🔒
```
**Respuesta 200:** `{ "message": "Resident with given id successfully deleted" }`

**ResidentResource:**
```json
{
  "id": 1,
  "personProfileId": 5,
  "nursingHomeId": 1,
  "residentStatus": "ACTIVE",
  "legalRepresentativeFirstName": "María",
  "legalRepresentativeLastName": "García",
  "legalRepresentativePhoneNumber": "+51987654321",
  "emergencyContactFirstName": "Luis",
  "emergencyContactLastName": "García",
  "emergencyContactPhoneNumber": "+51976543210"
}
```

---

## 7. Medicamentos

### Agregar medicamento a un residente (US14 / TS-I002)
```
POST /residents/{residentId}/medications   🔒
```
**Body:**
```json
{
  "name": "Metformina",
  "description": "Control de glucosa",
  "amount": 30,
  "expirationDate": "2027-12-31",
  "drugPresentation": "TABLET",
  "dosage": "500mg cada 8 horas"
}
```
`drugPresentation` valores: `TABLET`, `CAPSULE`, `LIQUID`, `INJECTION`, `CREAM`, `DROPS`, `PATCH`, `INHALER`

**Respuesta 201:** `MedicationResource`

### Listar medicamentos de un residente
```
GET /residents/{residentId}/medications   🔒
```

### Obtener medicamento por ID
```
GET /medications/{medicationId}   🔒
```

**MedicationResource:**
```json
{
  "id": 1,
  "residentId": 1,
  "name": "Metformina",
  "description": "Control de glucosa",
  "amount": 30,
  "expirationDate": "2027-12-31",
  "drugPresentation": "TABLET",
  "dosage": "500mg cada 8 horas"
}
```

---

## 8. Habitaciones

### Crear habitación
```
POST /nursing-homes/{nursingHomeId}/rooms   🔒
```
**Body:**
```json
{
  "roomNumber": "101",
  "capacity": 2,
  "roomType": "STANDARD"
}
```

### Listar habitaciones
```
GET /nursing-homes/{nursingHomeId}/rooms   🔒
```

### Asignar residente a habitación
```
POST /residents/{residentId}/room   🔒
```
**Body:** `{ "roomNumber": "101" }`

---

## 9. Familiares (Relatives)

### Crear familiar
```
POST /relatives   (público)
```
**Body:**
```json
{ "username": "maria.garcia", "password": "SecurePass123!" }
```
**Respuesta 201:** `RelativeResource`

### Listar residentes de un familiar
```
GET /relatives/{relativeId}/residents   🔒
```

---

## 10. Preguntas de Familiares (US20)

### Enviar pregunta sobre rutina diaria
```
POST /relatives/{relativeId}/questions   🔒
```
**Body:**
```json
{
  "residentId": 1,
  "nursingHomeId": 1,
  "body": "¿Cómo estuvo el apetito de mi papá hoy? ¿Comió bien en el almuerzo?"
}
```
**Respuesta 201:**
```json
{
  "id": 1,
  "relativeId": 3,
  "residentId": 1,
  "nursingHomeId": 1,
  "body": "¿Cómo estuvo el apetito de mi papá hoy?",
  "answer": null,
  "status": "PENDING",
  "createdAt": "2026-06-19T10:30:00",
  "updatedAt": "2026-06-19T10:30:00"
}
```

### Listar preguntas enviadas por un familiar
```
GET /relatives/{relativeId}/questions   🔒
```

### Ver todas las preguntas de la casa de reposo (para staff)
```
GET /nursing-homes/{nursingHomeId}/questions   🔒
```

### Responder una pregunta (staff)
```
PATCH /nursing-homes/{nursingHomeId}/questions/{questionId}/answer   🔒
```
**Body:**
```json
{ "answer": "El señor Carlos comió muy bien hoy, terminó toda su sopa y el segundo plato." }
```
**Respuesta 200:** `QuestionResource` con `status: "ANSWERED"`

> **Nota de cifrado:** El campo `body` y `answer` se almacenan cifrados en BD con AES-256-GCM. El frontend los recibe y envía en texto plano; el cifrado es transparente.

---

## 11. Empleados / Staff (HCM)

### Agregar empleado a una casa de reposo (TS-EM001)
```
POST /nursing-homes/{nursingHomeId}/staff   🔒
```
**Body:**
```json
{
  "dni": "87654321",
  "firstName": "Ana",
  "lastName": "Martínez",
  "birthDate": "1990-05-20",
  "age": 36,
  "emailAddress": "ana@casaserena.com",
  "street": "Jr. Los Pinos",
  "number": "55",
  "city": "Lima",
  "postalCode": "15002",
  "country": "Peru",
  "photoBase64": "<base64-image>",
  "phoneNumber": "+51912345678",
  "emergencyContactFirstName": "Pedro",
  "emergencyContactLastName": "Martínez",
  "emergencyContactPhoneNumber": "+51987001234",
  "role": "NURSE",
  "startDate": "2026-06-19",
  "endDate": "2027-06-19",
  "typeOfContract": "FULL_TIME",
  "workShift": "MORNING"
}
```
**Respuesta 201:** `StaffResource`

### Listar empleados de una casa de reposo
```
GET /nursing-homes/{nursingHomeId}/staff   🔒
```

### Actualizar empleado
```
PUT /staff/{staffMemberId}   🔒
```

### Historial de contratos de un empleado
```
GET /staff/{staffMemberId}/contracts   🔒
POST /staff/{staffMemberId}/contracts   🔒
PUT  /staff/{staffMemberId}/contracts/{contractId}   🔒
```

---

## 12. Actividades

### Listar actividades del día
```
GET /nursing-homes/{nursingHomeId}/activities?date=2026-06-19   🔒
```
**Respuesta 200:** Lista de `ActivityResource`

### Crear actividad
```
POST /nursing-homes/{nursingHomeId}/activities   🔒
```
**Body:**
```json
{
  "title": "Terapia física",
  "description": "Ejercicios de movilidad articular",
  "startTime": "09:00",
  "endTime": "10:00",
  "date": "2026-06-19"
}
```
**Respuesta 201:** `{ "id": 1 }` (el ID de la actividad creada)

---

## 13. Analíticas / Dashboard (TS-ST001)

### Admisiones de residentes por mes
```
GET /nursing-homes/{nursingHomeId}/analytics/residents-admissions?year=2026   🔒
```

### Contrataciones de staff por mes
```
GET /nursing-homes/{nursingHomeId}/analytics/staff-hires?year=2026   🔒
```

### Bajas de staff por mes
```
GET /nursing-homes/{nursingHomeId}/analytics/staff-terminations?year=2026   🔒
```

**MetricResource:**
```json
{
  "labels": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  "values": [3, 1, 4, 2, 5, 3, 0, 2, 1, 3, 4, 2]
}
```
> Usar directamente con Chart.js, Recharts, etc. — `labels` para el eje X, `values` para la serie de datos.

---

## 14. Perfiles

### Crear perfil de persona
```
POST /person-profiles   🔒
```

### Obtener perfil por ID
```
GET /person-profiles/{personProfileId}   🔒
```

### Actualizar perfil
```
PUT /person-profiles/{personProfileId}   🔒
```

### Crear perfil de empresa
```
POST /business-profiles   🔒
```

### Obtener perfil de empresa por ID
```
GET /business-profiles/{businessProfileId}   🔒
```

---

## 15. Variables de Entorno Azure

Configurar estas variables en Azure App Service → **Configuración → Variables de aplicación**:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_HOST` | Host MySQL de Aiven | `mysql-xxxx.aivencloud.com` |
| `DATABASE_PORT` | Puerto MySQL | `3306` |
| `DATABASE_SCHEMA` | Nombre de la BD | `veyra_db` |
| `DATABASE_USER` | Usuario BD | `avnadmin` |
| `DATABASE_PASSWORD` | Contraseña BD | `xxxxxx` |
| `AUTHORIZATION_JWT_SECRET` | Clave JWT (min 32 chars) | `veyra-super-secret-jwt-key-2026!` |
| `AUTHORIZATION_JWT_EXPIRATION_DAYS` | Días de expiración del JWT | `7` |
| `STRIPE_API_KEY` | API key de Stripe | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | `whsec_xxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary | `veyra-prod` |
| `CLOUDINARY_API_KEY` | API key Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary | `xxxxxxxxx` |
| `ENCRYPTION_SECRET` | Clave AES-256 para cifrado médico (min 32 chars) | `veyra-medical-aes-key-2026-secure!` |
| `SPRING_PROFILES_ACTIVE` | Perfil Spring activo | `prod` |

---

## Notas de Implementación Frontend

### CORS orígenes permitidos
```
https://veyra-frontend-application.web.app
http://localhost:5173
http://localhost:3000
http://localhost:4200
```

### Manejo de errores (US44)
El backend retorna errores en formato estándar. El frontend debe manejar:

| HTTP Status | Significado | Acción sugerida |
|---|---|---|
| `400` | Validación fallida | Mostrar mensajes del campo `errors` o body |
| `401` | No autenticado | Redirigir al login, limpiar token |
| `403` | Sin permisos | Mostrar mensaje de acceso denegado |
| `404` | Recurso no encontrado | Mostrar pantalla de "no encontrado" |
| `500` | Error interno | Mostrar mensaje genérico + log en consola |

**Formato de error de validación (400):**
```json
{
  "status": 400,
  "detail": "DNI is requiredFirst name is required"
}
```

### Autenticación — patrón de interceptor
```typescript
// axios interceptor example
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('veyra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('veyra_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

### Swagger UI (documentación interactiva)
Disponible en: `https://<your-azure-domain>/swagger-ui/index.html`

## Getting Started

### Prerequisites

- Node.js 
- npm or yarn
- Angular CLI


### Installation
```bash
# Clone the repository
git clone [repository-url]
cd veyra-frontend

# Install dependencies
npm install

# Start development server
ng serve
