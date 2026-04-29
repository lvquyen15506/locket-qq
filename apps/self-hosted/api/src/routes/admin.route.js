const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");

// Middleware check admin secret key (Tạm thời dùng header x-admin-secret)
const checkAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    if (secret === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized Admin" });
    }
};

router.get("/stats", checkAdmin, AdminController.getStats);
router.get("/themes", AdminController.getGlobalThemes); // Public để Web app lấy theme
router.post("/themes", checkAdmin, AdminController.updateGlobalThemes);
router.get("/config", AdminController.getSystemConfig); // Public để Web app lấy config
router.post("/config", checkAdmin, AdminController.updateSystemConfig);

module.exports = router;
