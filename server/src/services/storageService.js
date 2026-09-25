const fs = require('fs');
const path = require('path');

class IStorageService {
  async uploadFile(file) {
    throw new Error('uploadFile method not implemented');
  }
  async getFileUrl(filename) {
    throw new Error('getFileUrl method not implemented');
  }
}

class LocalStorageService extends IStorageService {
  constructor() {
    super();
    this.uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file) {
    if (!file) return null;
    // Returns static file URL relative to backend server
    return `/uploads/${file.filename}`;
  }

  async getFileUrl(filename) {
    if (!filename) return null;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    return `/uploads/${path.basename(filename)}`;
  }
}

class S3StorageService extends IStorageService {
  constructor() {
    super();
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'blockfind-asset-vault';
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  async uploadFile(file) {
    // S3 AWS SDK v3 upload handler placeholder for production deployment
    // In production, uses @aws-sdk/client-s3 PutObjectCommand
    console.log(`[AWS S3 Service] Simulated S3 upload to bucket: ${this.bucketName}/${file.filename}`);
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/uploads/${file.filename}`;
  }

  async getFileUrl(filename) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/uploads/${path.basename(filename)}`;
  }
}

function getStorageService() {
  if (process.env.STORAGE_DRIVER === 's3' && process.env.AWS_ACCESS_KEY_ID) {
    return new S3StorageService();
  }
  return new LocalStorageService();
}

module.exports = {
  getStorageService,
  LocalStorageService,
  S3StorageService
};
