const AdminService = require("../services/AdminService");

class AdminController {
    async getStats(req, res, next) {
        try {
            const users = await AdminService.getUsers();
            res.status(200).json({
                success: true,
                data: {
                    totalUsers: users.length,
                    users: users
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getGlobalThemes(req, res, next) {
        try {
            const themes = await AdminService.getGlobalThemes();
            res.status(200).json({ success: true, data: themes });
        } catch (error) {
            next(error);
        }
    }

    async updateGlobalThemes(req, res, next) {
        try {
            const themes = await AdminService.updateGlobalThemes(req.body);
            res.status(200).json({ success: true, data: themes });
        } catch (error) {
            next(error);
        }
    }

    async getSystemConfig(req, res, next) {
        try {
            const config = await AdminService.getSystemConfig();
            res.status(200).json({ success: true, data: config });
        } catch (error) {
            next(error);
        }
    }

    async updateSystemConfig(req, res, next) {
        try {
            const config = await AdminService.updateSystemConfig(req.body);
            res.status(200).json({ success: true, data: config });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
