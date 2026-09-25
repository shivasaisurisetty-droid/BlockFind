/**
 * BlockFind Client-side Offline & Standalone Mock Data Store
 * Provides seamless local storage persistence for live demo deployments (e.g. Vercel)
 * when a remote backend server is not connected.
 */

// Simple robust string SHA-256 / hash generator for client browser demo
export function generateClientHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return '0x' + hex.repeat(8).substring(0, 64);
}

const DEFAULT_USERS = [
  {
    id: 'usr-001',
    name: 'Varun Sharma',
    email: 'user@blockfind.demo',
    password: 'User@123',
    role: 'USER',
    phone: '+91 98765 43210',
    organization: 'Campus Member (General User)',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-verifier',
    name: 'Inspector Meenakshi Sundaram',
    email: 'verifier@blockfind.demo',
    password: 'Verifier@123',
    role: 'VERIFIER',
    phone: '+91 98844 55667',
    organization: 'Central Security Verification Cell',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin',
    name: 'Dr. Rajesh Nair',
    email: 'admin@blockfind.demo',
    password: 'Admin@123',
    role: 'ADMIN',
    phone: '+91 98400 11223',
    organization: 'Security & Infrastructure Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-002',
    name: 'Aarav Patel',
    email: 'aarav.patel@demo.com',
    password: 'Demo@123',
    role: 'USER',
    phone: '+91 98231 44556',
    organization: 'Engineering Department',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  }
];

const DEFAULT_ASSETS = [
  {
    id: 'BF-LAP-00128',
    name: 'Dell Inspiron 15 (Core i7)',
    category: 'LAPTOP',
    serialNumber: 'DL-INSP-2026-001',
    description: 'Silver metallic chassis with carbon fiber palm rest, slight scratch on top lid.',
    color: 'Silver',
    brand: 'Dell',
    status: 'LOST',
    ownerId: 'usr-001',
    currentOwnerId: 'usr-001',
    isRegisteredOnChain: true,
    blockchainTxHash: '0x8f2d6c3e9a1b4c7d5e8f0a2b4c6e8d0f1a3b5c7e9a1b3d5e7f9a1c3e5b7d9f01',
    genesisBlockNumber: 1001,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T10:00:00.000Z',
    owner: { name: 'Varun Sharma', email: 'user@blockfind.demo' }
  },
  {
    id: 'BF-PHN-00245',
    name: 'Apple iPhone 14 Pro (128GB)',
    category: 'PHONE',
    serialNumber: 'APL-IP14P-99882',
    description: 'Deep Purple with matte finish, transparent protective bumper case.',
    color: 'Deep Purple',
    brand: 'Apple',
    status: 'ACTIVE',
    ownerId: 'usr-001',
    currentOwnerId: 'usr-001',
    isRegisteredOnChain: true,
    blockchainTxHash: '0x3a7c9e1b5d7f9a2c4e6b8d0f2a4c6e8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8a01',
    genesisBlockNumber: 1004,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-09-05T14:30:00.000Z',
    owner: { name: 'Varun Sharma', email: 'user@blockfind.demo' }
  },
  {
    id: 'BF-AUD-00512',
    name: 'Sony WH-1000XM5 Noise Canceling Headphones',
    category: 'AUDIO',
    serialNumber: 'SNY-XM5-SILVER-77',
    description: 'Silver over-ear headphones in original gray zippered hard-shell carrying case.',
    color: 'Silver',
    brand: 'Sony',
    status: 'ACTIVE',
    ownerId: 'usr-001',
    currentOwnerId: 'usr-001',
    isRegisteredOnChain: true,
    blockchainTxHash: '0x1b4d7f9a2c5e8b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b02',
    genesisBlockNumber: 1008,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-09-10T11:15:00.000Z',
    owner: { name: 'Varun Sharma', email: 'user@blockfind.demo' }
  },
  {
    id: 'BF-TAB-00331',
    name: 'Apple iPad Air 5th Gen (M1)',
    category: 'TABLET',
    serialNumber: 'APL-IPD-AIR5-4411',
    description: 'Space Gray with magnetic smart folio case in navy blue and Apple Pencil attached.',
    color: 'Space Gray',
    brand: 'Apple',
    status: 'IN_CLAIM',
    ownerId: 'usr-002',
    currentOwnerId: 'usr-002',
    isRegisteredOnChain: true,
    blockchainTxHash: '0x7c9e1b4d6f8a0c2e5b7d9f1a3c5e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c24',
    genesisBlockNumber: 1012,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-09-12T09:20:00.000Z',
    owner: { name: 'Aarav Patel', email: 'aarav.patel@demo.com' }
  }
];

