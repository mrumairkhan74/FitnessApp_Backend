const { StaffModel } = require('../models/Discriminators');
const generateToken = require('../utils/GenerateToken');
const hashedPassword = require('../utils/HashedPassword');
const bcrypt = require('bcryptjs');
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} = require('../middleware/error/httpErrors');
const { uploadToCloudinary } = require('../utils/CloudinaryUpload')
const cloudinary = require('../utils/Cloudinary')
const { Readable } = require('stream');
const StudioModel = require('../models/StudioModel');



// create staff/Staff
const createStaff = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      studioName,
      staffRole,
      phone,
      username,
      vacationEntitlement,
      input,
      city,
      street,
      zipCode,
      dateOfBirth,
      about
    } = req.body;

    // Check email conflict
    const checkEmail = await StaffModel.findOne({ email });
    if (checkEmail) throw new ConflictError("❗️ Email Conflict");

    // Image required
    if (!req.file) throw new NotFoundError("Image Not Uploaded");

    // upload image to cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    // Password validation
    if (!password || password.length < 8)
      throw new BadRequestError("Invalid Password: Must be at least 8 characters");

    const securePassword = await hashedPassword(password);

    // 🔑 Find or create studio
    let studio = await StudioModel.findOne({ studioName });
    if (!studio) {
      // If creating studio → Only manager can do it
      if (staffRole !== "manager") {
        throw new UnauthorizedError("Only managers can create new studios");
      }
      studio = await StudioModel.create({ studioName });
    }

    // Create staff
    const staff = await StaffModel.create({
      studio: studio._id,
      firstName,
      lastName,
      staffRole,
      phone,
      img: {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
      },
      username,
      vacationEntitlement,
      input,
      city,
      street,
      zipCode,
      dateOfBirth,
      about,
      email,
      password: securePassword,
    });

    // Tokens
    const { AccessToken, RefreshToken } = generateToken({
      id: staff._id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      username: staff.username,
      email: staff.email,
      studio: studio.studioName,
      studioId: studio._id,
      role: staff.role,
      img: staff.img,
      staffRole: staff.staffRole,
    });

    staff.refreshToken = RefreshToken;
    await staff.save();

    res.cookie("token", AccessToken, { httpOnly: true, sameSite: "strict", secure: true });
    res.cookie("refreshToken", RefreshToken, { httpOnly: true, sameSite: "strict", secure: true });

    await StudioModel.findByIdAndUpdate(studio._id, {
      $push: { createdBy: staff._id }
    },
      { new: true }
    );

    res.status(200).json({
      message: "Successfully Created",
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        username: staff.username,
        email: staff.email,
        studio: studio.studioName,
        studioId: studio._id,
        role: staff.role,
        img: staff.img,
        staffRole: staff.staffRole,
      },
    });
  } catch (err) {
    next(err);
  }
};

// login staff/Staff
const loginStaff = async (req, res, next) => {
  try {
    const { email, password, studioName } = req.body;

    const studio = await StudioModel.findOne({ studioName });
    const staff = await StaffModel.findOne({ email, studio: studio._id })
      .select("+password")
      .populate("studio", "studioName");

    if (!staff) throw new NotFoundError("Invalid Email && studioName");

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) throw new UnauthorizedError("Invalid Password");

    const { AccessToken, RefreshToken } = generateToken({
      id: staff._id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      username: staff.username,
      email: staff.email,
      studioName: staff.studio.studioName,
      studioId: staff.studioId,
      role: staff.role,
      img: staff.img, // full object
      staffRole: staff.staffRole,
    });

    staff.refreshToken = RefreshToken;
    await staff.save();

    res.cookie("token", AccessToken, { httpOnly: true, sameSite: "strict", secure: true });
    res.cookie("refreshToken", RefreshToken, { httpOnly: true, sameSite: "strict", secure: true });

    res.status(200).json({
      message: "Successfully Logged In",
      token: AccessToken,
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        username: staff.username,
        email: staff.email,
        studio: {
          studioName: staff.studio.studioName,
        },
        studioId: staff.studio._id,
        role: staff.role,
        img: staff.img, // full object for consistency
        staffRole: staff.staffRole,
      },
    });
  } catch (err) {
    next(err);
  }
};

// update staff/Staff
const updateStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateStaff = { ...req.body };

    if (!req.file) throw new NotFoundError("Image Not Uploaded");

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    // ✅ Save new image URL + public_id into update object
    updateStaff.img = {
      url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
    };

    // Update staff in MongoDB
    const staff = await StaffModel.findByIdAndUpdate(id, updateStaff, { new: true });
    if (!staff) throw new NotFoundError("staff not found");

    res.status(200).json({
      message: "Successfully Updated",
      staff: {
        id: staff._id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        username: staff.username,
        email: staff.email,
        studioName: staff.studioName,
        role: staff.role,
        img: staff.img?.url, // ✅ now points to Cloudinary URL
        staffRole: staff.staffRole,
      },
    });
  } catch (err) {
    next(err);
  }
};






// get staff/Staff byID
const getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await StaffModel.findById(id).populate('studio', 'studioName studioOwner logo email phone').select('-password');
    if (!staff) throw new NotFoundError("staff not found");

    res.status(200).json({ staff });
  } catch (err) {
    next(err);
  }
};




// delete Staff/staff
const deleteStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await StaffModel.findByIdAndDelete(id);
    if (!staff) throw new NotFoundError("staff not found");

    res.status(200).json({ message: "Successfully Deleted" });
  } catch (err) {
    next(err);
  }
};




// get all staff
const getStaff = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 5);
    const skip = (page - 1) * limit;


    const staff = await StaffModel.find().populate('studio', 'studioName studioOwner logo email phone').skip(skip).limit(limit);

    const totalstaff = await StaffModel.countDocuments();
    const totalPages = Math.ceil(totalstaff / limit);



    res.status(200).json({
      page,
      limit,
      totalPages,
      totalstaff,
      staff: {
        staff
      }
    });
  } catch (err) {
    next(err);
  }
}



module.exports = {
  createStaff,
  loginStaff,
  updateStaffById,
  deleteStaffById,
  getStaff,
  getStaffById,

};
