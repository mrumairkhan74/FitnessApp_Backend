const jwt = require('jsonwebtoken')

const verifyAccessToken = (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({ error: "Invalid Access Token " })
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN)

        req.user = {
            id: decoded.id,
            email: decoded.email,
            studioName: decoded.studioName,
            role: decoded.role,
            username: decoded.username,
            img: decoded.img,
            staffRole: decoded.staffRole,
        }
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Access Token Expired" });
        }
        return res.status(401).json({ error: "Invalid Token" });
    }
}


// refresh access Token

const verifyRefreshToken = (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken
        if (!token) {
            return res.status(401).json({ error: "Invalid Refresh Token " })
        }
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN)
        req.user = {
            id: decoded.id,
            email: decoded.email,
            studioName: decoded.studioName,
            role: decoded.role,
            username: decoded.username,
            img: decoded.img,
            staffRole: decoded.staffRole,
        }
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Refresh Token Expired" });
        }
        return res.status(401).json({ error: "Invalid Token" });
    }
}


module.exports = { verifyAccessToken, verifyRefreshToken }