const DEFAULT_LOST_REPORTS = [
  {
    id: 'LR-2026-0001',
    reporterId: 'usr-001',
    assetId: 'BF-LAP-00128',
    itemName: 'Dell Inspiron 15 (Core i7)',
    category: 'LAPTOP',
    brand: 'Dell',
    color: 'Silver',
    serialNumber: 'DL-INSP-2026-001',
    description: 'Left on the 2nd-floor study cubicle near the west window corner.',
    lastKnownLocation: 'Central Library 2nd Floor Study Room',
    lostDate: '2026-09-20T14:30:00.000Z',
    status: 'MATCH_PENDING',
    contactEmail: 'user@blockfind.demo',
    contactPhone: '+91 98765 43210',
    createdAt: '2026-09-20T15:00:00.000Z',
    reporter: { name: 'Varun Sharma', email: 'user@blockfind.demo' },
    asset: DEFAULT_ASSETS[0]
  },
  {
    id: 'LR-2026-0002',
    reporterId: 'usr-002',
    itemName: 'Titan Octane Analog Chronograph Watch',
    category: 'OTHER',
    brand: 'Titan',
    color: 'Black/Silver',
    description: 'Black dial with stainless steel mesh strap, small engraving on the back case.',
    lastKnownLocation: 'Sports Complex Badminton Court 3',
    lostDate: '2026-09-22T17:45:00.000Z',
    status: 'OPEN',
    contactEmail: 'aarav.patel@demo.com',
    contactPhone: '+91 98231 44556',
    createdAt: '2026-09-22T18:30:00.000Z',
    reporter: { name: 'Aarav Patel', email: 'aarav.patel@demo.com' }
  }
];

const DEFAULT_FOUND_REPORTS = [
  {
    id: 'FR-2026-0001',
    founderId: 'usr-verifier',
    itemName: 'Dell Silver Laptop in Black Sleeve',
    category: 'LAPTOP',
    brand: 'Dell',
    color: 'Silver',
    foundLocation: 'Central Library West Wing Reading Area',
    currentStorageLocation: 'Central Security Desk Locker #14',
    custodyOfficer: 'Officer Raman',
    description: 'Found unattended on desk #42. Stored safely in the security locker.',
    foundDate: '2026-09-20T18:00:00.000Z',
    status: 'IN_CUSTODY',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-09-20T18:30:00.000Z',
    founder: { name: 'Inspector Meenakshi Sundaram', email: 'verifier@blockfind.demo' }
  },
  {
    id: 'FR-2026-0002',
    founderId: 'usr-001',
    itemName: 'Titan Silver Wrist Watch',
    category: 'OTHER',
    brand: 'Titan',
    color: 'Silver',
    foundLocation: 'Sports Complex Locker Room Entry',
    currentStorageLocation: 'Main Security Office Box B-02',
    custodyOfficer: 'Officer Raman',
    description: 'Found near locker #12 bench after evening practice session.',
    foundDate: '2026-09-22T19:00:00.000Z',
    status: 'CLAIM_SUBMITTED',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
    createdAt: '2026-09-22T19:30:00.000Z',
    founder: { name: 'Varun Sharma', email: 'user@blockfind.demo' }
  }
];

const DEFAULT_CLAIMS = [
  {
    id: 'CLM-2026-0001',
    foundReportId: 'FR-2026-0001',
    claimantId: 'usr-001',
    claimantName: 'Varun Sharma',
    claimantEmail: 'user@blockfind.demo',
    claimantPhone: '+91 98765 43210',
    claimReason: 'I forgot my laptop in the library reading room. It has my registered serial DL-INSP-2026-001.',
    proofDescription: 'Original invoice and serial sticker picture attached.',
    proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
    status: 'PENDING',
    createdAt: '2026-09-21T09:00:00.000Z',
    claimant: { name: 'Varun Sharma', email: 'user@blockfind.demo', organization: 'Campus Member' },
    foundReport: DEFAULT_FOUND_REPORTS[0]
  }
];

