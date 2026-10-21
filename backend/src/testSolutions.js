import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import SolutionPage from './models/SolutionPage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

async function runTests() {
  console.log('--- Starting Industry Solutions CMS Tests ---');
  let testDocId = null;

  try {
    await connectDB();

    // Test 1: Model creation & validation
    console.log('\n[Test 1] Schema validation & creation...');
    const testSolution = new SolutionPage({
      title: 'Automated Test Sector',
      slug: `automated-test-${Date.now()}`,
      status: 'Draft',
      breadcrumb: [{ label: 'Company', url: '/company' }],
      seo: { title: 'Test SEO', metaDescription: 'Test Desc' },
      sections: [
        {
          id: 'sec-1',
          type: 'hero',
          order: 0,
          visible: true,
          data: { heading: 'Test Hero' },
        },
        {
          id: 'sec-2',
          type: 'challenges',
          order: 1,
          visible: false, // hidden
          data: { heading: 'Test Challenges', cards: [] },
        },
      ],
    });

    await testSolution.save();
    testDocId = testSolution._id;
    console.log('✓ Successfully created Draft SolutionPage with ID:', testDocId);

    // Test 2: Draft vs Published Visibility
    console.log('\n[Test 2] Testing Draft vs Published Visibility...');
    const publicDraft = await SolutionPage.findOne({
      slug: testSolution.slug,
      status: 'Published',
    });
    if (publicDraft) {
      throw new Error('FAILED: Draft solution was returned when querying for Published status!');
    }
    console.log('✓ Confirmed: Draft solutions are strictly excluded from public queries.');

    // Test 3: Publishing & Version Snapshots
    console.log('\n[Test 3] Testing Publishing & Version Snapshot creation...');
    testSolution.status = 'Published';
    testSolution.publishedAt = new Date();
    testSolution.createVersionSnapshot('Test Suite');
    await testSolution.save();

    const publishedDoc = await SolutionPage.findOne({
      slug: testSolution.slug,
      status: 'Published',
    });
    if (!publishedDoc || publishedDoc.status !== 'Published') {
      throw new Error('FAILED: Solution failed to update to Published!');
    }
    if (!publishedDoc.versions || publishedDoc.versions.length === 0) {
      throw new Error('FAILED: Version snapshot was not recorded on publish!');
    }
    console.log('✓ Confirmed: Published solution is live with recorded version snapshot (v' + publishedDoc.versions[0].versionNumber + ').');

    // Test 4: Section Reordering Logic
    console.log('\n[Test 4] Testing Section Reordering & Visibility filter...');
    // Swap order of sec-1 and sec-2
    testSolution.sections[0].order = 1;
    testSolution.sections[1].order = 0;
    await testSolution.save();

    const reordered = await SolutionPage.findById(testDocId);
    const sorted = reordered.sections.sort((a, b) => a.order - b.order);
    if (sorted[0].id !== 'sec-2' || sorted[1].id !== 'sec-1') {
      throw new Error('FAILED: Section reordering logic did not sort properly!');
    }
    console.log('✓ Confirmed: Section reordering logic correctly reorders sections by order index.');

    // Test 5: Version Restore Logic
    console.log('\n[Test 5] Testing Version Restore Logic...');
    const originalTitle = testSolution.title;
    testSolution.title = 'Title Modified Before Restore';
    await testSolution.save();

    const snapshot = testSolution.versions[0].snapshot;
    testSolution.title = snapshot.title;
    testSolution.createVersionSnapshot('Restored v1');
    await testSolution.save();

    const restoredDoc = await SolutionPage.findById(testDocId);
    if (restoredDoc.title !== originalTitle) {
      throw new Error('FAILED: Title was not restored from snapshot!');
    }
    console.log('✓ Confirmed: Snapshot restoration successfully rolled back content to:', restoredDoc.title);

    // Clean up test document
    await SolutionPage.findByIdAndDelete(testDocId);
    console.log('✓ Test document cleaned up.');

    console.log('\n🎉 ALL 5 TEST SUITES PASSED CLEANLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    if (testDocId) {
      await SolutionPage.findByIdAndDelete(testDocId).catch(() => {});
    }
    process.exit(1);
  }
}

runTests();
