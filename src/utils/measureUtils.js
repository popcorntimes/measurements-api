"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measures = void 0;
exports.findMeasureForCurrentMonth = findMeasureForCurrentMonth;
exports.measures = [];
function findMeasureForCurrentMonth(customerMeasures, measure_datetime, measure_type) {
    const measureDate = new Date(measure_datetime);
    const currentMonth = measureDate.getMonth();
    const currentYear = measureDate.getFullYear();
    return customerMeasures.find(measure => {
        const existingMeasureDate = new Date(measure.measure_datetime);
        return (existingMeasureDate.getMonth() === currentMonth &&
            existingMeasureDate.getFullYear() === currentYear &&
            measure.measure_type === measure_type);
    });
}
