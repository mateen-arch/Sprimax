import Enquiry from '../models/Enquiry.js';

// @desc    Submit a new industrial technical enquiry
// @route   POST /api/enquiries
// @access  Public
export const createEnquiry = async (req, res, next) => {
  try {
    const {
      companyName,
      company,
      contactName,
      contactPerson,
      customer,
      name,
      fullName,
      email,
      corporateEmail,
      phone,
      phoneNumber,
      skuOrClass,
      productInterested,
      enquiryType,
      type,
      projectScope,
      message,
      additionalMessage,
      businessType,
      primaryLocation,
      currentProductRange,
      yearsInBusiness,
      quantity,
      unit,
      requiredDate,
      application,
      specifications,
      subject,
      enquirySubject,
      industry,
      industryName,
      industrySlug,
      projectName,
      baseMaterials,
      weldingProcess,
      standards,
      estimatedVolume,
      targetDeliveryDate,
      projectScopeDetails,
    } = req.body;

    const finalContact = contactName || contactPerson || customer || fullName || name || 'Prospective Client';
    const finalCompany = companyName || company || 'Industrial Partner';
    const finalEmail = (email || corporateEmail || `${finalContact.toLowerCase().replace(/\s+/g, '')}@example.com`).trim().toLowerCase();
    const finalPhone = phone || phoneNumber || '';

    // Determine normalized enquiry type
    let finalType = 'Product Enquiry';
    const rawType = (enquiryType || type || '').toLowerCase();
    if (rawType.includes('dealer') || rawType.includes('distributor')) {
      finalType = 'Dealer Enquiry';
    } else if (rawType.includes('technical') || rawType.includes('support')) {
      finalType = 'Technical Support';
    } else if (rawType.includes('project') || rawType.includes('requirement')) {
      finalType = 'Project Requirement';
    } else {
      finalType = 'Product Enquiry';
    }

    const finalSubject = subject || enquirySubject || (finalType === 'Technical Support' ? 'General Technical Inquiry' : '');
    const finalMessage = message || additionalMessage || projectScopeDetails || `Enquiry for ${productInterested || finalSubject || finalType}`;

    const enquiry = await Enquiry.create({
      companyName: finalCompany,
      contactName: finalContact,
      email: finalEmail,
      phone: finalPhone,
      skuOrClass: skuOrClass || productInterested || finalSubject || 'Industrial Specification',
      productInterested: productInterested || skuOrClass || finalSubject || 'Industrial Consumables',
      enquiryType: finalType,
      projectScope: projectScope || 'Standard Production',
      message: finalMessage.trim(),
      businessType: businessType || '',
      primaryLocation: primaryLocation || '',
      currentProductRange: currentProductRange || '',
      yearsInBusiness: yearsInBusiness || '',
      quantity: quantity || '',
      unit: unit || 'KG',
      requiredDate: requiredDate || '',
      application: application || '',
      specifications: specifications || '',
      subject: finalSubject,
      industry: industry || industryName || '',
      industryName: industryName || industry || '',
      industrySlug: industrySlug || '',
      projectName: projectName || '',
      baseMaterials: baseMaterials || '',
      weldingProcess: weldingProcess || '',
      standards: standards || '',
      estimatedVolume: estimatedVolume || '',
      targetDeliveryDate: targetDeliveryDate || '',
      projectScopeDetails: projectScopeDetails || '',
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry received. An engineering specialist will review your specifications.',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries with type & search filters
// @route   GET /api/enquiries
// @access  Public / Admin
export const getEnquiries = async (req, res, next) => {
  try {
    const { status, type, search, includeTest } = req.query;
    const query = {};

    // Exclude seeded/test records by default unless includeTest=true
    if (includeTest === 'true') {
      // return all
    } else if (includeTest === 'only') {
      query.isTest = true;
    } else {
      query.isTest = { $ne: true };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      if (type === 'Product Enquiry' || type === 'Product Enquiries') {
        query.enquiryType = { $in: ['Product Enquiry', 'Product Quote', 'General Inquiry'] };
      } else if (type === 'Dealer Enquiry' || type === 'Dealer Enquiries') {
        query.enquiryType = { $in: ['Dealer Enquiry', 'Dealer Application', 'Distributor Enquiry'] };
      } else if (type === 'Technical Support') {
        query.enquiryType = { $in: ['Technical Support', 'Support'] };
      } else if (type === 'Project Requirement' || type === 'Project Requirements') {
        query.enquiryType = { $in: ['Project Requirement', 'Project Requirements'] };
      } else {
        query.enquiryType = type;
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { contactName: searchRegex },
        { companyName: searchRegex },
        { email: searchRegex },
        { message: searchRegex },
        { referenceCode: searchRegex },
        { skuOrClass: searchRegex },
        { productInterested: searchRegex },
        { businessType: searchRegex },
        { primaryLocation: searchRegex },
        { projectName: searchRegex },
        { industryName: searchRegex },
        { subject: searchRegex },
      ];
    }

    const enquiries = await Enquiry.find(query)
      .populate('productId', 'name sku category subcategory awsClass awsClassification image images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry status or details
// @route   PATCH /api/enquiries/:id
// @access  Public / Admin
export const updateEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found`,
      });
    }

    Object.assign(enquiry, req.body);
    const updated = await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
// @access  Public / Admin
export const deleteEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: `Enquiry with ID ${id} not found`,
      });
    }

    await Enquiry.deleteOne({ _id: enquiry._id });

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
