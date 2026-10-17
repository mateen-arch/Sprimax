import Banner from '../models/Banner.js';

// @desc    Get all banners or filter by placement/status
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res, next) => {
  try {
    const { placement, status } = req.query;
    const filter = {};
    if (placement) filter.placement = placement;
    if (status) filter.status = status;

    const banners = await Banner.find(filter).sort('sortOrder');
    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active Homepage Hero banner
// @route   GET /api/banners/hero
// @access  Public
export const getHeroBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findOne({
      placement: 'Homepage Hero',
      status: 'Active',
    }).sort('sortOrder');

    if (!banner) {
      // Return sensible default if not found
      return res.status(200).json({
        success: true,
        banner: {
          title: 'INDUSTRIAL GRADE CONSUMABLES',
          heading: 'Precision Welding Consumables for Industrial Excellence',
          supportingText:
            'Engineered for maximum structural integrity. Supply chain solutions for fabrication, oil & gas, and heavy infrastructure projects worldwide.',
          ctaLabel: 'EXPLORE PRODUCTS',
          ctaDestination: '/products',
          desktopImage: null,
          desktopAlt: 'Industrial Welding Automation',
        },
      });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    next(error);
  }
};
