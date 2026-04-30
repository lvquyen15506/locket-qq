const axios = require('axios');
const { logInfo, logError } = require('../utils/logEventUtils');

const PROJECT_ID = process.env.MY_FIREBASE_PROJECT_ID;
const API_KEY = process.env.MY_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Helper để map Firestore Document sang JSON
const fromFirestore = (doc) => {
    const fields = doc.fields || {};
    const result = {};
    for (const [key, value] of Object.entries(fields)) {
        if (value.stringValue) result[key] = value.stringValue;
        else if (value.integerValue) result[key] = parseInt(value.integerValue);
        else if (value.booleanValue) result[key] = value.booleanValue;
        else if (value.timestampValue) result[key] = value.timestampValue;
        else if (value.arrayValue) {
            result[key] = (value.arrayValue.values || []).map(v => v.stringValue || v);
        }
        else if (value.mapValue) {
            // Handle simple map if needed
        }
    }
    return { ...result, uid: doc.name.split('/').pop() };
};

// Helper để map JSON sang Firestore Fields
const toFirestoreFields = (data) => {
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') fields[key] = { stringValue: value };
        else if (typeof value === 'number') fields[key] = { integerValue: value.toString() };
        else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
        else if (Array.isArray(value)) {
            fields[key] = { arrayValue: { values: value.map(v => ({ stringValue: v })) } };
        }
    }
    return { fields };
};

class AdminService {
    async syncUser(userData) {
        try {
            if (!PROJECT_ID) return;

            const userInfo = {
                email: userData.email || "",
                displayName: userData.displayName || userData.username || `${userData.firstName} ${userData.lastName}` || "Unknown",
                photoURL: userData.profilePicture || "",
                lastSeen: new Date().toISOString(),
                createdAt: userData.createdAt || new Date().toISOString()
            };

            // Sử dụng PATCH với updateMask để tạo hoặc cập nhật document
            const url = `${BASE_URL}/users/${userData.uid}?key=${API_KEY}`;
            await axios.patch(url, toFirestoreFields(userInfo));
            
            logInfo('AdminService', `Synced user to personal Firebase: ${userInfo.email}`);
        } catch (error) {
            logError('AdminService', `SyncUser error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async getUsers() {
        try {
            const url = `${BASE_URL}/users?key=${API_KEY}`;
            const res = await axios.get(url);
            const docs = res.data.documents || [];
            return docs.map(fromFirestore);
        } catch (error) {
            logError('AdminService', `getUsers error: ${error.message}`);
            return [];
        }
    }

    async getGlobalThemes() {
        try {
            const url = `${BASE_URL}/settings/global_themes?key=${API_KEY}`;
            const res = await axios.get(url);
            return fromFirestore(res.data);
        } catch {
            return {
                background: [],
                special: [],
                decorative: [],
                custome: [],
                image_icon: [],
                image_gif: [],
            };
        }
    }

    async updateGlobalThemes(themes) {
        try {
            const url = `${BASE_URL}/settings/global_themes?key=${API_KEY}`;
            await axios.patch(url, toFirestoreFields(themes));
            return themes;
        } catch (error) {
            logError('AdminService', `updateThemes error: ${error.message}`);
            throw error;
        }
    }

    async getSystemConfig() {
        try {
            const url = `${BASE_URL}/settings/system_config?key=${API_KEY}`;
            const res = await axios.get(url);
            return fromFirestore(res.data);
        } catch {
            return {
                maintenance: false,
                notification: "Chào mừng bạn đến với Locket QQ!",
                version: "1.0.0"
            };
        }
    }

    async updateSystemConfig(config) {
        try {
            const url = `${BASE_URL}/settings/system_config?key=${API_KEY}`;
            await axios.patch(url, toFirestoreFields(config));
            return config;
        } catch (error) {
            logError('AdminService', `updateConfig error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new AdminService();
