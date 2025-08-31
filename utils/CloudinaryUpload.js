const cloudinary = require("./Cloudinary");
const { Readable } = require("stream");

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


module.exports = { uploadToCloudinary, uploadProduct, uploadContract };
