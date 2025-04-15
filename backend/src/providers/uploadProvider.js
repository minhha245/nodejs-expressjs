const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Provider = require('../core/base/Provider');

class UploadProvider extends Provider {
  constructor() {
    super();
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../storage/avatars');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

    this.fileFilter = (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    };

    this.limits = {
      fileSize: 5 * 1024 * 1024 // 5MB
    };
  }

  get uploadAvatar() {
    return multer({
      storage: this.storage,
      limits: this.limits,
      fileFilter: this.fileFilter
    }).single('avatar');
  }

  handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(
          this.error('File size too large. Maximum size is 5MB')
        );
      }
      return res.status(400).json(this.error(err.message));
    }
    
    if (err.message === 'Only .png, .jpg and .jpeg format allowed!') {
      return res.status(400).json(this.error(err.message));
    }
    
    next(err);
  }

  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return this.success(null, 'File deleted successfully');
      }
      return this.error('File not found');
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new UploadProvider();
