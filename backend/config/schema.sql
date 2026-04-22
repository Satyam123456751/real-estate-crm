-- Run this file in PostgreSQL to create all tables
-- Command: psql -U postgres -d realestate_crm -f schema.sql

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  address TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 2.50,
  total_sales DECIMAL(12,2) DEFAULT 0,
  joined_date DATE DEFAULT CURRENT_DATE
);

-- LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  source VARCHAR(30) DEFAULT 'website' CHECK (source IN ('website', 'ads', 'call', 'referral')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
  budget DECIMAL(12,2),
  preferences TEXT,
  assigned_agent_id INT REFERENCES agents(id) ON DELETE SET NULL,
  follow_up_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(20) DEFAULT 'residential' CHECK (type IN ('residential', 'commercial')),
  price DECIMAL(14,2),
  size_sqft DECIMAL(10,2),
  location VARCHAR(255),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  amenities JSON,
  images JSON,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented')),
  agent_id INT REFERENCES agents(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  client_type VARCHAR(10) DEFAULT 'buyer' CHECK (client_type IN ('buyer', 'seller', 'both')),
  preferences TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEALS TABLE
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  property_id INT REFERENCES properties(id) ON DELETE SET NULL,
  agent_id INT REFERENCES agents(id) ON DELETE SET NULL,
  stage VARCHAR(20) DEFAULT 'negotiation' CHECK (stage IN ('negotiation', 'agreement', 'closed')),
  deal_value DECIMAL(14,2),
  commission_amount DECIMAL(12,2),
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS interactions (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id) ON DELETE CASCADE,
  agent_id INT REFERENCES agents(id) ON DELETE SET NULL,
  type VARCHAR(10) CHECK (type IN ('call', 'sms', 'email', 'visit')),
  notes TEXT,
  interacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  deal_id INT REFERENCES deals(id) ON DELETE CASCADE,
  doc_type VARCHAR(20) CHECK (doc_type IN ('agreement', 'contract', 'invoice')),
  file_url VARCHAR(255) NOT NULL,
  uploaded_by INT REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  type VARCHAR(20) CHECK (type IN ('follow_up', 'deal', 'reminder')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@crm.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;
