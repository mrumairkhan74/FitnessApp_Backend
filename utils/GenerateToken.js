const jwt = require("jsonwebtoken");

const accessSecret = process.env.JWT_ACCESS_TOKEN;
const accessExpiry = process.env.JWT_ACCESS_EXPIRY;

const refreshSecret = process.env.JWT_REFRESH_TOKEN;
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY;

const generateToken = ({ firstName, lastName, id, email, role, studioId, studioName, username, img, staffRole }) => {
  if (!id || !email || !role) {
    throw new Error("Missing required fields for token generation");
  }

  // Payload for access token (full user context)
  const payload = {
    firstName,
    lastName,
    id,
    email,
    role,
    studioName,
    username,
    studioId,
    img: {
      public_id: img?.public_id || "",
      url: img?.url || ""
    },
    staffRole
  };

  // Access token (short-lived)
  const AccessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpiry });

  // Refresh token (long-lived, minimal info)
  const refreshPayload = {
    id,
    email,
    role
  };
  const RefreshToken = jwt.sign(refreshPayload, refreshSecret, { expiresIn: refreshExpiry });

  return { AccessToken, RefreshToken };
};

module.exports = generateToken;
