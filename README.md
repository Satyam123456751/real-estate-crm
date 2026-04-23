# \## 🚀 Live Demo

# \- 🌐 Frontend: https://real-estate-crm-wheat-eight.vercel.app

# \- ⚙️ Backend: https://crm-backend-kyfm.onrender.com

# 

# \---

# 🏠 Real Estate CRM — Complete Setup Guide

## 📁 Project Structure

```
crm-project/
├── backend/
│   ├── server.js              ← Entry point
│   ├── .env.example           ← Copy to .env and fill
│   ├── package.json
│   ├── config/
│   │   ├── db.js              ← PostgreSQL connection
│   │   └── schema.sql         ← Run once to create tables
│   ├── middleware/
│   │   └── auth.js            ← JWT auth guard
│   └── routes/
│       ├── auth.js            ← /api/auth/login, /register
│       ├── leads.js           ← /api/leads
│       ├── properties.js      ← /api/properties
│       ├── deals.js           ← /api/deals
│       └── clients.js         ← /api/clients
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js           ← React entry point
        ├── App.js             ← Routes
        ├── api/axios.js       ← API config
        ├── context/
        │   └── AuthContext.js ← Login state
        ├── components/
        │   └── Sidebar.js     ← Navigation
        └── pages/
            ├── Login.js
            ├── Dashboard.js   ← Charts \& stats
            ├── Leads.js       ← Lead management
            ├── Properties.js  ← Property listings
            ├── Clients.js     ← Client profiles + timeline
            └── Deals.js       ← Kanban deal pipeline
```

\---

## ✅ STEP-BY-STEP SETUP

### 1️⃣ Install Required Software

|Software|Download Link|
|-|-|
|Node.js|https://nodejs.org (v18 or higher)|
|PostgreSQL|https://www.postgresql.org/download/|
|Git|https://git-scm.com (optional)|

\---

### 2️⃣ Create PostgreSQL Database

Open pgAdmin OR Terminal and run:

```sql
-- In psql terminal:
psql -U postgres

CREATE DATABASE realestate\_crm;
\\q
```

\---

### 3️⃣ Setup Backend

```bash
# Go to backend folder
cd crm-project/backend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env
```

Now open `.env` and update these values:

```
DB\_HOST=localhost
DB\_PORT=5432
DB\_USER=postgres
DB\_PASSWORD=YOUR\_POSTGRES\_PASSWORD    ← change this!
DB\_NAME=realestate\_crm
JWT\_SECRET=any\_random\_secret\_string   ← change this!
PORT=5000
```

\---

### 4️⃣ Create All Database Tables

```bash
# Run the schema file (creates all 9 tables + default admin user)
psql -U postgres -d realestate\_crm -f config/schema.sql
```

✅ This creates: users, agents, leads, properties, clients, deals, interactions, documents, notifications

\---

### 5️⃣ Start Backend Server

```bash
# In backend folder:
npm run dev
```

You should see:

```
🚀 Server running on http://localhost:5000
✅ PostgreSQL connected!
```

Test it: Open browser → http://localhost:5000
You should see: `{"message":"🏠 Real Estate CRM API Running!"}`

\---

### 6️⃣ Setup Frontend

Open a **new terminal tab** and run:

```bash
# Go to frontend folder
cd crm-project/frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Browser will open at: http://localhost:3000

\---

### 7️⃣ Login to the App

```
URL:      http://localhost:3000
Email:    admin@crm.com
Password: admin123
```

\---

## 🔌 API Endpoints Reference

### Auth

|Method|Endpoint|Description|
|-|-|-|
|POST|/api/auth/login|Login user|
|POST|/api/auth/register|Register new user|

### Leads

|Method|Endpoint|Description|
|-|-|-|
|GET|/api/leads|Get all leads|
|POST|/api/leads|Create lead|
|PUT|/api/leads/:id|Update lead|
|DELETE|/api/leads/:id|Delete lead|
|GET|/api/leads/stats/summary|Lead stats|

### Properties

|Method|Endpoint|Description|
|-|-|-|
|GET|/api/properties|Get all (with filters)|
|POST|/api/properties|Add property|
|PUT|/api/properties/:id|Update property|
|DELETE|/api/properties/:id|Delete property|

### Deals

|Method|Endpoint|Description|
|-|-|-|
|GET|/api/deals|Get all deals|
|POST|/api/deals|Create deal|
|PUT|/api/deals/:id/stage|Move deal to next stage|
|DELETE|/api/deals/:id|Delete deal|
|GET|/api/deals/stats/summary|Revenue \& commission|

### Clients

|Method|Endpoint|Description|
|-|-|-|
|GET|/api/clients|Get all clients|
|POST|/api/clients|Add client|
|GET|/api/clients/:id/interactions|Get interaction log|
|POST|/api/clients/:id/interactions|Log interaction|

\---

## ❌ Common Errors \& Fixes

|Error|Fix|
|-|-|
|`ECONNREFUSED` on DB|PostgreSQL not running. Start pgAdmin or run `pg\_ctl start`|
|`password authentication failed`|Wrong password in `.env` file|
|`relation does not exist`|Schema not run. Run `schema.sql` again|
|`npm not found`|Node.js not installed|
|Frontend blank page|Check browser console for errors (F12)|
|CORS error|Make sure backend is running on port 5000|

\---

## 🔑 Default Login Credentials

* Email: `admin@crm.com`
* Password: `admin123`

> ⚠️ Change these in production!

\---

## 🚀 Optional: Deploy to Internet (Free)

* **Backend** → https://render.com (free tier)
* **Frontend** → https://vercel.com (free tier)
* **Database** → https://neon.tech (free PostgreSQL)

