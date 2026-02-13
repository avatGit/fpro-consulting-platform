# F-PRO Consulting Platform

F-PRO is a comprehensive consulting and service management platform designed for technical service providers. It integrates e-commerce, quoting, maintenance management, and a robust administrative dashboard.

##  Key Features

### E-Commerce & Rentals
- **Product Catalog**: Browse and search for technical products.
- **Cart System**: Manage multiple items for purchase or rental.
- **Order Management**: Track orders from placement to delivery.
- **Rentals**: Specialized flow for equipment leasing and returns.

###  Quoting & Invoicing
- **Quote Requests**: Clients can request detailed quotes for complex services.
- **Automated Invoicing**: Generation of invoices from delivered orders and quotes.
- **Payment Tracking**: Monitor invoice status (Paid, Pending, Overdue).

###  Maintenance & Interventions
- **Service Requests**: Users can submit maintenance and repair requests.
- **Technician Dispatch**: Assign technicians to specific interventions.
- **Field Reports**: Technicians can file reports directly from the field.

###  Professional Dashboards
- **Admin Dashboard**: Full control over users, products, orders, and system settings.
- **Agent Dashboard**: Operational view for sales and support staff.
- **Technician Dashboard**: Task-focused view for field workers.
- **Client Dashboard**: Personal space for order tracking and service requests.

##  Technical Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js
- **ORM**: Sequelize (PostgreSQL/MySQL support)
- **Authentication**: JWT-based secure login.
- **Architecture**: Controller-Service-Repository pattern for scalability.
- **Validation**: Joi/Validator for robust data integrity.

### Frontend (React)
- **Library**: React.js
- **Styling**: Vanilla CSS with modern modern layouts and responsive design.
- **State Management**: React Context API for authentication and global states.
- **Routing**: React Router for seamless navigation.

##  Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── config/         # Database and app configurations
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth and validation middlewares
│   │   ├── models/         # Sequelize database models
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API endpoint definitions
│   │   ├── services/       # Business logic layer
│   │   └── server.js       # Entry point
├── frontend/
│   └── F-PRO/
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── context/    # Global state management
│       │   ├── pages/      # Full-page components (Dashboards, Login, etc.)
│       │   ├── services/   # API communication logic
│       │   └── App.jsx     # Main application routing
```

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- A relational database (PostgreSQL/MySQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd fpro-consulting-platform
   ```

2. **Setup Backend**
   - Navigate to `Backend/`
   - Install dependencies: `npm install`
   - Configure your `.env` file (Database credentials, JWT secret)
   - Sync database: `npm run db:sync`

3. **Setup Frontend**
   - Navigate to `frontend/F-PRO/`
   - Install dependencies: `npm install`

### Running the Project

You can use the provided batch scripts for convenience:
- `.\start-backend.bat`: Launches the Express server.
- `.\start-frontend.bat`: Launches the React development server.
- `.\sync-database.bat`: Resets and synchronizes the database schema.

##  Testing

- **Admin Login**: Access the dashboard at `http://localhost:3000/login` using admin credentials.
- **Audit Logs**: View all administrative actions in the "Logs d'audit" section.
- **Settings**: Adjust system-wide parameters in the "Paramètres" module.

---
© 2026 F-PRO Consulting Platform. All rights reserved.
