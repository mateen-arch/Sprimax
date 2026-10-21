import crypto from 'crypto';
import SolutionPage from '../models/SolutionPage.js';
import Industry from '../models/Industry.js';

// Slugify helper
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

/**
 * Public: Get published solution by slug
 * GET /api/solutions/public/:slug
 */
export async function getPublicSolutionBySlug(req, res) {
  try {
    const { slug } = req.params;
    const solution = await SolutionPage.findOne({
      slug: slug.toLowerCase().trim(),
      status: 'Published',
    }).lean();

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: `Published industry solution "${slug}" not found`,
      });
    }

    // Filter only visible sections for public delivery
    const visibleSections = (solution.sections || [])
      .filter((s) => s.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      success: true,
      solution: {
        ...solution,
        sections: visibleSections,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching solution page',
    });
  }
}

/**
 * Public / Shareable: Get solution by secret preview token
 * GET /api/solutions/preview/:token
 */
export async function getSolutionByPreviewToken(req, res) {
  try {
    const { token } = req.params;
    const solution = await SolutionPage.findOne({
      'previewToken.token': token,
      'previewToken.active': true,
      'previewToken.expiresAt': { $gt: new Date() },
    }).lean();

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Preview link is invalid, revoked, or has expired after 7 days.',
      });
    }

    res.json({
      success: true,
      solution,
      isPreview: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error resolving preview token',
    });
  }
}

/**
 * Admin: Fetch all solutions with stats, search & filters
 * GET /api/solutions
 */
export async function getAdminSolutions(req, res) {
  try {
    const { search = '', status = '', page = 1, limit = 50 } = req.query;

    const query = {};
    if (search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { slug: { $regex: term, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [solutions, total, totalCount, publishedCount, draftCount] = await Promise.all([
      SolutionPage.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      SolutionPage.countDocuments(query),
      SolutionPage.countDocuments(),
      SolutionPage.countDocuments({ status: 'Published' }),
      SolutionPage.countDocuments({ status: 'Draft' }),
    ]);

    res.json({
      success: true,
      solutions,
      total,
      stats: {
        totalCount,
        publishedCount,
        draftCount,
      },
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching admin solutions',
    });
  }
}

// Helper to find solution by MongoDB _id, slug, or matching Industry ID/slug
export async function findSolutionByIdOrSlug(identifier) {
  if (!identifier) return null;
  const str = String(identifier).trim();
  let solution = null;

  // 1. Check SolutionPage by _id
  if (str.match(/^[0-9a-fA-F]{24}$/)) {
    solution = await SolutionPage.findById(str);
  }

  // 2. Check SolutionPage by slug directly
  if (!solution) {
    solution = await SolutionPage.findOne({ slug: str.toLowerCase() });
  }

  // 3. If identifier is an Industry _id, resolve by Industry's slug
  if (!solution && str.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const ind = await Industry.findById(str);
      if (ind && ind.slug) {
        solution = await SolutionPage.findOne({ slug: ind.slug });
      }
    } catch (e) {}
  }

  // 4. If identifier matches an industry slug
  if (!solution) {
    try {
      const ind = await Industry.findOne({ slug: str.toLowerCase() });
      if (ind && ind.slug) {
        solution = await SolutionPage.findOne({ slug: ind.slug });
      }
    } catch (e) {}
  }

  return solution;
}

/**
 * Admin: Get single solution by ID or slug (supports draft simulation)
 * GET /api/solutions/:identifier
 */
export async function getAdminSolutionById(req, res) {
  try {
    const { identifier } = req.params;
    const solution = await findSolutionByIdOrSlug(identifier);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution page not found',
      });
    }

    res.json({
      success: true,
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching solution details',
    });
  }
}

/**
 * Admin: Create new solution page
 * POST /api/solutions
 */
