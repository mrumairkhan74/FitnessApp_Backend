const ContractModel = require('../models/ContractModel');
const generateContractPDF = require('../utils/GeneratePDf');
const { uploadContract } = require('../utils/CloudinaryUpload');
const LeadModel = require('../models/LeadModel');
const { StaffModel, MemberModel } = require('../models/Discriminators');
const { NotFoundError, UnAuthorizedError, BadRequestError } = require('../middleware/error/httpErrors');

// CREATE CONTRACT
const createContract = async (req, res, next) => {
    try {
        const staffId = req.user?.id;  // Staff creating the contract
        const contractData = req.body;
        if (!contractData.member) throw new BadRequestError("Member Id required")
        const memberDoc = await MemberModel.findById(contractData.member);
        // Validate required member
        if (!memberDoc) {
            return res.status(400).json({ error: 'Member not Found' });
        }

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
        const pdfBuffer = await generateContractPDF(contractData, contractData.signature);

        // Upload PDF to Cloudinary
        const uploadedPdf = await uploadContract(pdfBuffer, fileName);

        // Create contract in DB
        const contract = await ContractModel.create({
            ...contractData,
            lead: leadId,
            member: memberDoc._id,
            pdfUrl: {
                url: uploadedPdf.url,
                public_id: uploadedPdf.public_id,
            },
        });

        // Add contract reference to staff
        await StaffModel.findByIdAndUpdate(staffId, {
            $push: { contracts: contract._id },
        });
        await MemberModel.findByIdAndUpdate(memberDoc._id, {
            $push: { contract: contract._id },
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

// GET CONTRACT PDF (view)
const getContractPdfById = async (req, res, next) => {
    try {
        const contract = await ContractModel.findById(req.params.id);
        if (!contract || !contract.pdfUrl) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.json({
            url: contract.pdfUrl.url,
            success: true
        });

    } catch (error) {
        next(error);
    }
};
const myContract = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const contracts = await ContractModel.find({ member: userId })
            .populate('createdBy', 'firstName lastName email role staffRole')
            .populate('lead', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, contracts });
    } catch (error) {
        next(error);
    }
};

const allContract = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const contract = await ContractModel.find()
            .populate('member', 'firstName lastName email startDate')
            .populate('createdBy', 'firstName lastName staffRole role')
            .populate('lead', 'name email')
        return res.status(200).json({
            success: true,
            contract
        })
    }
    catch (error) {
        next(error)
    }
}

const updateContract = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id, ...updateData } = req.body;

        // Find contract
        const contract = await ContractModel.findById(id);
        if (!contract) throw new NotFoundError('Invalid Contract Id');

        // Only staff who created the contract can update
        if (contract.createdBy.toString() !== userId)
            throw new NotFoundError("You cannot update this contract");

        // Update contract
        const updatedContract = await ContractModel.findByIdAndUpdate(id, updateData, { new: true });

        return res.status(200).json({
            success: true,
            contract: updatedContract
        });

    } catch (error) {
        next(error);
    }
};



// DOWNLOAD CONTRACT PDF
const downloadContractPdf = async (req, res, next) => {
    try {
        const contract = await ContractModel.findById(req.params.id);
        if (!contract || !contract.pdfUrl) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        res.redirect(contract.pdfUrl.url);

    } catch (error) {
        next(error);
    }
};

const cancelMembership = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const contract = await ContractModel.findById(id);
        if (!contract) return res.status(404).json({ error: 'Contract not found' });
        if (contract.member.toString() !== userId) throw new UnAuthorizedError('You cannot cancelled this membership ')
        if (contract.status !== 'Active') return res.status(400).json({ error: 'Cannot cancel this contract' });

        // Calculate effective cancellation date
        const noticePeriodDays = (contract.noticePeriod || 1) * 30; // approx 1 month
        const today = new Date();
        const effectiveDate = new Date(today.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000);

        contract.status = 'Pending Cancellation';
        contract.lastCancellationDate = today;
        contract.cancellationEffectiveDate = effectiveDate;

        await contract.save();

        res.status(200).json({
            success: true,
            message: `Your cancellation request has been submitted. Membership remains active until ${effectiveDate.toDateString()}`,
            contract
        });

    } catch (error) {
        next(error);
    }
};

const keepMembership = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const contract = await ContractModel.findById(id);
        if (contract.member.toString() !== userId) throw new UnAuthorizedError('You cannot keep this Membership')
        if (!contract) return res.status(404).json({ error: 'Contract not found' });

        contract.status = 'Active';
        contract.lastCancellationDate = null;
        contract.cancellationEffectiveDate = null;

        await contract.save();

        res.status(200).json({ success: true, message: 'Membership continues', contract });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createContract,
    getContractPdfById,
    downloadContractPdf,
    myContract,
    updateContract,
    cancelMembership,
    keepMembership,
    allContract
};
