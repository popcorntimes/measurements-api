"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const uuid_1 = require("uuid");
const validations_1 = require("../utils/validations");
const measureUtils_1 = require("../utils/measureUtils");
const uploadController = (geminiService) => ({
    handle: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { image, customer_code, measure_datetime, measure_type } = req.body;
            const validationErrors = (0, validations_1.validateInput)(image, customer_code, measure_datetime, measure_type);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    error_code: 'INVALID_DATA',
                    error_description: validationErrors.join(', '),
                });
            }
            let customerMeasures = measureUtils_1.measures.find(cm => cm.customer_code === customer_code);
            if (!customerMeasures) {
                customerMeasures = { customer_code, measures: [] };
                measureUtils_1.measures.push(customerMeasures);
            }
            const existingMeasure = (0, measureUtils_1.findMeasureForCurrentMonth)(customerMeasures.measures, measure_datetime);
            if (existingMeasure) {
                return res.status(409).json({
                    error_code: 'DOUBLE_REPORT',
                    error_description: 'Leitura do mês já realizada.',
                });
            }
            const measure_value = yield geminiService.processImage(image, customer_code, measure_datetime, measure_type);
            const newMeasure = {
                measure_uuid: (0, uuid_1.v4)(),
                measure_datetime,
                measure_type,
                has_confirmed: false,
                image_url: 'www.imgurl.com/measurement' + `${measure_datetime}`, // Você pode gerar uma URL temporária aqui, se necessário
                measure_value,
            };
            customerMeasures.measures.push(newMeasure);
            return res.status(200).json({
                image_url: newMeasure.image_url,
                measure_value: newMeasure.measure_value,
                measure_uuid: newMeasure.measure_uuid,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({
                error_code: 'INTERNAL_SERVER_ERROR',
                error_description: 'Erro interno do servidor.',
            });
        }
    }),
});
exports.uploadController = uploadController;
//# sourceMappingURL=uploadController.js.map