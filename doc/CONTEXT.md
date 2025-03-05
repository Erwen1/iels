# IoT Equipment Loan Management System (IELMS)

## 🎯 Overview

IELMS is a modern cloud-based solution designed to streamline the management and tracking of IoT equipment loans. The system provides a robust platform for organizations to efficiently handle their IoT inventory, including microcontrollers, sensors, and various peripherals.

## 🛠 Technology Stack

### Core Technologies
- **Backend**: ASP.NET Core Web API (C#)
- **Frontend**: React.js with TypeScript
- **Database**: Supabase (PostgreSQL)

### Infrastructure
- **Authentication**: Supabase Auth (Email/Password + OAuth)
- **API Hosting**: Render (Cloud Platform)
- **Frontend Hosting**: Vercel
- **Database Hosting**: Supabase Cloud

## 🏗 System Architecture

### 1. Authentication Layer
- **Multi-factor Authentication** (Optional)
- **Role-Based Access Control (RBAC)**
  - Admin: Full system access
  - User: Limited to borrowing and returning
- **Session Management**
  - JWT-based authentication
  - Secure token storage
  - Automatic token refresh

### 2. Core Features

#### Equipment Management
```typescript
interface Equipment {
  id: string;
  name: string;
  category: string;
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';
  location: string;
  currentBorrower?: string;
  dueDate?: Date;
  specifications: Record<string, any>;
  maintenanceHistory: MaintenanceRecord[];
}
```

#### Loan Processing
```typescript
interface LoanRequest {
  equipmentId: string;
  userId: string;
  requestDate: Date;
  expectedReturnDate: Date;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

#### Location Tracking
```typescript
interface Location {
  id: string;
  building: string;
  floor: string;
  room: string;
  container: string; // e.g., "Box-2A"
  description: string;
}
```

## 🔄 Application Flow

### User Journey
1. **Authentication**
   - Login via email/password or OAuth
   - Role assignment and permission validation

2. **Equipment Browse & Search**
   - Filter by category, availability, location
   - View detailed specifications
   - Check real-time availability

3. **Loan Process**
   - Submit loan request
   - Receive approval/rejection
   - Get notifications for due dates
   - Return equipment

### Admin Journey
1. **Inventory Management**
   - Add/Edit equipment details
   - Update locations
   - Mark items for maintenance

2. **Loan Oversight**
   - Review loan requests
   - Track active loans
   - Handle overdue cases
   - Generate reports

## 🔌 API Endpoints

### Equipment Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/equipment` | List all equipment | Yes |
| GET | `/api/equipment/{id}` | Get single item | Yes |
| POST | `/api/equipment` | Add new item | Admin |
| PUT | `/api/equipment/{id}` | Update item | Admin |
| DELETE | `/api/equipment/{id}` | Remove item | Admin |

### Loan Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/loans/request` | Create loan request | Yes |
| PUT | `/api/loans/{id}/approve` | Approve request | Admin |
| PUT | `/api/loans/{id}/return` | Process return | Yes |
| GET | `/api/loans/active` | View active loans | Yes |

### User Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | List users | Admin |
| PUT | `/api/users/{id}/role` | Update user role | Admin |
| GET | `/api/users/{id}/history` | View loan history | Yes |

## 📦 Database Schema

### Complete Database Schema
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    room VARCHAR(50) NOT NULL,
    container VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment table
CREATE TABLE equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('AVAILABLE', 'BORROWED', 'MAINTENANCE', 'RETIRED')),
    location_id UUID REFERENCES locations(id),
    specifications JSONB,
    purchase_date DATE,
    last_maintenance_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_records table
CREATE TABLE maintenance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id),
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    performed_by UUID REFERENCES users(id),
    maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL,
    next_maintenance_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id),
    borrower_id UUID REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'RETURNED', 'OVERDUE')),
    purpose TEXT NOT NULL,
    borrowed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_borrower ON loans(borrower_id);
