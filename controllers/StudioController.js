const StudioModel = require('../models/StudioModel');
const { NotFoundError, UnAuthorizedError } = require('../middleware/error/httpErrors')
const cloudinary = require('../utils/Cloudinary')
const { Readable } = require('stream')

const updateStudio = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffRole = req.user?.staffRole;
        const userId = req.user?.id;

        // Only managers can update
        if (staffRole !== "manager") {
            throw new UnAuthorizedError("Only Managers can update the studio");
        }

        // Find studio
        const studio = await StudioModel.findById(id);
        if (!studio) throw new NotFoundError("Studio not found");

        // Check if this manager is assigned to the studio
        if (!studio.createdBy.map(s => s.toString()).includes(userId.toString())) {
            throw new UnAuthorizedError("You can only update your own studio");
        }

        let {
            studioOwner,
            phone,
            email,
            street,
            zipCode,
            city,
            country,
            website,
            openingHours,
            closingDays
        } = req.body;

        // Handle comma-separated string for closingDays
        if (typeof closingDays === "string") {
            closingDays = closingDays.split(",").map(day => day.trim());
        }

        // Handle logo upload
        let logo = studio.logo;
        if (req.file) {
            const bufferStream = new Readable();
            bufferStream.push(req.file.buffer);
            bufferStream.push(null);

            const streamUpload = () =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'Timathy/profiles', resource_type: 'image' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    bufferStream.pipe(stream);
                });

            const cloudinaryResult = await streamUpload();
            logo = {
                url: cloudinaryResult.secure_url,
                public_id: cloudinaryResult.public_id
            };
        }

        // Build update object, ignoring undefined fields
        const updateFields = {};
        [
            "studioOwner",
            "phone",
            "email",
            "street",
            "zipCode",
            "city",
            "country",
            "website",
            "openingHours",
            "closingDays",
            "logo"
        ].forEach(key => {
            if (typeof eval(key) !== "undefined") updateFields[key] = eval(key);
        });

        const updatedStudio = await StudioModel.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        return res.status(200).json({
            status: true,
            message: "Studio Successfully Updated",
            studio: updatedStudio
        });

    } catch (error) {
        next(error);
    }
};


module.exports = { updateStudio }
