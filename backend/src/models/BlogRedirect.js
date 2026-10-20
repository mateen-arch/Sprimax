import mongoose from 'mongoose';

const blogRedirectSchema = new mongoose.Schema(
  {
    oldSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    newSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BlogRedirect = mongoose.model('BlogRedirect', blogRedirectSchema);
export default BlogRedirect;
