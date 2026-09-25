# BlockFind: Technical & Cloud Architecture Blueprint

## 1. Executive Architecture Overview

**BlockFind** is designed as a highly scalable, multi-tier enterprise architecture combining cloud-native AWS services for web application workloads with a decoupled Ethereum-compatible blockchain layer for immutable ownership provenance and fraud prevention.

```
                                +-------------------------------------------+
                                |               Users / Clients             |
                                |     (Browser / Mobile Web / MetaMask)     |
                                +---------------------+---------------------+
                                                      |
                                                      v
                                        +-------------+-------------+
                                        |    Amazon Route 53 (DNS)  |
                                        +-------------+-------------+
                                                      |
                               +----------------------+----------------------+
                               |                                             |
                               v                                             v
                 +-------------+-------------+                 +-------------+-------------+
                 |    Amazon CloudFront CDN  |                 | AWS WAF (Web App Firewall)|
                 +-------------+-------------+                 +-------------+-------------+
                               |                                             |
                               v                                             v
                 +-------------+-------------+                 +-------------+-------------+
                 |   Amazon S3 (SPA Frontend)|                 | Application Load Balancer |
                 |     Static React Build    |                 |   (AWS ALB - SSL/TLS)     |
                 +---------------------------+                 +-------------+-------------+
                                                                             |
                                                                             v
                                                               +-------------+-------------+
                                                               |  AWS Auto Scaling Group   |
                                                               | (Node.js/Express on EC2)  |
                                                               +------+--------------+-----+
                                                                      |              |
                                      +-------------------------------+              +-------------------------------+
                                      |                                                                              |
                                      v                                                                              v
                        +-------------+-------------+                                                  +-------------+-------------+
                        |  Amazon RDS Multi-AZ      |                                                  |   Amazon S3 Asset Vault   |
                        |   (PostgreSQL Database)   |                                                  |  (Encrypted Proof Media)  |
                        +---------------------------+                                                  +---------------------------+
                                      |
                                      v
                        +-------------+-------------+
                        |    Blockchain Adapter     |
                        |  (Web3.js / Ethers.js)    |
                        +-------------+-------------+
                                      |
                                      v
                        +-------------+-------------+
                        |  Decentralized Ledger     |
                        | (Solidity / Sepolia / PoA)|
                        +---------------------------+
```

---

## 2. Layer-by-Layer Cloud Design (AWS Readiness)

### Tier 1: Client & Content Delivery
- **Amazon CloudFront**: Global edge caching with low latency delivery of SPA bundle.
- **Amazon S3**: High-durability hosting for the compiled React static bundle with public read restricted exclusively to CloudFront Origin Access Control (OAC).

### Tier 2: Application Routing & Compute
- **Application Load Balancer (ALB)**: Distributes inbound HTTPS traffic across multi-AZ compute targets with automated health checks (`/api/health`).
- **Amazon EC2 (Auto Scaling Group)**: Containerized or PM2-managed Node.js/Express instances spanning multiple Availability Zones (us-east-1a, us-east-1b) with dynamic scaling policies based on CPU utilization and request count.

### Tier 3: Relational Persistence Layer
- **Amazon RDS for PostgreSQL (Multi-AZ)**:
  - Primary instance with synchronous standby replica in a secondary AZ for automated failover.
  - Automated continuous backups with 30-day point-in-time recovery.
  - Data encryption at rest using AWS Key Management Service (AWS KMS).

### Tier 4: Object Storage & Digital Vault
- **Amazon S3 Asset & Evidence Vault**:
  - Secure storage for lost/found photos and purchase receipts.
  - Pre-signed URLs for authenticated, time-limited uploads and downloads.
  - S3 Lifecycle rules transitioning older media to S3 Glacier Flexible Retrieval.

### Tier 5: Security & Observability
- **AWS IAM**: Least-privilege execution roles for EC2 instances avoiding hardcoded credentials.
- **AWS Secrets Manager**: Automated rotation for JWT secrets and database connection strings.
- **Amazon CloudWatch**: Centralized log streaming, metric alarms, and API response time tracking.

---

## 3. Blockchain Decoupled Architecture

```
+-----------------------------------------------------------------------------------+
|                            BlockFind Backend Service                              |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                          IBlockchainService (Interface)                     |  |
|  |  + registerAsset()  + transferOwnership()  + verifyHash()  + getHistory()   |  |
|  +---------------------------------------+-------------------------------------+  |
+------------------------------------------|----------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
    +---------------+---------------+             +---------------+---------------+
    |     DemoBlockchainService     |             |      HardhatWeb3Service       |
    | (Local Cryptographic SHA-256) |             | (Ethers.js / Smart Contracts) |
    |   - Deterministic Block Hashing|             |   - AssetTracker.sol on Sepolia|
    |   - Merkle Integrity Checks    |             |   - MetaMask Web3 Injected    |
    |   - Zero-Dependency Demo Mode  |             |   - Gas Estimation & Events   |
    +-------------------------------+             +-------------------------------+
```

### Smart Contract Specification (`AssetTracker.sol`)
1. **Asset Immutability**: On-chain records only store cryptographic hashes (`serialHash`, `metadataURI`, `ownerAddress`) — strictly preserving user confidentiality (GDPR / Indian DPDP Act compliant).
2. **Access Control**: State changes (status reports, claim verifications) are gated by `onlyAuthorizedVerifier` and `onlyAssetOwner` modifiers.
3. **Atomic Ownership Transfer**: Verifier approval executes an on-chain ownership update and emits an `OwnershipTransferred` event.

---

## 4. Core Problem Solving & Value Matrix

| Traditional Lost & Found Deficiency | BlockFind Solution | Technical Implementation |
|---|---|---|
| **Fraudulent Claims** | Cryptographic proof requirements & serial matching | `CLM` hash checks & `ProofViewerModal` |
| **Data Tampering & Collusion** | Immutable blockchain ledger | SHA-256 block chain & `AssetTracker.sol` |
| **Lack of Transparency** | Publicly auditable verification trail | Dedicated Blockchain Explorer & Audit Logs |
| **Manual & Slow Recovery** | Smart heuristic matching engine | Proximity & Category similarity score |
| **Single Point of Failure** | Distributed AWS multi-tier cloud readiness | Multi-AZ RDS + ALB Auto Scaling architecture |
