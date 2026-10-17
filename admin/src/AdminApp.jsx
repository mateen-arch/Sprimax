import { useState } from 'react';
import AdminLogin from './AdminLogin.jsx';
import DashboardPage from './DashboardPage.jsx';
import CataloguePage from './CataloguePage.jsx';
import ProductDescriptionPage from './ProductDescriptionPage.jsx';
import EditProductPage from './EditProductPage.jsx';
import CategoriesPage from './CategoriesPage.jsx';
import SubcategoriesPage from './SubcategoriesPage.jsx';
import EnquiriesPage from './EnquiriesPage.jsx';
import EnquiryDetailsPage from './EnquiryDetailsPage.jsx';
import ContentManagementPage from './ContentManagementPage.jsx';
import DownloadsManagementPage from './DownloadsManagementPage.jsx';
import CertificationsManagementPage from './CertificationsManagementPage.jsx';
import IndustriesManagementPage from './IndustriesManagementPage.jsx';
import BannerManagementPage from './BannerManagementPage.jsx';
import GlobalSettingsPage from './GlobalSettingsPage.jsx';

export default function AdminApp() {
  const [signedIn, setSignedIn] = useState(true);
  // Default to Dashboard
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [activeEnquiryType, setActiveEnquiryType] = useState('Product Enquiries');

  if (!signedIn) {
    return (
      <AdminLogin
        onLogin={() => {
          setSignedIn(true);
          setCurrentPage('Dashboard');
        }}
      />
    );
  }

  if (currentPage === 'Dashboard') {
    return (
      <DashboardPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  const isEnquiriesPage = [
    'Enquiries',
    'Product Enquiries',
    'Dealer Enquiries',
    'Technical Support',
    'Project Requirements',
  ].includes(currentPage);

  if (isEnquiriesPage) {
    const currentType = currentPage === 'Enquiries' ? activeEnquiryType : currentPage;
    return (
      <EnquiriesPage
        activeType={currentType}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => {
          if (
            ['Product Enquiries', 'Dealer Enquiries', 'Technical Support', 'Project Requirements'].includes(page)
          ) {
            setActiveEnquiryType(page);
          }
          setCurrentPage(page);
        }}
        onViewEnquiryDetails={(enq) => {
          setSelectedEnquiry(enq);
          setActiveEnquiryType(currentType);
          setCurrentPage('EnquiryDetails');
        }}
      />
    );
  }

  if (currentPage === 'EnquiryDetails') {
    return (
      <EnquiryDetailsPage
        enquiry={selectedEnquiry}
        activeType={activeEnquiryType}
        onBack={() => setCurrentPage(activeEnquiryType)}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
        onViewProductSpecs={() => setCurrentPage('ProductDetails')}
      />
    );
  }

  if (currentPage === 'Categories') {
    return (
      <CategoriesPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Subcategories') {
    return (
      <SubcategoriesPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Content Management' || currentPage === 'Management') {
    return (
      <ContentManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Download Management' || currentPage === 'Downloads Management') {
    return (
      <DownloadsManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (
    currentPage === 'Certifications Management' ||
    currentPage === 'Certificates Management'
  ) {
    return (
      <CertificationsManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Industries Management') {
    return (
      <IndustriesManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Banner Management' || currentPage === 'Banners') {
    return (
      <BannerManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Global Settings' || currentPage === 'Settings') {
    return (
      <GlobalSettingsPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'ProductDetails') {
    return (
      <ProductDescriptionPage
        product={selectedProduct}
        onBack={() => setCurrentPage('Catalogue')}
        onEditProduct={(prod) => {
          if (prod) setSelectedProduct(prod);
          setCurrentPage('EditProduct');
        }}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'EditProduct') {
    return (
      <EditProductPage
        product={selectedProduct}
        onBack={() => setCurrentPage('Catalogue')}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  return (
    <CataloguePage
      onEditProduct={(prod) => {
        setSelectedProduct(prod);
        setCurrentPage('EditProduct');
      }}
      onLogout={() => setSignedIn(false)}
      onNavigate={(page) => setCurrentPage(page)}
      onViewProductDetails={(prod) => {
        setSelectedProduct(prod);
        setCurrentPage('ProductDetails');
      }}
    />
  );
}
