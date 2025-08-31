const ContractModel = require('../models/ContractModel');
const generateContractPDF = require('../utils/GeneratePDf');
const { uploadContract } = require('../utils/CloudinaryUpload');
const LeadModel = require('../models/LeadModel');
const { StaffModel } = require('../models/Discriminators');
const { NotFoundError } = require('../middleware/error/httpErrors');
const cloudinary = require('../utils/Cloudinary'); // Make sure you have this configured

// CREATE CONTRACT
const createContract = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        const contractData = req.body;

        // Validate lead if provided
        let leadId = null;
        if (contractData.lead) {
            const leadDoc = await LeadModel.findById(contractData.lead);
            if (!leadDoc) throw new NotFoundError('Invalid lead Id');
            leadId = leadDoc._id;
        }

        // Generate PDF
        const contractCount = await ContractModel.countDocuments();
        const fileName = `Contract-${contractCount + 1}.pdf`;
        const pdfBuffer = await generateContractPDF(contractData);

        // Upload PDF to Cloudinary
        const uploadedPdf = await uploadContract(pdfBuffer, fileName);

        // Create contract in DB
        const contract = await ContractModel.create({
            ...contractData,
            lead: leadId,
            pdfUrl: {
                url: uploadedPdf.url,
                public_id: uploadedPdf.public_id,
            },
        });

        // Add contract reference to staff
        await StaffModel.findByIdAndUpdate(userId, {
            $push: { contracts: contract._id },
        });

        res.status(200).json({
            status: true,
            message: "Contract created successfully",
            contract,
        });
    } catch (error) {
        next(error);
    }
};

// GET CONTRACT PDF (download)
const getContractPdfById = async (req, res, next) => {
    try {
        const contract = await ContractModel.findById(req.params.id);
        if (!contract || !contract.pdfUrl) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // For public files, we can directly use the stored URL
        // No need for signed URLs if the file is public
        res.json({ 
            url: contract.pdfUrl.url,
            success: true
        });

    } catch (error) {
        next(error);
    }
};

// NEW: Direct download endpoint
const downloadContractPdf = async (req, res, next) => {
    try {
        const contract = await ContractModel.findById(req.params.id);
        if (!contract || !contract.pdfUrl) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // Redirect to Cloudinary URL for download
        res.redirect(contract.pdfUrl.url);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createContract,
    getContractPdfById,
    downloadContractPdf
};