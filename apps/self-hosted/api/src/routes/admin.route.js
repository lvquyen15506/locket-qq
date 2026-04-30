const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const AdminController = require("../controllers/admin.controller");

const JWT_SECRET = () => process.env.ADMIN_JWT_SECRET || "fallback_secret";

// ==================== LOGIN ====================
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Thiếu username hoặc password" });
    }

    if (username === expectedUser && password === expectedPass) {
        const token = jwt.sign(
            { role: "admin", username },
            JWT_SECRET(),
            { expiresIn: "24h" }
        );
        return res.status(200).json({ success: true, token });
    }

    return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
});

// ==================== JWT MIDDLEWARE ====================
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Không có token xác thực" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET());
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Không đủ quyền" });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc hết hạn" });
    }
};

// ==================== PROTECTED ROUTES ====================
router.get("/stats", verifyAdmin, AdminController.getStats);
router.post("/themes", verifyAdmin, AdminController.updateGlobalThemes);
router.post("/config", verifyAdmin, AdminController.updateSystemConfig);

// ==================== PUBLIC ROUTES (Web app cần lấy) ====================
router.get("/themes", AdminController.getGlobalThemes);
router.get("/config", AdminController.getSystemConfig);

module.exports = router;
