"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const express_1 = require("express");
const uploadRoutes = (uploadController, geminiService) => {
    const router = (0, express_1.Router)();
    const controller = uploadController(geminiService);
    router.post('/', controller.handle);
    return router;
};
exports.uploadRoutes = uploadRoutes;
