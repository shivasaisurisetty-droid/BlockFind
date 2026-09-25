# BlockFind – Lost and Found Asset Management System

> **Enterprise Cryptographic Asset Recovery & Provenance Platform**  
> *A secure, transparent platform for managing lost and found assets with trusted ownership verification, tamper-evident blockchain provenance, and cloud-native architecture.*

---

## 🌟 Executive Summary

Traditional lost-and-found operations suffer from fraudulent claims, manual record tampering, lack of auditability, and poor cross-facility matching. **BlockFind** solves these challenges by combining:
1. **Cryptographic Provenance**: Every registered asset and verified ownership transfer is timestamped and hashed onto an immutable blockchain ledger.
2. **Role-Based Access Control (RBAC)**: Strict separation of duties between regular Users, authorized Security Verifiers, and System Administrators.
3. **Smart Matching Engine**: Automated similarity matching comparing category, location, and hardware descriptors between lost alerts and found item deposits.
4. **Zero-Knowledge Evidence Inspection**: Sensitive invoices and proof documents are verified by authorized verifiers without leaking personal data on-chain.
5. **AWS Cloud-Native Readiness**: Multi-tier architecture designed for deployment on AWS EC2, Amazon RDS PostgreSQL, Amazon S3, and Elastic Load Balancers.

---

## 👥 Demo Accounts (1-Click Login Available)

The login screen includes quick 1-click demo login buttons for seamless testing and evaluation:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Regular User** | `user@blockfind.demo` | `User@123` | Asset Registration, Report Lost, Submit Claims, Search |
| **Verifier (Security Cell)** | `verifier@blockfind.demo` | `Verifier@123` | Claim Review, Evidence Inspection, Ownership Approval |
| **System Admin (Dean / CIO)** | `admin@blockfind.demo` | `Admin@123` | Analytics, User Privilege Management, Audit Logs |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend**: Node.js, Express.js, Prisma ORM, JWT, bcryptjs, Multer
- **Database**: SQLite (default local zero-dependency run) / PostgreSQL (AWS RDS ready)
- **Blockchain**: Solidity (`AssetTracker.sol`), Hardhat, ethers.js, SHA-256 Ledger Abstraction
- **Cloud Architecture**: AWS EC2, RDS PostgreSQL, S3, Application Load Balancer, CloudWatch

---

## 🚀 Quick Start & Local Execution

### 1. Prerequisites
- Node.js (v18+ or v24 LTS recommended)
- npm (v10+)

### 2. Installation
From the root directory:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Database Initialization & Seeding
```bash
cd server
npx prisma db push
node prisma/seed.js
```
*This populates realistic users, registered assets, lost reports, found items, claims, and complete blockchain transaction blocks.*

### 4. Running the Application
From the root directory:
```bash
npm run dev
```
Or in separate terminals:
- **Backend API**: `cd server && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend App**: `cd client && npm run dev` (Runs on `http://localhost:5173`)

---

## 📱 System Tour & Feature Walkthrough

Follow this step-by-step walkthrough to explore the full BlockFind workflow:

1. **Landing Page (`/`)**:
   - Showcase the SaaS hero, the 4-stage workflow (Register $\to$ Report $\to$ Verify $\to$ Recover), and the live "Blockchain Active" telemetry.
2. **1-Click Login as User (`/login`)**:
   - Click the **"User"** quick-login chip (`user@blockfind.demo`).
   - View the User Dashboard showing active registered assets and live blockchain telemetry.
3. **Register a New Asset (`/register-asset`)**:
   - Register a device (e.g. *Dell Inspiron 15*, Serial `DL-INSP-2026-001`).
   - Observe the instant generation of the unique Asset ID (`BF-LAP-XXXXX`) and confirmed Genesis Block receipt.
4. **Report an Asset as Lost (`/report-lost`)**:
   - Select the registered asset, enter lost location (e.g. *Central Library 2nd Floor*), and submit.
   - Show the generated Lost Report confirmation ID (`LR-2026-XXXX`).
5. **Search & Smart Matching (`/search`)**:
   - Search for "Dell" or "Library".
   - Demonstrate the **Smart Matching score (94% Match Potential)** connecting the lost item to a found item deposit.
6. **Submit an Ownership Claim (`/claims`)**:
   - Click "Claim Ownership" on the found item deposit.
   - Enter claim reason, serial number verification, and invoice proof.
7. **Switch to Verifier Account (`verifier@blockfind.demo`)**:
   - Open the Claims Queue (`/claims`).
   - Open the **Evidence Inspector Modal** to review the claimant's proof and serial numbers.
   - Click **[Approve Claim & Transfer Ownership]** with security remarks.
   - Observe the real-time creation of an on-chain ownership transfer transaction.
8. **Blockchain Verification Explorer (`/blockchain`)**:
   - Explore the newly minted block and transaction stream.
   - Use the **Cryptographic SHA-256 Validator** to input the Tx Hash and prove 100% data integrity without tampering.
9. **Admin Dashboard & Audit Logs (`/admin` & `/audit-logs`)**:
   - Log in as `admin@blockfind.demo`.
   - Review live Recharts incident trends, category breakdowns, user role management, and the system audit trail.

---

## 🌐 REST API Endpoints Reference

### Authentication
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Authenticate user and receive JWT
- `GET /api/auth/me` – Fetch current user profile

### Assets
- `GET /api/assets` – Query asset registry with filters
- `GET /api/assets/my` – Get current user's registered assets
- `GET /api/assets/:id` – Detailed asset view with provenance history
- `POST /api/assets` – Register new asset with blockchain genesis block

### Lost & Found Reports
- `GET /api/lost-reports` – Query lost reports
- `POST /api/lost-reports` – File lost asset incident
- `GET /api/found-reports` – Query found item registry
- `POST /api/found-reports` – Log found item in custody

### Claims & Verification
- `GET /api/claims` – List claims (role filtered)
- `GET /api/claims/:id` – View claim evidence and history
- `POST /api/claims` – Submit ownership claim
- `PUT /api/claims/:id/approve` – Verifier approval & blockchain ownership transfer
- `PUT /api/claims/:id/reject` – Verifier rejection with remarks

### Blockchain Ledger
- `GET /api/blockchain/stats` – Network telemetry and consensus stats
- `GET /api/blockchain/blocks` – List all confirmed transaction blocks
- `GET /api/blockchain/asset/:assetId` – Chain of custody for asset
- `POST /api/blockchain/verify-hash` – Real-time SHA-256 hash validator

### Admin & Auditing
- `GET /api/admin/statistics` – Aggregated chart metrics and KPIs
- `GET /api/admin/users` – User management list
- `PUT /api/admin/users/:id/role` – Update user privileges (USER / VERIFIER / ADMIN)
- `GET /api/audit-logs` – Chronological audit events trail

---

## 🔒 Security & Privacy Practices

- **Zero PII on Chain**: Personal data, contact numbers, and invoice images are strictly stored in off-chain databases and encrypted S3 vaults; only pseudonymized cryptographic hashes are recorded on-chain.
- **Bcrypt Salt Hashing**: User passwords hashed with 10 salt rounds.
- **JWT RBAC Middleware**: Strict role authorization on state-changing endpoints.
- **Prisma SQL Injection Protection**: Parameterized queries across all database operations.

---

## 📜 License
MIT License © 2026 Shiva Sai. All rights reserved.