export async function createAdminSolution(req, res) {
  try {
    const {
      title,
      slug,
      status = 'Draft',
      breadcrumb = [],
      seo = {},
      sections = [],
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let resolvedSlug = slugify(slug || title);
    // Ensure slug uniqueness
    const existing = await SolutionPage.findOne({ slug: resolvedSlug });
    if (existing) {
      resolvedSlug = `${resolvedSlug}-${Date.now().toString().slice(-4)}`;
    }

    const solution = new SolutionPage({
      title: title.trim(),
      slug: resolvedSlug,
      status,
      publishedAt: status === 'Published' ? new Date() : null,
      breadcrumb: breadcrumb.length > 0 ? breadcrumb : [
        { label: 'Company', url: '/company' },
        { label: title.trim(), url: `/solutions/${resolvedSlug}` },
      ],
      seo: {
        title: seo.title || title.trim(),
        metaDescription: seo.metaDescription || '',
        ogImage: seo.ogImage || '',
      },
      sections: sections.map((s, idx) => ({
        ...s,
        order: s.order !== undefined ? s.order : idx,
      })),
      updatedBy: 'Admin',
    });

    if (status === 'Published') {
      solution.createVersionSnapshot('Admin');
    }

    await solution.save();

    res.status(201).json({
      success: true,
      message: 'Solution page created successfully',
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating solution page',
    });
  }
}

/**
 * Admin: Update existing solution page
 * PUT /api/solutions/:id
 */
export async function updateAdminSolution(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      status,
      breadcrumb,
      seo,
      sections,
    } = req.body;

    let solution = await findSolutionByIdOrSlug(id);
    if (!solution && slug) {
      solution = await SolutionPage.findOne({ slug: slugify(slug) });
    }

    // Auto-upsert if not found yet
    if (!solution) {
      const cleanSlug = slugify(slug || title || id);
      solution = new SolutionPage({
        title: (title || 'Industrial Solution').trim(),
        slug: cleanSlug,
        status: status || 'Draft',
        publishedAt: status === 'Published' ? new Date() : null,
        breadcrumb: breadcrumb || [
          { label: 'Company', url: '/company' },
          { label: (title || 'Solution').trim(), url: `/solutions/${cleanSlug}` },
        ],
        seo: seo || {},
        sections: (sections || []).map((s, idx) => ({
          ...s,
          order: s.order !== undefined ? s.order : idx,
        })),
        updatedBy: 'Admin',
      });

      if (status === 'Published') {
        solution.createVersionSnapshot('Initial Publish');
      }

      await solution.save();

      return res.json({
        success: true,
        message: 'Solution page created and synchronized successfully.',
        solution,
      });
    }

    if (title !== undefined) solution.title = title.trim();
    if (slug !== undefined) {
      const cleanSlug = slugify(slug);
      if (cleanSlug !== solution.slug) {
        const conflict = await SolutionPage.findOne({ slug: cleanSlug, _id: { $ne: solution._id } });
        if (conflict) {
          return res.status(400).json({
            success: false,
            message: `Slug "${cleanSlug}" is already in use by another solution page.`,
          });
        }
        solution.slug = cleanSlug;
      }
    }

    const previousStatus = solution.status;
    if (status !== undefined) {
      solution.status = status;
      if (status === 'Published' && !solution.publishedAt) {
        solution.publishedAt = new Date();
      }
    }

    if (breadcrumb !== undefined) solution.breadcrumb = breadcrumb;
    if (seo !== undefined) solution.seo = { ...solution.seo, ...seo };
    if (sections !== undefined) {
      solution.sections = sections.map((s, idx) => ({
        ...s,
        order: s.order !== undefined ? s.order : idx,
      }));
    }

    solution.updatedBy = 'Admin';

    // If publishing or already published and updating, save version snapshot
    if (solution.status === 'Published') {
      solution.createVersionSnapshot('Admin');
    }

    await solution.save();

    res.json({
      success: true,
      message:
        status === 'Published' && previousStatus !== 'Published'
          ? 'Solution published successfully!'
          : 'Solution draft saved successfully.',
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating solution page',
    });
  }
}

/**
 * Admin: Delete solution page
 * DELETE /api/solutions/:id
 */
export async function deleteAdminSolution(req, res) {
  try {
    const { id } = req.params;
    const solution = await SolutionPage.findByIdAndDelete(id);
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }

    res.json({
      success: true,
      message: `Solution "${solution.title}" deleted successfully.`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error deleting solution page',
    });
  }
}

/**
 * Admin: Duplicate solution page
 * POST /api/solutions/:id/duplicate
 */
export async function duplicateAdminSolution(req, res) {
  try {
    const { id } = req.params;
    const originalSolution = await findSolutionByIdOrSlug(id);
    if (!originalSolution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }
    const original = originalSolution.toObject ? originalSolution.toObject() : originalSolution;

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;

    const uniqueSuffix = Date.now().toString().slice(-4);
    const newSlug = `${original.slug}-copy-${uniqueSuffix}`;

    const duplicate = new SolutionPage({
      ...original,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      status: 'Draft',
      publishedAt: null,
      versions: [],
      previewToken: { token: null, expiresAt: null, active: false },
      updatedBy: 'Admin',
    });

    await duplicate.save();

    res.status(201).json({
      success: true,
      message: `Duplicated as draft "${duplicate.title}"`,
      solution: duplicate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error duplicating solution page',
    });
  }
}

/**
 * Admin: Publish solution
 * POST /api/solutions/:id/publish
 */
