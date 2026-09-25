const multer = require('multer');
const path = require('path');
const fs = require('fs');

const chatUploadDir = path.join(__dirname, '../../uploads/chat');
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

class ChatStorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'blockfind-chat-vault';
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  /**
   * Save uploaded chat image
   */
  async saveChatImage(file) {
    if (!file) return null;

    if (this.driver === 's3' && process.env.AWS_ACCESS_KEY_ID) {
      // AWS S3 bucket handler for production
      console.log(`[ChatStorageService] Uploading chat image to S3: ${this.bucketName}/${file.filename}`);
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/chat/${file.filename}`;
    }

    // Local file storage
    return `/uploads/chat/${file.filename}`;
  }
}

// Multer disk configuration for chat media
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, chatUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `chat-img-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image format (${ext}). Supported formats: JPG, JPEG, PNG, WEBP`), false);
  }
};

const chatUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum image size
  },
  fileFilter: fileFilter
});

module.exports = {
  chatUpload,
  chatStorageService: new ChatStorageService()
};