CREATE INDEX idx_loans_due_date ON loans(due_date);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

## 📂 Project Structure

```
ielms/
├── .github/                      # GitHub Actions workflows
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── backend/                      # ASP.NET Core Web API
│   ├── src/
│   │   ├── IELMS.API/           # API Project
│   │   │   ├── Controllers/     # API Controllers
│   │   │   ├── Middleware/      # Custom Middleware
│   │   │   ├── Services/        # Business Logic
│   │   │   ├── Models/          # Domain Models
│   │   │   ├── DTOs/           # Data Transfer Objects
│   │   │   ├── Repositories/    # Data Access
│   │   │   ├── Configurations/  # App Configuration
│   │   │   └── Extensions/      # Extension Methods
│   │   │
│   │   ├── IELMS.Core/         # Core Business Logic
│   │   │   ├── Entities/       # Domain Entities
│   │   │   ├── Interfaces/     # Abstractions
│   │   │   ├── Services/       # Core Services
│   │   │   └── Exceptions/     # Custom Exceptions
│   │   │
│   │   └── IELMS.Infrastructure/ # Data Access Layer
│   │       ├── Data/           # Database Context
│   │       ├── Repositories/   # Repository Implementations
│   │       └── Services/       # External Service Implementations
│   │
│   ├── tests/                  # Test Projects
│   │   ├── IELMS.API.Tests/
│   │   ├── IELMS.Core.Tests/
│   │   └── IELMS.Infrastructure.Tests/
│   │
│   └── tools/                  # DB Migrations, Seeds
│
├── frontend/                   # React TypeScript Frontend
│   ├── public/                # Static Files
│   ├── src/
│   │   ├── assets/           # Images, Fonts, etc.
│   │   ├── components/       # Reusable Components
│   │   │   ├── common/      # Shared Components
│   │   │   ├── layout/      # Layout Components
│   │   │   └── forms/       # Form Components
│   │   │
│   │   ├── features/        # Feature-based Modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── equipment/  # Equipment Management
│   │   │   ├── loans/      # Loan Management
│   │   │   └── admin/      # Admin Features
│   │   │
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── services/       # API Services
│   │   ├── store/          # State Management
│   │   ├── types/          # TypeScript Types
│   │   ├── utils/          # Utility Functions
│   │   └── App.tsx         # Root Component
│   │
│   ├── tests/              # Frontend Tests
│   │   ├── unit/
│   │   └── integration/
│   │
│   └── tools/              # Build Scripts
│
├── docs/                    # Documentation
│   ├── api/                # API Documentation
│   ├── deployment/         # Deployment Guides
│   └── development/        # Development Guides
│
├── scripts/                # Utility Scripts
│   ├── setup.sh
│   ├── deploy.sh
│   └── backup.sh
│
├── .editorconfig          # Editor Configuration
├── .gitignore            # Git Ignore Rules
├── docker-compose.yml    # Docker Compose Config
├── README.md             # Project Overview
└── LICENSE              # License Information
```

## 🚀 Deployment Guide

### 1. Database Setup
```sql
-- Create equipment table
CREATE TABLE equipment (
  id UUID DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Add more table creation scripts...
```

### 2. Backend Deployment
1. Configure environment variables:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```

2. Deploy to Render:
   ```bash
   git push origin main
   # Render will automatically deploy from main branch
   ```

### 3. Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## 🔍 Monitoring & Maintenance

### Health Checks
- API endpoint status
- Database connection
- Authentication service
- Real-time updates

### Performance Metrics
- Response times
- Database query performance
- Active users
- Equipment utilization

## 🔜 Future Enhancements

1. **Phase 1**
   - QR code integration for equipment
   - Mobile app development
   - Advanced analytics dashboard

2. **Phase 2**
   - Predictive maintenance
   - Equipment recommendation system
   - Integration with inventory systems

## 📚 Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core)
- [Supabase Documentation](https://supabase.io/docs)
- [React Documentation](https://reactjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
