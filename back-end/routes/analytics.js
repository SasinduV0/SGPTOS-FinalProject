const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const ProductionPlan = require("../models/ProductionPlan");
const { GarmentDefects } = require("../models/iot");

// Helper to get date range based on period string
const getDateRange = (period) => {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (period) {
        case 'weekly':
            start.setDate(start.getDate() - 7);
            break;
        case 'monthly':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'annually':
            start.setFullYear(start.getFullYear() - 1);
            break;
        case 'today':
        default:
            // Start is already today
            break;
    }
    return { start, end };
};

// Helper to determine status from efficiency percentage
const getStatus = (percentage) => {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 85) return 'Good';
    if (percentage >= 70) return 'Average';
    return 'Poor';
};

// Main endpoint to fetch data for a specific report type and period
router.get('/:reportType/:period', async (req, res) => {
    const { reportType, period } = req.params;
    const { start, end } = getDateRange(period);
    let reportData = [];

    try {
        switch (reportType) {
            case 'line-efficiency':
            case 'employee-efficiency': // Both can be derived from employee data
                const employees = await Employee.find({ updatedAt: { $gte: start, $lte: end } });
                const lineTotals = employees.reduce((acc, emp) => {
                    const line = emp.line || 'Unassigned';
                    if (!acc[line]) {
                        acc[line] = { actual: 0, workers: 0 };
                    }
                    acc[line].actual += emp.pcs || 0;
                    acc[line].workers += 1;
                    return acc;
                }, {});

                // Assuming a base target per line, can be adjusted
                const lineTargets = { 1: 1000, 2: 800, 3: 900, 4: 1100, 5: 950, 6: 1050, 7: 700, 8: 850 };

                reportData = Object.keys(lineTotals).map(line => {
                    const actual = lineTotals[line].actual;
                    const target = (lineTargets[line] || 800) * (period === 'weekly' ? 7 : period === 'monthly' ? 30 : 1); // Adjust target for period
                    const percentage = target > 0 ? Math.min(100, (actual / target) * 100).toFixed(1) : 0;
                    return {
                        category: `Line ${line}`,
                        value: actual,
                        target: target,
                        percentage: parseFloat(percentage),
                        status: getStatus(parseFloat(percentage)),
                    };
                });
                break;

            case 'target-achievement':
                const plans = await ProductionPlan.find({ startDate: { $lte: end }, endDate: { $gte: start } });
                reportData = plans.map(plan => {
                    const percentage = plan.totalStock > 0 ? Math.min(100, (plan.finishedUnits / plan.totalStock) * 100).toFixed(1) : 0;
                    return {
                        category: plan.product,
                        value: plan.finishedUnits,
                        target: plan.totalStock,
                        percentage: parseFloat(percentage),
                        status: getStatus(parseFloat(percentage)),
                    };
                });
                break;

            case 'defect-rate':
                const defects = await GarmentDefects.find({ Time_Stamp: { $gte: start, $lte: end } });
                const totalProduction = await Employee.aggregate([
                    { $match: { updatedAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, total: { $sum: "$pcs" } } }
                ]);
                const totalPcs = totalProduction.length > 0 ? totalProduction[0].total : 0;
                const totalDefects = defects.length;
                const overallRate = totalPcs > 0 ? (totalDefects / totalPcs) * 100 : 0;

                // For table view, we can show a single line for overall rate
                reportData = [{
                    category: 'Overall Production',
                    value: totalDefects, // Actual defects
                    target: Math.round(totalPcs * 0.01), // Target is 1% defect rate
                    percentage: overallRate.toFixed(2),
                    status: overallRate <= 1 ? 'Excellent' : overallRate <= 3 ? 'Good' : 'Poor',
                }];
                break;

            default:
                return res.status(404).json({ error: 'Report type not found' });
        }
        res.json(reportData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate report: ' + err.message });
    }
});

module.exports = router;