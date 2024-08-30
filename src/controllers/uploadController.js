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
exports.uploadController = exports.generateRandomImageUrl = void 0;
const uuid_1 = require("uuid");
const validations_1 = require("../utils/validations");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'db',
    database: 'measurements',
    password: 'yourpassword',
    port: 5432,
});
const generateRandomImageUrl = () => {
    const uniqueIdentifier = (0, uuid_1.v4)();
    return `https://randomimage.com/${uniqueIdentifier}.jpg`;
};
exports.generateRandomImageUrl = generateRandomImageUrl;
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
            const clientQuery = yield pool.query('SELECT * FROM customer_measures WHERE customer_code = $1', [customer_code]);
            if (clientQuery.rowCount === 0) {
                yield pool.query('INSERT INTO customer_measures (customer_code) VALUES ($1)', [customer_code]);
            }
            const measuresQuery = yield pool.query('SELECT * FROM measures WHERE customer_code = $1 AND measure_datetime::DATE = $2 AND measure_type = $3', [customer_code, measure_datetime, measure_type]);
            if (measuresQuery.rowCount !== null && measuresQuery.rowCount > 0) {
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
                image_url: (0, exports.generateRandomImageUrl)(),
                measure_value,
            };
            yield pool.query('INSERT INTO measures (measure_uuid, measure_datetime, measure_type, has_confirmed, image_url, measure_value, customer_code) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
                newMeasure.measure_uuid,
                newMeasure.measure_datetime,
                newMeasure.measure_type,
                newMeasure.has_confirmed,
                newMeasure.image_url,
                newMeasure.measure_value,
                customer_code,
            ]);
            return res.status(200).json({
                image_url: newMeasure.image_url,
                measure_value: newMeasure.measure_value,
                measure_uuid: newMeasure.measure_uuid,
            });
        }
        catch (error) {
            console.error('Erro ao processar solicitação:', error);
            return res.status(500).json({
                error_code: 'INTERNAL_SERVER_ERROR',
                error_description: 'Erro interno do servidor.',
            });
        }
    }),
});
exports.uploadController = uploadController;
