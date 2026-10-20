import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const FRONTEND_ASSETS_DIR = path.join(__dirname, '../../../frontend/src/assets');
const FRONTEND_PUBLIC_DIR = path.join(__dirname, '../../../frontend/public');

/**
 * Resolve local file path from a stored URL/path
 */
function resolveLocalFilePath(imgUrl) {
  if (!imgUrl || typeof imgUrl !== 'string') return null;

  // e.g. "/uploads/my-file.jpg"
  if (imgUrl.includes('/uploads/')) {
    const filename = imgUrl.split('/uploads/').pop();
    const candidate = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(candidate)) return candidate;
  }

  // e.g. "/assets/blog-cnc-milling.jpg"
  if (imgUrl.includes('/assets/')) {
    const filename = imgUrl.split('/assets/').pop();
    const cand1 = path.join(FRONTEND_ASSETS_DIR, filename);
    if (fs.existsSync(cand1)) return cand1;
    const cand2 = path.join(FRONTEND_PUBLIC_DIR, 'assets', filename);
    if (fs.existsSync(cand2)) return cand2;
  }

  return null;
}

export async function runMigration() {
  console.log('=== Sprimax Cloudinary Image Migration ===');

  if (!isCloudinaryConfigured()) {
    console.error('Migration aborted: Cloudinary is not configured in .env');
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error('Migration aborted: MONGO_URI is missing in .env');
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB database.\n');

  const stats = {
    scanned: 0,
    alreadyCloudinary: 0,
    migrated: 0,
    notFoundOrSkipped: 0,
  };

  const db = mongoose.connection.db;

  // 1. Blogs Migration
  const blogsCollection = db.collection('blogs');
  const blogs = await blogsCollection.find({}).toArray();
  console.log(`Checking ${blogs.length} blogs...`);

  for (const blog of blogs) {
    stats.scanned++;
    let updated = false;
    const updates = {};

    // Banner image
    if (blog.bannerImageUrl) {
      if (blog.bannerImageUrl.includes('res.cloudinary.com')) {
        stats.alreadyCloudinary++;
      } else {
        const localPath = resolveLocalFilePath(blog.bannerImageUrl);
        if (localPath) {
          try {
            const buf = fs.readFileSync(localPath);
            const ext = path.extname(localPath);
            const base = path.basename(localPath, ext);
            const cld = await uploadBufferToCloudinary(buf, {
              folder: 'sprimax/blog/banners',
              public_id: `migrated_${base}_${Date.now()}`,
            });
            updates.bannerImageUrl = cld.secure_url;
            updates.bannerImagePublicId = cld.public_id;
            updated = true;
            stats.migrated++;
            console.log(`  ✓ Migrated blog banner: "${blog.title}" -> ${cld.secure_url}`);
          } catch (err) {
            console.error(`  ✗ Failed blog banner upload for "${blog.title}":`, err.message);
          }
        } else {
          stats.notFoundOrSkipped++;
        }
      }
    }

    // Inline content images
    if (Array.isArray(blog.content)) {
      let contentChanged = false;
      const newContent = await Promise.all(
        blog.content.map(async (block) => {
          if (block.type === 'image' && block.imageUrl) {
            stats.scanned++;
            if (block.imageUrl.includes('res.cloudinary.com')) {
              stats.alreadyCloudinary++;
              return block;
            }
            const localPath = resolveLocalFilePath(block.imageUrl);
            if (localPath) {
              try {
                const buf = fs.readFileSync(localPath);
                const ext = path.extname(localPath);
                const base = path.basename(localPath, ext);
                const cld = await uploadBufferToCloudinary(buf, {
                  folder: 'sprimax/blog/inline',
                  public_id: `migrated_inline_${base}_${Date.now()}`,
                });
                stats.migrated++;
                contentChanged = true;
                console.log(`  ✓ Migrated inline blog image -> ${cld.secure_url}`);
                return { ...block, imageUrl: cld.secure_url, publicId: cld.public_id };
              } catch (err) {
                console.error(`  ✗ Failed inline image upload:`, err.message);
              }
            } else {
              stats.notFoundOrSkipped++;
            }
          }
          return block;
        })
      );

      if (contentChanged) {
        updates.content = newContent;
        updated = true;
      }
    }

    if (updated) {
      await blogsCollection.updateOne({ _id: blog._id }, { $set: updates });
    }
  }

  // 2. Banners Migration
  const bannersCollection = db.collection('banners');
  const banners = await bannersCollection.find({}).toArray();
  console.log(`\nChecking ${banners.length} promotional banners...`);

  for (const b of banners) {
    stats.scanned++;
    const updates = {};
    let updated = false;

    if (b.desktopImage) {
      if (b.desktopImage.includes('res.cloudinary.com')) {
        stats.alreadyCloudinary++;
      } else {
        const localPath = resolveLocalFilePath(b.desktopImage);
        if (localPath) {
          try {
            const buf = fs.readFileSync(localPath);
            const cld = await uploadBufferToCloudinary(buf, {
              folder: 'sprimax/banners',
              public_id: `migrated_banner_${Date.now()}`,
            });
            updates.desktopImage = cld.secure_url;
            updates.desktopImagePublicId = cld.public_id;
            updated = true;
            stats.migrated++;
            console.log(`  ✓ Migrated banner "${b.title}" -> ${cld.secure_url}`);
          } catch (err) {
            console.error(`  ✗ Failed banner upload for "${b.title}":`, err.message);
          }
        }
      }
    }

    if (updated) {
      await bannersCollection.updateOne({ _id: b._id }, { $set: updates });
    }
  }

  // 3. Products Migration
  const productsCollection = db.collection('products');
  const products = await productsCollection.find({}).toArray();
  console.log(`\nChecking ${products.length} products...`);

  for (const p of products) {
    if (p.image) {
      stats.scanned++;
      if (p.image.includes('res.cloudinary.com')) {
        stats.alreadyCloudinary++;
      } else {
        const localPath = resolveLocalFilePath(p.image);
        if (localPath) {
          try {
            const buf = fs.readFileSync(localPath);
            const cld = await uploadBufferToCloudinary(buf, {
              folder: 'sprimax/products',
              public_id: `migrated_product_${p.sku || Date.now()}`,
            });
            await productsCollection.updateOne(
              { _id: p._id },
              { $set: { image: cld.secure_url, imagePublicId: cld.public_id } }
            );
            stats.migrated++;
            console.log(`  ✓ Migrated product "${p.name}" -> ${cld.secure_url}`);
          } catch (err) {
            console.error(`  ✗ Failed product upload for "${p.name}":`, err.message);
          }
        } else {
          stats.notFoundOrSkipped++;
        }
      }
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Total image records checked: ${stats.scanned}`);
  console.log(`Already on Cloudinary:       ${stats.alreadyCloudinary}`);
  console.log(`Successfully migrated:       ${stats.migrated}`);
  console.log(`External / untouched:        ${stats.notFoundOrSkipped}`);

  await mongoose.disconnect();
  console.log('Database disconnected. Migration finished.\n');
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration().catch(err => {
    console.error('Fatal error in migration:', err);
    process.exit(1);
  });
}
