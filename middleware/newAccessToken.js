const jwt = require('jsonwebtoken')


const GenerateNewAccessToken = async (req, res) => {
    try {
        const { id, email, studioName, role, username, img, staffRole } = req.user;
        const newAccessToken = jwt.sign({ id, email, studioName, role, username, img, staffRole }, process.env.JWT_ACCESS_TOKEN, { expiresIn: process.env.JWT_ACCESS_EXPIRY })

        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })

        return res.status(200).json({ message: 'New token Generated' })
    }
    catch (error) {
        return res.status(500).json({ error: "❗️ Token doesn't Refresh RightNow" })
    }
}

module.exports = { GenerateNewAccessToken }