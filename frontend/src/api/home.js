import apiClient from './client';

// Fetch active homepage hero banner
export const getHeroBanner = async () => {
  try {
    const response = await apiClient.get('/banners/hero');
    return response.data;
  } catch (error) {
    console.warn('[API] Could not fetch hero banner, using default:', error.message);
    return {
      success: true,
      banner: {
        title: 'INDUSTRIAL GRADE CONSUMABLES',
        heading: 'Precision Welding Consumables for Industrial Excellence',
        supportingText:
          'Engineered for maximum structural integrity. Supply chain solutions for fabrication, oil & gas, and heavy infrastructure projects worldwide.',
        ctaLabel: 'EXPLORE PRODUCTS',
        ctaDestination: '/products',
        desktopImage: null,
      },
    };
  }
};

// Fetch dynamic technical discovery filters (classifications, base materials, industries)
export const getDiscoveryFilters = async () => {
  try {
    const response = await apiClient.get('/products/discovery-filters');
    return response.data;
  } catch (error) {
    console.warn('[API] Could not fetch discovery filters:', error.message);
    return {
      success: false,
      classifications: [],
      baseMaterials: [],
      industries: [],
    };
  }
};

// Fetch featured categories for Technical Product Lines section
export const getFeaturedProductLines = async () => {
  try {
    const response = await apiClient.get('/categories/featured');
    return response.data;
  } catch (error) {
    console.warn('[API] Could not fetch featured product lines:', error.message);
    return {
      success: false,
      categories: [],
    };
  }
};

// Fetch primary complete catalog document info
export const getPrimaryCatalog = async () => {
  try {
    const response = await apiClient.get('/downloads/primary-catalog');
    return response.data;
  } catch (error) {
    console.warn('[API] Could not fetch primary catalog:', error.message);
    return {
      success: false,
      catalog: {
        title: 'Complete Catalog',
        description: 'Download the full 2024 Product Guide (PDF)',
        fileType: 'PDF',
        fileSize: '4.8 MB',
        fileUrl: '/downloads/sprimax-complete-catalog-2024.pdf',
      },
    };
  }
};
