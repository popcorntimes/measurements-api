"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const uploadRoutes_1 = require("./routes/uploadRoutes");
const uploadController_1 = require("./controllers/uploadController");
const geminiService_1 = require("./services/geminiService");
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use('/upload', (0, uploadRoutes_1.uploadRoutes)(uploadController_1.uploadController, geminiService_1.geminiService));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map