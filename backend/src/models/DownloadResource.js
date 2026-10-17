import mongoose from 'mongoose';

const downloadResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'TDS',
    },
    type: {
      type: String,
      trim: true,
      default: 'tds',
    },
    description: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: 'PDF',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: String,
      default: '1.5 MB',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    relatedProduct: {
      type: String,
      default: '',
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
    isPrimaryCatalog: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Published', 'Internal', 'Archived', 'Active', 'Inactive'],
      default: 'Published',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-normalize `type` based on `category` if not provided
downloadResourceSchema.pre('save', function (next) {
  if (!this.type && this.category) {
    const cat = this.category.toLowerCase();
    if (cat.includes('tds') || cat.includes('technical')) this.type = 'tds';
    else if (cat.includes('sds') || cat.includes('safety')) this.type = 'sds';
    else if (cat.includes('catalog')) this.type = 'catalog';
    else if (cat.includes('profile') || cat.includes('corporate') || cat.includes('cert')) this.type = 'profile';
    else this.type = 'tds';
  }
  if (!this.fileName) {
    const ext = (this.fileType || 'PDF').toLowerCase();
    this.fileName = `${this.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${ext}`;
  }
  next();
});

const DownloadResource = mongoose.model('DownloadResource', downloadResourceSchema);
export default DownloadResource;
