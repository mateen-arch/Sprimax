import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['hero', 'challenges', 'compliance', 'richText', 'ctaBanner'],
    },
    order: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const solutionPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Solution page title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Solution slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    breadcrumb: [
      {
        label: { type: String, required: true },
        url: { type: String, default: '' },
      },
    ],
    seo: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
    sections: [sectionSchema],
    versions: [versionSchema],
    previewToken: {
      token: { type: String, default: null, index: true },
      expiresAt: { type: Date, default: null },
      active: { type: Boolean, default: false },
    },
    updatedBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to add snapshot (max 10 versions)
solutionPageSchema.methods.createVersionSnapshot = function (author = 'Admin') {
  const nextVer = (this.versions?.length || 0) + 1;
  const snapshotData = {
    title: this.title,
    slug: this.slug,
    breadcrumb: this.breadcrumb,
    seo: this.seo,
    sections: this.sections,
  };

  if (!this.versions) this.versions = [];
  this.versions.unshift({
    versionNumber: nextVer,
    savedAt: new Date(),
    createdBy: author,
    snapshot: snapshotData,
  });

  // Keep only the latest 10 versions
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(0, 10);
  }
};

const SolutionPage = mongoose.model('SolutionPage', solutionPageSchema);
export default SolutionPage;
