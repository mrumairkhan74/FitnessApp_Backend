const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

const isStaff = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ error: "Access denied:Staff Only " })
  }
  next();
}
const isMember = (req, res, next) => {
  if (req.user.role !== "member") {
    return res.status(403).json({ error: "Access denied:Member Only " })
  }
  next();
}


const isManager = (req, res, next) => {
  if (req.user.role !== "staff" || req.user.staffRole !== "manager") {
    return res.status(403).json({ error: "Access denied: Managers only" });
  }
  next();
};

module.exports = { isAdmin, isStaff, isMember, isManager };