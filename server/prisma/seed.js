const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function generateTxHash(seed) {
  return `0x${sha256(seed + Math.random().toString())}`;
}

function generateEthAddress(identifier) {
  return `0x${sha256(identifier).substring(0, 40)}`;
}

async function main() {
  console.log('🌱 Starting database seeding for BlockFind...');

  // Clear existing records in correct foreign key order
  await prisma.caseResolution.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.blockchainTransaction.deleteMany();
  await prisma.ownershipHistory.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.foundReport.deleteMany();
  await prisma.lostReport.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing database tables.');

  const salt = await bcrypt.genSalt(10);
  const userPasswordHash = await bcrypt.hash('User@123', salt);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const verifierPasswordHash = await bcrypt.hash('Verifier@123', salt);
  const defaultPasswordHash = await bcrypt.hash('Demo@123', salt);

  // 1. Create Users
  const userRegular = await prisma.user.create({
    data: {
      id: 'usr-001',
      name: 'Varun Sharma',
      email: 'user@blockfind.demo',
      passwordHash: userPasswordHash,
      role: 'USER',
      phone: '+91 98765 43210',
      organization: 'VIT School of Computer Science & Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    }
  });

  const userAdmin = await prisma.user.create({
    data: {
      id: 'usr-admin',
      name: 'Dr. Rajesh Nair',
      email: 'admin@blockfind.demo',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98400 11223',
      organization: 'VIT Campus Security & Infrastructure Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    }
  });

  const userVerifier = await prisma.user.create({
    data: {
      id: 'usr-verifier',
      name: 'Inspector Meenakshi Sundaram',
      email: 'verifier@blockfind.demo',
      passwordHash: verifierPasswordHash,
      role: 'VERIFIER',
      phone: '+91 98844 55667',
      organization: 'VIT Central Security Verification Cell',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  });

  const usersList = [
    { id: 'usr-002', name: 'Aarav Patel', email: 'aarav.patel@vit.demo', role: 'USER', phone: '+91 98231 44556', dept: 'ECE Department' },
    { id: 'usr-003', name: 'Priya Sundar', email: 'priya.sundar@vit.demo', role: 'USER', phone: '+91 97123 99887', dept: 'Mechanical Engg' },
    { id: 'usr-004', name: 'Rohan Gupta', email: 'rohan.gupta@vit.demo', role: 'USER', phone: '+91 99554 11223', dept: 'Information Technology' },
    { id: 'usr-005', name: 'Ananya Roy', email: 'ananya.roy@vit.demo', role: 'USER', phone: '+91 98451 77889', dept: 'Biotechnology' },
    { id: 'usr-006', name: 'Vikram Iyer', email: 'vikram.iyer@vit.demo', role: 'USER', phone: '+91 98112 33445', dept: 'Electrical Sciences' },
    { id: 'usr-007', name: 'Neha Reddy', email: 'neha.reddy@vit.demo', role: 'VERIFIER', phone: '+91 98770 66554', dept: 'Campus Operations Cell' },
    { id: 'usr-008', name: 'Kunal Deshmukh', email: 'kunal.deshmukh@vit.demo', role: 'USER', phone: '+91 98334 55667', dept: 'Civil Engineering' }
  ];

  const createdExtraUsers = [];
  for (const u of usersList) {
    const created = await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        phone: u.phone,
        organization: `VIT - ${u.dept}`
      }
    });
    createdExtraUsers.push(created);
  }

  console.log('✅ Created 10 users with demo credentials.');

  // 2. Create 15 Registered Assets
  const assetsData = [
    {
      id: 'BF-LAP-00128',
      name: 'Dell Inspiron 15 (Core i7)',
      category: 'LAPTOP',
      serialNumber: 'DL-INSP-2026-001',
      description: 'Black Dell laptop with a small scratch near the touchpad and a GitHub sticker on the back.',
      status: 'LOST',
      ownerId: userRegular.id,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-LAP-00129',
      name: 'Apple MacBook Air M2 13.6"',
      category: 'LAPTOP',
      serialNumber: 'C02GK99P0MD6',
      description: 'Midnight blue finish, 16GB RAM, space grey hard shell casing.',
      status: 'REGISTERED',
      ownerId: createdExtraUsers[0].id,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-PHN-00130',
      name: 'iPhone 15 Pro Titanium Black',
      category: 'PHONE',
      serialNumber: 'IMEI-358920119283120',
      description: '128GB Black Titanium in matte Spigen armor case with cracked glass screen protector.',
      status: 'LOST',
      ownerId: createdExtraUsers[1].id,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-ELE-00131',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      category: 'ELECTRONICS',
      serialNumber: 'SN-SONY-XM5-9921',
      description: 'Silver wireless noise cancelling headphones in official black zippered carry case.',
      status: 'FOUND',
      ownerId: createdExtraUsers[2].id,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-BAG-00132',
      name: 'Samsonite Xenon 3.0 Laptop Backpack',
      category: 'BAG',
      serialNumber: 'TAG-SAM-2026-X3',
      description: 'Black ballistic nylon backpack containing engineering textbooks and stationary pouch.',
      status: 'REGISTERED',
      ownerId: userRegular.id,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-ELE-00133',
      name: 'iPad Air 5th Gen (Space Gray)',
      category: 'ELECTRONICS',
      serialNumber: 'DMPZK87NQ16M',
      description: 'Space Gray 64GB iPad Air with attached Apple Pencil 2nd Gen and smart folio cover.',
      status: 'CLAIM_PENDING',
      ownerId: createdExtraUsers[3].id,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-DOC-00134',
      name: 'Leather Executive Wallet with Driving License',
      category: 'DOCUMENTS',
      serialNumber: 'VIT-ID-21BCE1092',
      description: 'Brown Wildhorn leather wallet containing Tamil Nadu Driving License and VIT Student ID.',
      status: 'VERIFIED',
      ownerId: createdExtraUsers[4].id,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-KEY-00135',
      name: 'Royal Enfield Meteor 350 Smart Key Fob',
      category: 'KEYS',
      serialNumber: 'RE-KEY-88219A',
      description: 'Black electronic key fob with brass keychain engraved with "Ride Pure".',
      status: 'REGISTERED',
      ownerId: userRegular.id,
      image: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-ELE-00136',
      name: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'ELECTRONICS',
      serialNumber: 'CAS-CW-991-0021',
      description: 'Black scientific calculator with user name "Varun S." scratched on battery compartment.',
      status: 'RETURNED',
      ownerId: userRegular.id,
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-PHN-00137',
      name: 'Samsung Galaxy S24 Ultra Titanium Violet',
      category: 'PHONE',
      serialNumber: 'R5CW31998A',
      description: '256GB Titanium Violet with embedded S-Pen and OtterBox clear case.',
      status: 'REGISTERED',
      ownerId: createdExtraUsers[0].id,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-LAP-00138',
      name: 'Lenovo Legion 5 Pro Gaming Laptop',
      category: 'LAPTOP',
      serialNumber: 'PF209XA1',
      description: 'Storm Grey metal chassis, 300W power brick, RGB keyboard with Dota 2 decal.',
      status: 'LOST',
      ownerId: createdExtraUsers[2].id,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-ELE-00139',
      name: 'Kindle Paperwhite 11th Gen (32GB Signature)',
      category: 'ELECTRONICS',
      serialNumber: 'G001LG12345678',
      description: 'Agave Green waterproof e-reader with cork protective standing cover.',
      status: 'REGISTERED',
      ownerId: createdExtraUsers[3].id,
      image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-BAG-00140',
      name: 'Wildcraft Trailhead 45L Rucksack',
      category: 'BAG',
      serialNumber: 'WC-TR45-2026',
      description: 'Navy blue and fluorescent orange hiking bag with rain cover attached.',
      status: 'REGISTERED',
      ownerId: createdExtraUsers[4].id,
      image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-KEY-00141',
      name: 'Hyundai Creta Smart Proximity Key',
      category: 'KEYS',
      serialNumber: 'HYU-SMK-2024-819',
      description: '3-button chrome-trimmed remote key with red leather loop.',
      status: 'FOUND',
      ownerId: userAdmin.id,
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'BF-DOC-00142',
      name: 'Passport & Academic Degree Certificate Folder',
      category: 'DOCUMENTS',
      serialNumber: 'IND-DOC-982110',
      description: 'Navy blue folder with gold embossed seal containing original 10th/12th marksheets and passport.',
      status: 'REGISTERED',
      ownerId: createdExtraUsers[1].id,
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
    }
  ];

  let currentBlockNumber = 1000;

  for (const a of assetsData) {
    currentBlockNumber += 1;
    const txHash = generateTxHash(a.id);
    const owner = usersList.find(u => u.id === a.ownerId) || userRegular;
    const fromAddr = generateEthAddress(owner.email || owner.id);

    const asset = await prisma.asset.create({
      data: {
        id: a.id,
        name: a.name,
        category: a.category,
        serialNumber: a.serialNumber,
        description: a.description,
        status: a.status,
        currentOwnerId: a.ownerId,
        primaryImageUrl: a.image,
        blockchainTxHash: txHash,
        registeredAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      }
    });

    // Create Initial Blockchain Tx
    await prisma.blockchainTransaction.create({
      data: {
        txHash,
        blockNumber: currentBlockNumber,
        assetId: asset.id,
        actionType: 'ASSET_REGISTERED',
        fromAddress: fromAddr,
        toAddress: '0x8f3c7890a542b1034f31c890123ef45a8921bf77',
        payloadHash: sha256(asset),
        blockTimestamp: asset.registeredAt,
        networkName: 'Demo Blockchain Environment',
        status: 'CONFIRMED',
        rawData: JSON.stringify({
          event: 'AssetRegistered',
          assetId: asset.id,
          serialHash: sha256(asset.serialNumber || 'N/A'),
          ownerAddress: fromAddr,
          blockNumber: currentBlockNumber,
          gasUsed: '42,150 Gwei'
        })
      }
    });

    // Initial Ownership History
    await prisma.ownershipHistory.create({
      data: {
        assetId: asset.id,
        newOwnerId: a.ownerId,
        transferType: 'INITIAL_REGISTRATION',
        transferReason: 'Asset creation on blockchain registry',
        blockchainTxHash: txHash,
        timestamp: asset.registeredAt
      }
    });

    // Initial Audit Log
    await prisma.auditLog.create({
      data: {
        eventType: 'ASSET_REGISTERED',
        userId: a.ownerId,
        assetId: asset.id,
        details: `Asset ${asset.name} (${asset.id}) registered onto BlockFind Ledger.`,
        blockchainTxHash: txHash,
        createdAt: asset.registeredAt
      }
    });
  }

  console.log('✅ Created 15 registered assets with blockchain genesis records.');

  // 3. Create 8 Lost Reports
  const lostReportsData = [
    {
      id: 'LR-2026-0001',
      assetId: 'BF-LAP-00128',
      itemName: 'Dell Inspiron 15 Laptop',
      category: 'LAPTOP',
      description: 'Left in Central Library 2nd Floor Study Room Desk #42 around 3:30 PM.',
      lastKnownLocation: 'Central Library, 2nd Floor Study Area',
      dateLost: '2026-08-28',
      approximateTime: '15:30',
      additionalInfo: 'Laptop bag had my blue spiral notebook and charger.',
      reporterId: userRegular.id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0002',
      assetId: 'BF-PHN-00130',
      itemName: 'iPhone 15 Pro Titanium Black',
      category: 'PHONE',
      description: 'Slipped out of jacket pocket near Technology Tower Food Court benches.',
      lastKnownLocation: 'Tech Tower Food Court',
      dateLost: '2026-08-29',
      approximateTime: '13:15',
      additionalInfo: 'Lock screen has photo of golden retriever dog.',
      reporterId: createdExtraUsers[1].id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0003',
      assetId: 'BF-LAP-00138',
      itemName: 'Lenovo Legion 5 Pro Gaming Laptop',
      category: 'LAPTOP',
      description: 'Left on Table 8 at Anna Auditorium Lab during the AI Hackathon.',
      lastKnownLocation: 'Anna Auditorium Hackathon Zone',
      dateLost: '2026-08-30',
      approximateTime: '18:45',
      additionalInfo: 'Sticker with "Neural Network" on top shell.',
      reporterId: createdExtraUsers[2].id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0004',
      assetId: null,
      itemName: 'Apple AirPods Pro 2 with USB-C Case',
      category: 'ELECTRONICS',
      description: 'White AirPods Pro in a matte olive green silicon case with carabiner clip.',
      lastKnownLocation: 'Gymnasium & Indoor Sports Complex',
      dateLost: '2026-08-27',
      approximateTime: '07:30',
      additionalInfo: 'Serial number engraved on inner lid.',
      reporterId: createdExtraUsers[0].id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0005',
      assetId: null,
      itemName: 'Titan Neo Analog Watch with Silver Strap',
      category: 'ELECTRONICS',
      description: 'Classic silver dial watch with metal link strap forgotten in chemistry laboratory locker.',
      lastKnownLocation: 'SMEC Lab 304, Mechanical Block',
      dateLost: '2026-08-25',
      approximateTime: '11:00',
      additionalInfo: 'Engraved with initials "V.S." on the back clasp.',
      reporterId: userRegular.id,
      status: 'RESOLVED',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0006',
      assetId: null,
      itemName: 'Fastrack Blue Polarized Sunglasses',
      category: 'OTHER',
      description: 'Matte black frame with blue reflective polarized lenses in a fabric pouch.',
      lastKnownLocation: 'Main Cafeteria Outdoor Seating',
      dateLost: '2026-08-29',
      approximateTime: '14:20',
      additionalInfo: 'Left on wooden picnic table #3.',
      reporterId: createdExtraUsers[3].id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0007',
      assetId: null,
      itemName: 'Spiral Bound Computer Architecture Notes & Flash Drive',
      category: 'DOCUMENTS',
      description: 'A4 size 200-page notebook with hand-written notes and a 64GB SanDisk red flash drive.',
      lastKnownLocation: 'SJT Lecture Hall 401',
      dateLost: '2026-08-30',
      approximateTime: '16:00',
      additionalInfo: 'Name "Priya Sundar" on first page.',
      reporterId: createdExtraUsers[1].id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'LR-2026-0008',
      assetId: null,
      itemName: 'Sony Alpha 6400 Camera Lens Cap (49mm)',
      category: 'ELECTRONICS',
      description: 'Original black Sony front lens cap with pinch mechanism.',
      lastKnownLocation: 'Outdoor Amphitheater Green Lawn',
      dateLost: '2026-08-26',
      approximateTime: '17:50',
      additionalInfo: 'Lost during photography club meet.',
      reporterId: createdExtraUsers[4].id,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
    }
  ];

  for (const lr of lostReportsData) {
    const report = await prisma.lostReport.create({
      data: {
        id: lr.id,
        assetId: lr.assetId,
        itemName: lr.itemName,
        category: lr.category,
        description: lr.description,
        lastKnownLocation: lr.lastKnownLocation,
        dateLost: lr.dateLost,
        approximateTime: lr.approximateTime,
        additionalInfo: lr.additionalInfo,
        imageUrl: lr.image,
        reporterId: lr.reporterId,
        status: lr.status
      }
    });

    await prisma.auditLog.create({
      data: {
        eventType: 'ITEM_REPORTED_LOST',
        userId: lr.reporterId,
        assetId: lr.assetId,
        details: `Lost report ${report.id} registered for "${report.itemName}" at ${report.lastKnownLocation}`,
        createdAt: report.createdAt
      }
    });
  }

  console.log('✅ Created 8 realistic lost reports with audit entries.');

  // 4. Create 6 Found Reports
  const foundReportsData = [
    {
      id: 'FR-2026-0001',
      itemName: 'Dell Inspiron 15 Laptop (Black)',
      category: 'LAPTOP',
      description: 'Black Dell Inspiron laptop found on Desk #42 in Central Library 2nd floor. Turned over to desk.',
      foundLocation: 'Central Library, 2nd Floor Study Area',
      dateFound: '2026-08-28',
      timeFound: '16:00',
      storageLocation: 'Central Library Front Helpdesk - Vault A2',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      reporterId: createdExtraUsers[3].id,
      status: 'AVAILABLE'
    },
    {
      id: 'FR-2026-0002',
      itemName: 'Sony WH-1000XM5 Wireless Headphones in Black Pouch',
      category: 'ELECTRONICS',
      description: 'Silver wireless Sony headphones found on cafeteria table after lunch rush.',
      foundLocation: 'Main Campus Food Court, Table 14',
      dateFound: '2026-08-29',
      timeFound: '14:00',
      storageLocation: 'Campus Central Security Desk - Main Block',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
      reporterId: createdExtraUsers[4].id,
      status: 'CLAIM_PENDING'
    },
    {
      id: 'FR-2026-0003',
      itemName: 'Wildhorn Leather Wallet with Cards',
      category: 'DOCUMENTS',
      description: 'Brown leather wallet found on stairs of SJT Building. Contains ID cards and currency.',
      foundLocation: 'Silver Jubilee Tower, Staircase B 3rd Floor',
      dateFound: '2026-08-27',
      timeFound: '10:30',
      storageLocation: 'SJT Security Office - Room 102',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      reporterId: createdExtraUsers[0].id,
      status: 'RETURNED'
    },
    {
      id: 'FR-2026-0004',
      itemName: 'Space Gray iPad Air with Apple Pencil',
      category: 'ELECTRONICS',
      description: 'Found under lecture bench in TT 302. Protected with gray smart cover.',
      foundLocation: 'Technology Tower, Room 302',
      dateFound: '2026-08-29',
      timeFound: '17:15',
      storageLocation: 'Campus Central Security Desk - Main Block',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      reporterId: createdExtraUsers[1].id,
      status: 'CLAIM_PENDING'
    },
    {
      id: 'FR-2026-0005',
      itemName: 'Hyundai Smart Key Fob with Red Leather Strap',
      category: 'KEYS',
      description: 'Electronic car key found near Visitor Parking Lot Zone C.',
      foundLocation: 'Visitor Parking Lot Zone C',
      dateFound: '2026-08-30',
      timeFound: '09:00',
      storageLocation: 'Campus Security Gate 1 Post',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      reporterId: userRegular.id,
      status: 'AVAILABLE'
    },
    {
      id: 'FR-2026-0006',
      itemName: 'Casio ClassWiz fx-991EX Scientific Calculator',
      category: 'ELECTRONICS',
      description: 'Scientific calculator found on bench in Physics Hall.',
      foundLocation: 'SMEC Lab Corridor',
      dateFound: '2026-08-26',
      timeFound: '12:45',
      storageLocation: 'Campus Central Security Desk - Main Block',
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      reporterId: createdExtraUsers[2].id,
      status: 'RETURNED'
    }
  ];

  for (const fr of foundReportsData) {
    const report = await prisma.foundReport.create({
      data: {
        id: fr.id,
        itemName: fr.itemName,
        category: fr.category,
        description: fr.description,
        foundLocation: fr.foundLocation,
        dateFound: fr.dateFound,
        timeFound: fr.timeFound,
        storageLocation: fr.storageLocation,
        imageUrl: fr.imageUrl,
        reporterId: fr.reporterId,
        status: fr.status
      }
    });

    await prisma.auditLog.create({
      data: {
        eventType: 'ITEM_REPORTED_FOUND',
        userId: fr.reporterId,
        details: `Found item recorded: "${report.itemName}" (${report.id}) deposited at ${report.storageLocation}`,
        createdAt: report.createdAt
      }
    });
  }

  console.log('✅ Created 6 found reports.');

  // 5. Create 6 Ownership Claims across various workflows
  const claimsData = [
    {
      id: 'CLM-2026-0001',
      foundReportId: 'FR-2026-0001',
      assetId: 'BF-LAP-00128',
      claimantId: userRegular.id,
      claimReason: 'This is my registered Dell Inspiron 15 laptop. I left it on Library 2nd floor desk #42 while taking a phone call.',
      identificationDetails: 'Serial number DL-INSP-2026-001 matches. Desktop wallpaper is Linux Tux penguin. Registered under my Asset ID BF-LAP-00128.',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      additionalProof: 'Original invoice from Dell India Store with invoice #DELL-IND-2024-99812.',
      contactPhone: '+91 98765 43210',
      status: 'PENDING_VERIFICATION',
      verifierId: null,
      remarks: null
    },
    {
      id: 'CLM-2026-0002',
      foundReportId: 'FR-2026-0002',
      assetId: 'BF-ELE-00131',
      claimantId: createdExtraUsers[2].id,
      claimReason: 'I misplaced my Sony XM5 headphones in the food court table 14 while rushing for afternoon lab.',
      identificationDetails: 'Connected to my iPhone "Rohan\'s iPhone". Device Bluetooth MAC address ending in :99:21.',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      additionalProof: 'Sony Headphones Connect app screenshot showing paired device profile.',
      contactPhone: '+91 99554 11223',
      status: 'PENDING_VERIFICATION',
      verifierId: null,
      remarks: null
    },
    {
      id: 'CLM-2026-0003',
      foundReportId: 'FR-2026-0003',
      assetId: 'BF-DOC-00134',
      claimantId: createdExtraUsers[4].id,
      claimReason: 'The wallet belongs to me. It has my college ID 21BCE1092 and driver license.',
      identificationDetails: 'Tamil Nadu DL #TN-23-20210088912 in my name Vikram Iyer.',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      additionalProof: 'DigiLocker verified driving license record.',
      contactPhone: '+91 98112 33445',
      status: 'APPROVED',
      verifierId: userVerifier.id,
      remarks: 'Verified claimant college ID and government Driving License against DigiLocker portal. Identity confirmed 100%.'
    },
    {
      id: 'CLM-2026-0004',
      foundReportId: 'FR-2026-0004',
      assetId: 'BF-ELE-00133',
      claimantId: createdExtraUsers[3].id,
      claimReason: 'This iPad Air is mine. Left it in TT 302 after Machine Learning lecture.',
      identificationDetails: 'Passcode is 6-digits. Linked to Apple ID ananya.roy@vit.demo with family sharing active.',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      additionalProof: 'Apple Care receipt with device serial DMPZK87NQ16M.',
      contactPhone: '+91 98451 77889',
      status: 'PENDING_VERIFICATION',
      verifierId: null,
      remarks: null
    },
    {
      id: 'CLM-2026-0005',
      foundReportId: 'FR-2026-0006',
      assetId: 'BF-ELE-00136',
      claimantId: userRegular.id,
      claimReason: 'My Casio fx-991EX calculator left in physics hall.',
      identificationDetails: 'My initials "Varun S." are engraved on the back casing lid.',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      additionalProof: 'Amazon order invoice dated July 2024.',
      contactPhone: '+91 98765 43210',
      status: 'APPROVED',
      verifierId: userVerifier.id,
      remarks: 'Physical inspection verified engraved name matches user profile and purchase invoice.'
    },
    {
      id: 'CLM-2026-0006',
      foundReportId: 'FR-2026-0005',
      assetId: null,
      claimantId: createdExtraUsers[0].id,
      claimReason: 'Claiming car keys found at parking lot.',
      identificationDetails: 'Claimed to be keys for a red sedan.',
      proofDocumentUrl: null,
      additionalProof: 'Could not provide vehicle registration number or remote synchronization.',
      contactPhone: '+91 98231 44556',
      status: 'REJECTED',
      verifierId: userVerifier.id,
      remarks: 'Vehicle registration details provided by claimant did not correspond to key RFID frequency. Claim rejected due to lack of authentic proof.'
    }
  ];

  for (const c of claimsData) {
    const claim = await prisma.claim.create({
      data: {
        id: c.id,
        foundReportId: c.foundReportId,
        assetId: c.assetId,
        claimantId: c.claimantId,
        claimReason: c.claimReason,
        identificationDetails: c.identificationDetails,
        proofDocumentUrl: c.proofDocumentUrl,
        additionalProof: c.additionalProof,
        contactPhone: c.contactPhone,
        status: c.status,
        verifierId: c.verifierId,
        verificationRemarks: c.remarks,
        verifiedAt: c.status !== 'PENDING_VERIFICATION' ? new Date() : null
      }
    });

    await prisma.auditLog.create({
      data: {
        eventType: 'CLAIM_SUBMITTED',
        userId: c.claimantId,
        assetId: c.assetId,
        details: `Ownership claim ${claim.id} submitted for found item ${c.foundReportId}`,
        createdAt: claim.createdAt
      }
    });

    if (c.status === 'APPROVED') {
      currentBlockNumber += 1;
      const transferTxHash = generateTxHash(c.id);

      await prisma.blockchainTransaction.create({
        data: {
          txHash: transferTxHash,
          blockNumber: currentBlockNumber,
          assetId: c.assetId,
          actionType: 'OWNERSHIP_TRANSFERRED',
          fromAddress: generateEthAddress(userVerifier.email),
          toAddress: generateEthAddress(c.claimantId),
          payloadHash: sha256({ claimId: c.id, claimant: c.claimantId, remarks: c.remarks }),
          blockTimestamp: new Date(),
          networkName: 'Demo Blockchain Environment',
          status: 'CONFIRMED',
          rawData: JSON.stringify({
            event: 'OwnershipTransferred',
            assetId: c.assetId,
            claimId: c.id,
            verifiedBy: userVerifier.name,
            blockNumber: currentBlockNumber,
            timestamp: new Date().toISOString()
          })
        }
      });

      await prisma.auditLog.create({
        data: {
          eventType: 'CLAIM_APPROVED',
          userId: userVerifier.id,
          assetId: c.assetId,
          details: `Claim ${claim.id} verified and approved by ${userVerifier.name}. Remarks: ${c.remarks}`,
          blockchainTxHash: transferTxHash
        }
      });

      await prisma.auditLog.create({
        data: {
          eventType: 'OWNERSHIP_TRANSFERRED',
          userId: userVerifier.id,
          assetId: c.assetId,
          details: `Ownership transferred to claimant for Asset ${c.assetId}`,
          blockchainTxHash: transferTxHash
        }
      });
    } else if (c.status === 'REJECTED') {
      await prisma.auditLog.create({
        data: {
          eventType: 'CLAIM_REJECTED',
          userId: userVerifier.id,
          assetId: c.assetId,
          details: `Claim ${claim.id} rejected by ${userVerifier.name}. Reason: ${c.remarks}`
        }
      });
    }
  }

  console.log('✅ Created 6 claims with blockchain state transitions.');

  // 6. Create realistic notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userRegular.id,
        title: 'Lost Asset Report Registered',
        message: 'Your lost report for "Dell Inspiron 15" (LR-2026-0001) is active. We are matching against newly deposited items.',
        type: 'INFO',
        isRead: true,
        linkUrl: '/lost-reports/LR-2026-0001'
      },
      {
        userId: userRegular.id,
        title: 'Potential Match Found! 🎯',
        message: 'A found item "Dell Inspiron 15 Laptop (Black)" (FR-2026-0001) has been deposited at Central Library Helpdesk with a 98% match score.',
        type: 'SUCCESS',
        isRead: false,
        linkUrl: '/found-reports/FR-2026-0001'
      },
      {
        userId: userRegular.id,
        title: 'Claim Verification Under Review',
        message: 'Your ownership claim CLM-2026-0001 has been queued for verification by campus security.',
        type: 'ACTION_REQUIRED',
        isRead: false,
        linkUrl: '/claims/CLM-2026-0001'
      },
      {
        userId: userVerifier.id,
        title: '3 Ownership Claims Pending Review',
        message: 'There are 3 pending claims awaiting evidence verification in the queue.',
        type: 'ACTION_REQUIRED',
        isRead: false,
        linkUrl: '/claims'
      },
      {
        userId: userAdmin.id,
        title: 'BlockFind System Operational',
        message: 'All 15 blockchain smart ledger blocks verified intact. Zero tampering detected.',
        type: 'INFO',
        isRead: true,
        linkUrl: '/blockchain'
      }
    ]
  });

  // 7. Demo Scenario (Requirement 22): Samsung Galaxy Buds Unregistered Lost & Found
  const demoLostBuds = await prisma.lostReport.create({
    data: {
      id: 'LR-2026-0009',
      assetId: null, // UNREGISTERED ASSET (Workflow B)
      itemName: 'Black Samsung Galaxy Buds',
      category: 'ELECTRONICS',
      description: 'Black charging case with a small scratch near the USB-C port and blue replacement silicone ear tips inside.',
      lastKnownLocation: 'VIT Campus Food Court Benches',
      dateLost: '2026-08-30',
      approximateTime: '14:30',
      additionalInfo: 'Misplaced while studying for exams.',
      reporterId: userRegular.id,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    }
  });

  const demoFoundBuds = await prisma.foundReport.create({
    data: {
      id: 'FR-2026-0007',
      itemName: 'Black Samsung Galaxy Buds',
      category: 'ELECTRONICS',
      description: 'Found black Samsung Galaxy Buds in charging case on food court bench.',
      foundLocation: 'VIT Campus Food Court',
      dateFound: '2026-08-30',
      timeFound: '15:15',
      storageLocation: 'Campus Security Desk - Main Block',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      reporterId: createdExtraUsers[0].id, // Aarav Patel
      status: 'AVAILABLE'
    }
  });

  // Create Anonymous Conversation between User 1 (Varun) and User 2 (Aarav Patel)
  const demoConversation = await prisma.conversation.create({
    data: {
      lostReportId: demoLostBuds.id,
      foundReportId: demoFoundBuds.id,
      participantOneId: userRegular.id, // Lost Item Owner
      participantTwoId: createdExtraUsers[0].id, // Finder
      status: 'ACTIVE'
    }
  });

  // Create Seed Messages in thread
  await prisma.message.createMany({
    data: [
      {
        conversationId: demoConversation.id,
        senderId: null,
        messageType: 'SYSTEM',
        content: '🔒 Secure Anonymous Conversation initialized. Personal contact numbers and real names are concealed for privacy. Use the verification tools above to confirm item ownership.',
        createdAt: new Date(Date.now() - 40 * 60 * 1000)
      },
      {
        conversationId: demoConversation.id,
        senderId: userRegular.id,
        messageType: 'TEXT',
        content: 'Hello! I saw your found report. I believe these are my Black Samsung Galaxy Buds that I misplaced at the food court on 30 August.',
        createdAt: new Date(Date.now() - 35 * 60 * 1000)
      },
      {
        conversationId: demoConversation.id,
        senderId: createdExtraUsers[0].id,
        messageType: 'TEXT',
        content: 'Hi! I have a pair in custody. Could you describe what the charging case looks like or any specific marks?',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        conversationId: demoConversation.id,
        senderId: userRegular.id,
        messageType: 'TEXT',
        content: 'Yes, it has a distinct scratch right near the USB-C charging port on the rear, and the earbuds have custom blue silicone tips.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        conversationId: demoConversation.id,
        senderId: createdExtraUsers[0].id,
        messageType: 'IMAGE',
        content: 'Here is a photo of the case I found. Does this scratch match yours?',
        attachmentUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        conversationId: demoConversation.id,
        senderId: userRegular.id,
        messageType: 'TEXT',
        content: 'Yes, that is 100% my case! The scratch matches exactly.',
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]
  });

  // Create active verification request
  await prisma.verificationRequest.create({
    data: {
      conversationId: demoConversation.id,
      requestedBy: createdExtraUsers[0].id,
      checklistItems: JSON.stringify([
        'Describe a unique physical characteristic',
        'Provide serial/device information',
        'Provide purchase proof'
      ]),
      evidenceDescription: 'Claimant correctly identified the unique scratch near the charging port and blue silicone tips. Serial ending in #9981.',
      status: 'PENDING'
    }
  });

  console.log('✅ Created demo Samsung Galaxy Buds conversation scenario.');
  console.log('✅ Created initial user & admin notifications.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