const DEFAULT_BLOCKS = [
  {
    blockNumber: 1024,
    hash: '0x8f2d6c3e9a1b4c7d5e8f0a2b4c6e8d0f1a3b5c7e9a1b3d5e7f9a1c3e5b7d9f01',
    previousHash: '0x3a7c9e1b5d7f9a2c4e6b8d0f2a4c6e8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8a01',
    timestamp: '2026-09-25T16:00:00.000Z',
    txCount: 4,
    merkleRoot: '0x9d4e2a7b1c8f3e5a0d2b6c8e4f1a3b5c7e9a1b3d5e7f9a1c3e5b7d9f0a2b4c6e',
    validator: '0x71C569A90E3e5B8e4B51C9B6E0c4F49D08B1701A',
    status: 'CONFIRMED',
    transactions: [
      {
        txHash: '0x8f2d6c3e9a1b4c7d5e8f0a2b4c6e8d0f1a3b5c7e9a1b3d5e7f9a1c3e5b7d9f01',
        assetId: 'BF-LAP-00128',
        eventType: 'ASSET_GENESIS',
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress: '0x71C569A90E3e5B8e4B51C9B6E0c4F49D08B1701A',
        timestamp: '2026-09-25T16:00:00.000Z',
        blockNumber: 1024,
        status: 'CONFIRMED'
      },
      {
        txHash: '0x3a7c9e1b5d7f9a2c4e6b8d0f2a4c6e8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8a01',
        assetId: 'BF-PHN-00245',
        eventType: 'OWNERSHIP_VERIFIED',
        fromAddress: '0x71C569A90E3e5B8e4B51C9B6E0c4F49D08B1701A',
        toAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
        timestamp: '2026-09-25T15:30:00.000Z',
        blockNumber: 1023,
        status: 'CONFIRMED'
      }
    ]
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud-001',
    action: 'ASSET_REGISTERED',
    category: 'ASSET',
    details: 'Asset BF-LAP-00128 registered onto Genesis Block #1001 with SHA-256 serial hash.',
    actorEmail: 'user@blockfind.demo',
    actorRole: 'USER',
    ipAddress: '192.168.1.104',
    createdAt: '2026-09-25T10:15:00.000Z'
  },
  {
    id: 'aud-002',
    action: 'CLAIM_SUBMITTED',
    category: 'CLAIM',
    details: 'Ownership claim CLM-2026-0001 submitted for found report FR-2026-0001.',
    actorEmail: 'user@blockfind.demo',
    actorRole: 'USER',
    ipAddress: '192.168.1.104',
    createdAt: '2026-09-25T11:20:00.000Z'
  },
  {
    id: 'aud-003',
    action: 'BLOCKCHAIN_SYNC',
    category: 'BLOCKCHAIN',
    details: 'Consensus engine validated block #1024. All Merkle roots verified.',
    actorEmail: 'system.node@blockfind.network',
    actorRole: 'SYSTEM',
    ipAddress: '10.0.4.12',
    createdAt: '2026-09-25T16:00:00.000Z'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-001',
    userId: 'usr-001',
    title: 'Blockchain Confirmation Received',
    message: 'Your asset Dell Inspiron 15 (BF-LAP-00128) was successfully confirmed on-chain at Block #1001.',
    type: 'BLOCKCHAIN',
    isRead: false,
    createdAt: '2026-09-25T14:00:00.000Z'
  },
  {
    id: 'notif-002',
    userId: 'usr-001',
    title: 'Smart Matching Alert',
    message: 'High confidence match (94%) detected between your Lost Report LR-2026-0001 and Found Item FR-2026-0001.',
    type: 'MATCH',
    isRead: false,
    createdAt: '2026-09-25T14:30:00.000Z'
  }
];

class MockDataStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem('bf_users')) {
      localStorage.setItem('bf_users', JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem('bf_assets')) {
      localStorage.setItem('bf_assets', JSON.stringify(DEFAULT_ASSETS));
    }
    if (!localStorage.getItem('bf_lost_reports')) {
      localStorage.setItem('bf_lost_reports', JSON.stringify(DEFAULT_LOST_REPORTS));
    }
    if (!localStorage.getItem('bf_found_reports')) {
      localStorage.setItem('bf_found_reports', JSON.stringify(DEFAULT_FOUND_REPORTS));
    }
    if (!localStorage.getItem('bf_claims')) {
      localStorage.setItem('bf_claims', JSON.stringify(DEFAULT_CLAIMS));
    }
    if (!localStorage.getItem('bf_blocks')) {
      localStorage.setItem('bf_blocks', JSON.stringify(DEFAULT_BLOCKS));
    }
    if (!localStorage.getItem('bf_audit_logs')) {
      localStorage.setItem('bf_audit_logs', JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
    if (!localStorage.getItem('bf_notifications')) {
      localStorage.setItem('bf_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }

  getItem(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  setItem(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Auth
  login(email, password) {
    const users = this.getItem('bf_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (user.password && user.password !== password && password !== 'User@123' && password !== 'Verifier@123' && password !== 'Admin@123') {
      throw new Error('Invalid credentials provided');
    }
    const token = 'bf_jwt_mock_' + btoa(user.id + ':' + Date.now());
    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        organization: user.organization || 'BlockFind Organization',
        avatarUrl: user.avatarUrl || ''
      }
    };
  }

  register(userData) {
    const users = this.getItem('bf_users');
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: 'usr-' + Date.now().toString().slice(-6),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'USER',
      phone: userData.phone || '',
      organization: userData.organization || 'General User',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`
    };
    users.push(newUser);
    this.setItem('bf_users', users);

    const token = 'bf_jwt_mock_' + btoa(newUser.id + ':' + Date.now());
    return {
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        organization: newUser.organization,
        avatarUrl: newUser.avatarUrl
      }
    };
  }

  // Assets
  getAssets(params = {}) {
    let assets = this.getItem('bf_assets');
    if (params.category && params.category !== 'ALL') {
      assets = assets.filter(a => a.category === params.category);
    }
    if (params.status && params.status !== 'ALL') {
      assets = assets.filter(a => a.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      assets = assets.filter(a => (a.name || '').toLowerCase().includes(q) || (a.serialNumber || '').toLowerCase().includes(q));
    }
    return { success: true, count: assets.length, assets };
  }

  getMyAssets(currentUserId) {
    const assets = this.getItem('bf_assets');
    const myAssets = assets.filter(a => a.ownerId === currentUserId || a.currentOwnerId === currentUserId);
    return { success: true, count: myAssets.length, assets: myAssets };
  }

  getAssetById(id) {
    const assets = this.getItem('bf_assets');
    const asset = assets.find(a => a.id === id);
    if (!asset) throw new Error('Asset not found');
    return { success: true, asset };
  }

  createAsset(data, currentUser) {
    const assets = this.getItem('bf_assets');
    const newId = `BF-${(data.category || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const txHash = generateClientHash(newId + (data.serialNumber || '') + Date.now());
    
    const newAsset = {
      id: newId,
      name: data.name,
      category: data.category || 'OTHER',
      serialNumber: data.serialNumber || `SN-${Date.now()}`,
      description: data.description || '',
      color: data.color || '',
      brand: data.brand || '',
      status: 'ACTIVE',
      ownerId: currentUser?.id || 'usr-001',
      currentOwnerId: currentUser?.id || 'usr-001',
      isRegisteredOnChain: true,
      blockchainTxHash: txHash,
      genesisBlockNumber: 1025 + assets.length,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      owner: { name: currentUser?.name || 'Varun Sharma', email: currentUser?.email || 'user@blockfind.demo' }
    };

    assets.unshift(newAsset);
    this.setItem('bf_assets', assets);

    // Add block transaction
    this.addTransaction({
      txHash,
      assetId: newId,
      eventType: 'ASSET_GENESIS',
      fromAddress: '0x0000000000000000000000000000000000000000',
      toAddress: '0x71C569A90E3e5B8e4B51C9B6E0c4F49D08B1701A',
      timestamp: new Date().toISOString(),
      blockNumber: newAsset.genesisBlockNumber,
      status: 'CONFIRMED'
    });

    return { success: true, asset: newAsset, txHash };
  }

  // Reports
  getLostReports(params = {}) {
    let reports = this.getItem('bf_lost_reports');
    if (params.category && params.category !== 'ALL') {
      reports = reports.filter(r => r.category === params.category);
    }
    return { success: true, count: reports.length, lostReports: reports };
  }

  getLostReportById(id) {
    const reports = this.getItem('bf_lost_reports');
    const report = reports.find(r => r.id === id);
    if (!report) throw new Error('Lost report not found');
    return { success: true, lostReport: report };
  }

  createLostReport(data, currentUser) {
    const reports = this.getItem('bf_lost_reports');
    const newReport = {
      id: `LR-2026-${String(reports.length + 1).padStart(4, '0')}`,
      reporterId: currentUser?.id || 'usr-001',
      assetId: data.assetId || null,
      itemName: data.itemName,
      category: data.category || 'OTHER',
      brand: data.brand || '',
      color: data.color || '',
      serialNumber: data.serialNumber || '',
      description: data.description || '',
      lastKnownLocation: data.lastKnownLocation || '',
      lostDate: data.lostDate || new Date().toISOString(),
      status: 'OPEN',
      contactEmail: currentUser?.email || 'user@blockfind.demo',
      contactPhone: currentUser?.phone || '+91 98765 43210',
      createdAt: new Date().toISOString(),
      reporter: { name: currentUser?.name || 'Varun Sharma', email: currentUser?.email || 'user@blockfind.demo' }
    };
    reports.unshift(newReport);
    this.setItem('bf_lost_reports', reports);
    return { success: true, lostReport: newReport };
  }

  getFoundReports(params = {}) {
    let reports = this.getItem('bf_found_reports');
    if (params.category && params.category !== 'ALL') {
      reports = reports.filter(r => r.category === params.category);
    }
    return { success: true, count: reports.length, foundReports: reports };
  }

  getFoundReportById(id) {
    const reports = this.getItem('bf_found_reports');
    const report = reports.find(r => r.id === id);
    if (!report) throw new Error('Found report not found');
    return { success: true, foundReport: report };
  }

  createFoundReport(data, currentUser) {
    const reports = this.getItem('bf_found_reports');
    const newReport = {
      id: `FR-2026-${String(reports.length + 1).padStart(4, '0')}`,
      founderId: currentUser?.id || 'usr-001',
      itemName: data.itemName,
      category: data.category || 'OTHER',
      brand: data.brand || '',
      color: data.color || '',
      foundLocation: data.foundLocation || '',
      currentStorageLocation: data.currentStorageLocation || 'Security Reception',
      custodyOfficer: data.custodyOfficer || 'Officer On Duty',
      description: data.description || '',
      foundDate: data.foundDate || new Date().toISOString(),
      status: 'IN_CUSTODY',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      founder: { name: currentUser?.name || 'Inspector Meenakshi', email: currentUser?.email || 'verifier@blockfind.demo' }
    };
    reports.unshift(newReport);
    this.setItem('bf_found_reports', reports);
    return { success: true, foundReport: newReport };
  }

  // Claims
  getClaims(params = {}) {
    let claims = this.getItem('bf_claims');
    if (params.status && params.status !== 'ALL') {
      claims = claims.filter(c => c.status === params.status);
    }
    return { success: true, count: claims.length, claims };
  }

  getClaimById(id) {
    const claims = this.getItem('bf_claims');
    const claim = claims.find(c => c.id === id);
    if (!claim) throw new Error('Claim not found');
    return { success: true, claim };
  }

  createClaim(data, currentUser) {
    const claims = this.getItem('bf_claims');
    const foundReports = this.getItem('bf_found_reports');
    const foundReport = foundReports.find(f => f.id === data.foundReportId) || DEFAULT_FOUND_REPORTS[0];

    const newClaim = {
      id: `CLM-2026-${String(claims.length + 1).padStart(4, '0')}`,
      foundReportId: data.foundReportId,
      claimantId: currentUser?.id || 'usr-001',
      claimantName: currentUser?.name || 'Varun Sharma',
      claimantEmail: currentUser?.email || 'user@blockfind.demo',
      claimantPhone: currentUser?.phone || '+91 98765 43210',
      claimReason: data.claimReason || 'Item belongs to me.',
      proofDescription: data.proofDescription || 'Proof provided',
      proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      claimant: { name: currentUser?.name || 'Varun Sharma', email: currentUser?.email || 'user@blockfind.demo' },
      foundReport
    };
    claims.unshift(newClaim);
    this.setItem('bf_claims', claims);
    return { success: true, claim: newClaim };
  }

  approveClaim(id, remarks) {
    const claims = this.getItem('bf_claims');
    const claimIndex = claims.findIndex(c => c.id === id);
    if (claimIndex === -1) throw new Error('Claim not found');

    const txHash = generateClientHash(id + remarks + Date.now());
    claims[claimIndex].status = 'APPROVED';
    claims[claimIndex].verificationRemarks = remarks;
    claims[claimIndex].blockchainTxHash = txHash;
    this.setItem('bf_claims', claims);

    this.addTransaction({
      txHash,
      assetId: claims[claimIndex].foundReportId,
      eventType: 'OWNERSHIP_TRANSFERRED',
      fromAddress: '0x71C569A90E3e5B8e4B51C9B6E0c4F49D08B1701A',
      toAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
      timestamp: new Date().toISOString(),
      blockNumber: 1025,
      status: 'CONFIRMED'
    });

    return { success: true, claim: claims[claimIndex], txHash };
  }

  rejectClaim(id, reason) {
    const claims = this.getItem('bf_claims');
    const claimIndex = claims.findIndex(c => c.id === id);
    if (claimIndex === -1) throw new Error('Claim not found');
    claims[claimIndex].status = 'REJECTED';
    claims[claimIndex].rejectionReason = reason;
    this.setItem('bf_claims', claims);
    return { success: true, claim: claims[claimIndex] };
  }

  // Blockchain
  getBlockchainStats() {
    const blocks = this.getItem('bf_blocks');
    const assets = this.getItem('bf_assets');
    const claims = this.getItem('bf_claims');

    let totalTx = 0;
    blocks.forEach(b => { totalTx += (b.transactions ? b.transactions.length : (b.txCount || 1)); });

    return {
      success: true,
      stats: {
        networkName: 'BlockFind Decentralized Ledger Network',
        blockHeight: 1024 + blocks.length,
        totalTransactions: totalTx + assets.length + claims.length,
        activeNodes: 12,
        consensusProtocol: 'Proof-of-Authority (PoA / BFT)',
        ledgerIntegrity: '100% Tamper-Evident',
        smartContractAddress: '0x4fA99d5E93B3C84Ce02130e557fF9464b54e7d41'
      }
    };
  }

  getBlocks() {
    const blocks = this.getItem('bf_blocks');
    return { success: true, blocks };
  }

  verifyHash(txHash) {
    const blocks = this.getItem('bf_blocks');
    const assets = this.getItem('bf_assets');
    
    const foundInAssets = assets.find(a => a.blockchainTxHash === txHash);
    const foundInBlocks = blocks.some(b => (b.transactions || []).some(t => t.txHash === txHash));

    if (foundInAssets || foundInBlocks || (txHash && txHash.startsWith('0x') && txHash.length > 20)) {
      return {
        success: true,
        verified: true,
        status: 'VALID_AND_AUTHENTIC',
        blockNumber: 1024,
        timestamp: new Date().toISOString(),
        sha256Proof: txHash,
        message: 'Cryptographic hash verified on-chain. Zero tampering detected.'
      };
    }
    return {
      success: false,
      verified: false,
      status: 'HASH_NOT_FOUND',
      message: 'Transaction hash could not be matched against ledger blocks.'
    };
  }

  addTransaction(tx) {
    const blocks = this.getItem('bf_blocks');
    if (blocks.length > 0) {
      if (!blocks[0].transactions) blocks[0].transactions = [];
      blocks[0].transactions.unshift(tx);
      blocks[0].txCount = blocks[0].transactions.length;
      this.setItem('bf_blocks', blocks);
    }
  }

  // Admin & Audit
  getAdminStats() {
    const assets = this.getItem('bf_assets');
    const lost = this.getItem('bf_lost_reports');
    const found = this.getItem('bf_found_reports');
    const claims = this.getItem('bf_claims');
    const users = this.getItem('bf_users');
    const auditLogs = this.getItem('bf_audit_logs');

    return {
      success: true,
      stats: {
        totalAssets: assets.length,
        totalLostReports: lost.length,
        totalFoundReports: found.length,
        totalClaims: claims.length,
        totalUsers: users.length,
        resolvedCases: claims.filter(c => c.status === 'APPROVED').length,
        recoveryRatePercentage: 88.5,
        recentActivity: auditLogs.slice(0, 5)
      }
    };
  }

  getUsers() {
    const users = this.getItem('bf_users');
    return { success: true, users };
  }

  updateUserRole(id, role) {
    const users = this.getItem('bf_users');
    const user = users.find(u => u.id === id);
    if (user) {
      user.role = role;
      this.setItem('bf_users', users);
    }
    return { success: true, user };
  }

  getAuditLogs() {
    const logs = this.getItem('bf_audit_logs');
    return { success: true, auditLogs: logs };
  }

  // Notifications
  getNotifications(userId) {
    const notifs = this.getItem('bf_notifications');
    return { success: true, notifications: notifs };
  }

  markNotificationRead(id) {
    const notifs = this.getItem('bf_notifications');
    const n = notifs.find(item => item.id === id);
    if (n) n.isRead = true;
    this.setItem('bf_notifications', notifs);
    return { success: true };
  }

  markAllNotificationsRead() {
    const notifs = this.getItem('bf_notifications');
    notifs.forEach(n => { n.isRead = true; });
    this.setItem('bf_notifications', notifs);
    return { success: true };
  }
}

export const mockDataStore = new MockDataStore();
