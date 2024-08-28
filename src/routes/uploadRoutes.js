"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const express_1 = require("express");
// A rota agora recebe as interfaces como dependências
const uploadRoutes = (uploadController, geminiService) => {
    const router = (0, express_1.Router)();
    // Instanciar a controller, passando a implementação de GeminiService
    const controller = uploadController(geminiService);
    router.post('/', controller.handle);
    return router;
};
exports.uploadRoutes = uploadRoutes;
