import ProjectRequirement from '../models/ProjectRequirement.js';
import Enquiry from '../models/Enquiry.js';

// @desc    Get all project requirements with filters
// @route   GET /api/project-requirements
// @access  Public / Admin
export const getProjectRequirements = async (req, res) => {
  try {
    const { industry, status, search } = req.query;
    const query = {};

    if (industry && industry !== 'All') {
      query.$or = [{ industryName: industry }, { industrySlug: industry }];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { referenceNumber: regex },
        { projectName: regex },
        { companyName: regex },
        { contactPerson: regex },
        { email: regex },
        { industryName: regex },
      ];
    }

    const requirements = await ProjectRequirement.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requirements.length,
      requirements,
    });
  } catch (error) {
    console.error('Error in getProjectRequirements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project requirements',
      error: error.message,
    });
  }
};

// @desc    Get single project requirement by ID or reference
// @route   GET /api/project-requirements/:id
// @access  Public / Admin
export const getProjectRequirementById = async (req, res) => {
  try {
    const { id } = req.params;
    let requirement = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      requirement = await ProjectRequirement.findById(id);
    }
    if (!requirement) {
      requirement = await ProjectRequirement.findOne({ referenceNumber: id });
    }

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Project requirement not found',
      });
    }

    res.status(200).json({
      success: true,
      requirement,
    });
  } catch (error) {
    console.error('Error in getProjectRequirementById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project requirement',
      error: error.message,
    });
  }
};

// @desc    Create new project requirement submission
// @route   POST /api/project-requirements
// @access  Public
export const createProjectRequirement = async (req, res) => {
  try {
    const {
      industryName,
      industrySlug,
      projectName,
      companyName,
      contactPerson,
      email,
      phone,
      location,
      baseMaterials,
      weldingProcess,
      standards,
      estimatedVolume,
      targetDeliveryDate,
      projectScopeDetails,
    } = req.body;

    if (!projectName || !companyName || !contactPerson || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project name, company, contact person, and email address',
      });
    }

    const requirement = await ProjectRequirement.create({
      industryName: industryName || 'General Industrial',
      industrySlug: industrySlug || 'general-industrial',
      projectName,
      companyName,
      contactPerson,
      email,
      phone: phone || '',
      location: location || '',
      baseMaterials: baseMaterials || '',
      weldingProcess: weldingProcess || '',
      standards: standards || '',
      estimatedVolume: estimatedVolume || '',
      targetDeliveryDate: targetDeliveryDate || '',
      projectScopeDetails: projectScopeDetails || '',
      status: 'New',
    });

    // Also mirror to Enquiry collection under 'Project Requirement' type
    try {
      await Enquiry.create({
        companyName,
        contactName: contactPerson,
        email,
        phone: phone || '',
        enquiryType: 'Project Requirement',
        skuOrClass: industryName || 'Project Requirements',
        productInterested: `${projectName} (${industryName})`,
        projectName,
        industryName,
        industrySlug,
        primaryLocation: location || '',
        baseMaterials: baseMaterials || '',
        weldingProcess: weldingProcess || '',
        standards: standards || '',
        estimatedVolume: estimatedVolume || '',
        targetDeliveryDate: targetDeliveryDate || '',
        projectScopeDetails: projectScopeDetails || '',
        message: projectScopeDetails || `Technical requirement submission for ${projectName} in ${industryName}`,
        referenceCode: requirement.referenceNumber,
        status: 'New',
      });
    } catch (enqErr) {
      console.warn('Failed to mirror project requirement to Enquiry collection:', enqErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Project requirements submitted successfully',
      requirement,
    });
  } catch (error) {
    console.error('Error in createProjectRequirement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting project requirements',
      error: error.message,
    });
  }
};

// @desc    Update project requirement status or notes
// @route   PUT /api/project-requirements/:id
// @access  Admin
export const updateProjectRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const requirement = await ProjectRequirement.findById(id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Project requirement not found',
      });
    }

    if (status !== undefined) requirement.status = status;
    if (adminNotes !== undefined) requirement.adminNotes = adminNotes;

    await requirement.save();

    res.status(200).json({
      success: true,
      message: 'Project requirement updated successfully',
      requirement,
    });
  } catch (error) {
    console.error('Error in updateProjectRequirement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project requirement',
      error: error.message,
    });
  }
};

// @desc    Delete project requirement
// @route   DELETE /api/project-requirements/:id
// @access  Admin
export const deleteProjectRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await ProjectRequirement.findByIdAndDelete(id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Project requirement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project requirement deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteProjectRequirement:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project requirement',
      error: error.message,
    });
  }
};
