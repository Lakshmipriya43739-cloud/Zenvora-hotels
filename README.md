# Zenvora Luxury Hotels — Full-Stack Web Application

A full-stack luxury hotel reservation platform inspired by the visual elegance of Taj Hotels. Built with **React + Redux Toolkit** on the frontend, **Node.js + Express** on the backend, and **PostgreSQL with native SQL queries** (no ORM) on the database.

---

## Key Features

- **Luxury User Interface** — Elegant typography (Cinzel & Inter), gold accents (`#AD8B3A`), transparent-to-solid navigation, 3D interactive showcase gallery, and responsive layouts across mobile, tablet, and desktop.
- **Indian Rupee (₹) Pricing** — Authentic tariff pricing across all hotel collections.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full hotel management portfolio (Add, Edit, Delete hotels) via dedicated Management Portal.
  - **Client**: Secure registration, login, hotel search/filter, and digital membership card access.
  - **Guest**: Public browsing of hotel listings, 3D gallery, and property details.
- **Zenvora Privilege Circle Membership**:
  - Automatic enrollment upon client registration.
  - Dark green and gold digital membership card displaying Member Name, Unique ID, Status, Join Date, Tier, and 6 exclusive luxury benefits.
- **Interactive Property Maps** — OpenStreetMap embed with exact coordinates, zoom controls, and Google Maps directions routing.
- **Native SQL Queries** — Injection-safe parameterized queries via the `pg` driver with zero ORM overhead.
- **Server-Side Image Storage** — Image uploads managed with Multer disk storage and served statically.

---

## Project Structure

```
hotel-app/
├── server/                      # Node.js + Express API
│   ├── src/
│   │   ├── index.js             # API entry point & static file serving
│   │   ├── routes/              # Express routes (hotels, auth, membership)
│   │   ├── controllers/         # Native SQL database controllers
│   │   ├── middleware/          # JWT auth, upload validation, error handling
│   │   └── db/                  # PostgreSQL schema, pool, and seed scripts
│   ├── uploads/                 # Static photo storage (includes seed images)
│   ├── .env.example             # Environment template
│   └── package.json
└── client/                      # React SPA
    ├── index.html
    ├── vite.config.js           # Vite dev proxy configuration
    ├── public/                  # Public brand assets & vector graphics
    └── src/
        ├── features/            # Redux Toolkit slices (hotels, auth, ui)
        ├── pages/               # HomePage, HotelListPage, Details, Form, Admin, Membership, Login, Register
        ├── components/          # Navbar, Footer, HotelCard, HotelMap, Gallery, Toast, ConfirmModal...
        ├── utils/               # Currency formatting, coordinates, luxury amenities data
        └── styles.css           # Handcrafted luxury theme styles
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (v14+) running locally

### 1. Database Setup
```bash
# Create database
createdb hotels_db

# Configure environment variables
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 2. Backend Server
```bash
cd server
npm install

# Apply database schemas
npm run db:schema

# Seed 12 luxury demo hotels
npm run db:seed

# (Optional) Seed default admin user (admin@zenvora.com / Admin@1234)
npm run db:admin

# Start API server (port 4000)
npm run dev
```

### 3. Frontend Client
```bash
cd ../client
npm install

# Start Vite development server (port 5173, proxies to :4000)
npm run dev
```

### 4. Single-Port Production Mode
```bash
cd client && npm run build
cd ../server && npm start
# The Express server serves both the built React SPA and API on http://localhost:4000
```

---

## API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/hotels` | List hotels with title search, price filter & pagination | Public |
| `GET` | `/api/hotels/:id` | Get single hotel details | Public |
| `POST` | `/api/hotels` | Create new hotel listing (multipart with image) | Admin Only |
| `PUT` | `/api/hotels/:id` | Update hotel listing | Admin Only |
| `DELETE` | `/api/hotels/:id` | Delete hotel listing & its image file | Admin Only |
| `POST` | `/api/auth/register` | Register new client account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Restore user session from token | Authenticated |
| `GET` | `/api/membership/me` | Fetch digital membership card and benefits | Authenticated |

---

## License
MIT