export async function publishSolution(req, res) {
  try {
    const { id } = req.params;
    let solution = await findSolutionByIdOrSlug(id);

    if (!solution) {
      // Check if it's an industry and create a published solution from it
      let ind = null;
      if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
        ind = await Industry.findById(id);
      }
      if (!ind) {
        ind = await Industry.findOne({ slug: String(id).toLowerCase().trim() });
      }

      if (ind) {
        solution = new SolutionPage({
          title: ind.name,
          slug: ind.slug,
          status: 'Published',
          publishedAt: new Date(),
          breadcrumb: [
            { label: 'Company', url: '/company' },
            { label: ind.name, url: `/solutions/${ind.slug}` },
          ],
          seo: {
            title: `${ind.name} | Sprimax Welding Solutions`,
            metaDescription: ind.description || '',
            ogImage: ind.image || '',
          },
          sections: [
            {
              id: 'sec-hero-pub',
              type: 'hero',
              order: 0,
              visible: true,
              data: {
                eyebrowTag: `INDUSTRY SOLUTIONS // ${ind.name.toUpperCase()}`,
                heading: ind.solutionHeadline || `${ind.name.toUpperCase()} SOLUTIONS`,
                description: ind.solutionDescription || ind.description || '',
                image: ind.solutionBanner || ind.image || '',
                imageOverlayCard: {
                  enabled: true,
                  label: ind.hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
                  progressPercent: ind.hudGaugePercent || 82,
                  caption: ind.hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED',
                },
              },
            },
            {
              id: 'sec-challenges-pub',
              type: 'challenges',
              order: 1,
              visible: true,
              data: {
                heading: 'CHALLENGES & SOLUTIONS',
                sectionLabel: 'SEC // 02',
                cards: (ind.challenges || []).map((ch, idx) => ({
                  id: `ch-pub-${idx}`,
                  title: ch.title || '',
                  description: ch.text || '',
                  specLabel: 'RECOMMENDED SPECIFICATION',
                  specText: ch.recommendedSpec || '',
                  metricValue: ch.statValue || '',
                  metricLabel: ch.statLabel || '',
                  icon: idx === 0 ? 'AlertTriangle' : idx === 1 ? 'Shield' : 'Flame',
                  layout: idx === 2 ? 'full' : 'half',
                })),
              },
            },
            {
              id: 'sec-compliance-pub',
              type: 'compliance',
              order: 2,
              visible: true,
              data: {
                badges: ind.complianceBadges || ['AWS D1.1', 'ASME Sec IX', 'ISO 3834-2'],
              },
            },
          ],
          updatedBy: 'Admin',
        });
        solution.createVersionSnapshot('Initial Publish');
        await solution.save();

        return res.json({
          success: true,
          message: `"${solution.title}" is now published and live.`,
          solution,
        });
      }
    }

    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }

    solution.status = 'Published';
    if (!solution.publishedAt) {
      solution.publishedAt = new Date();
    }
    solution.createVersionSnapshot('Admin');
    await solution.save();

    res.json({
      success: true,
      message: `"${solution.title}" is now published and live.`,
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error publishing solution page',
    });
  }
}

/**
 * Admin: Unpublish solution
 * POST /api/solutions/:id/unpublish
 */
export async function unpublishSolution(req, res) {
  try {
    const { id } = req.params;
    const solution = await findSolutionByIdOrSlug(id);
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }

    solution.status = 'Draft';
    await solution.save();

    res.json({
      success: true,
      message: `"${solution.title}" moved back to draft.`,
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error unpublishing solution page',
    });
  }
}

/**
 * Admin: Restore version snapshot
 * POST /api/solutions/:id/restore-version/:versionNumber
 */
export async function restoreSolutionVersion(req, res) {
  try {
    const { id, versionNumber } = req.params;
    const solution = await findSolutionByIdOrSlug(id);
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }

    const versionItem = (solution.versions || []).find(
      (v) => v.versionNumber === Number(versionNumber)
    );

    if (!versionItem || !versionItem.snapshot) {
      return res.status(404).json({
        success: false,
        message: `Version ${versionNumber} not found in history.`,
      });
    }

    const snap = versionItem.snapshot;
    if (snap.title) solution.title = snap.title;
    if (snap.breadcrumb) solution.breadcrumb = snap.breadcrumb;
    if (snap.seo) solution.seo = snap.seo;
    if (snap.sections) solution.sections = snap.sections;

    solution.createVersionSnapshot(`Restored v${versionNumber}`);
    await solution.save();

    res.json({
      success: true,
      message: `Successfully restored version v${versionNumber}`,
      solution,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error restoring version',
    });
  }
}

/**
 * Admin: Generate 7-day shareable preview token
 * POST /api/solutions/:id/preview-token
 */
export async function generatePreviewToken(req, res) {
  try {
    const { id } = req.params;
    const solution = await findSolutionByIdOrSlug(id);
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }

    const secretToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    solution.previewToken = {
      token: secretToken,
      expiresAt,
      active: true,
    };

    await solution.save();

    res.json({
      success: true,
      message: 'Preview token generated (valid for 7 days)',
      previewToken: solution.previewToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating preview token',
    });
  }
}

/**
 * Admin: Revoke preview token
 * DELETE /api/solutions/:id/preview-token
 */
export async function revokePreviewToken(req, res) {
  try {
    const { id } = req.params;
    const solution = await findSolutionByIdOrSlug(id);
    if (!solution) {
      return res.status(404).json({ success: false, message: 'Solution page not found' });
    }

    solution.previewToken = {
      token: null,
      expiresAt: null,
      active: false,
    };

    await solution.save();

    res.json({
      success: true,
      message: 'Preview token revoked.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error revoking preview token',
    });
  }
}
