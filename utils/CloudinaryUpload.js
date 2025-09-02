const cloudinary = require("./Cloudinary");
const { Readable } = require("stream");


// --- Profile Images ---

const uploadToCloudinary = (fileBuffer, folder = "Timathy/profiles") => {
  return new Promise((resolve, reject) => {
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferStream.pipe(stream);
  });
};

// --- upload products and services ---

const uploadProduct = (fileBuffer, folder = "Timathy/sellings") => {
  return new Promise((resolve, reject) => {
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferStream.pipe(stream);
  });
};

// --- Idle Period Document Upload

const uploadIdlePeriod = (fileBuffer, folder = "Timathy/vacation") => {
  return new Promise((resolve, reject) => {
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferStream.pipe(stream);
  });
};



// --- Contract Upload to Cloudinary ---

const uploadContract = (fileBuffer, fileName, folder = "Timathy/contracts") => {
  return new Promise((resolve, reject) => {
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "raw",
        type: "upload",
        public_id: fileName.replace(".pdf", ""),
        format: "pdf",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        access_mode: "public", // Ensure files are publicly accessible
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    bufferStream.pipe(stream);
  });
};


module.exports = { uploadToCloudinary, uploadProduct, uploadContract, uploadIdlePeriod };
