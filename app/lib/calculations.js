/**
 * ProyeksiKu — Financial Calculation Engine
 * All projection and financial analysis formulas
 */

/**
 * Calculate margin percentage
 */
export function calculateMargin(costPrice, sellPrice) {
    if (!sellPrice || sellPrice === 0) return 0;
    return ((sellPrice - costPrice) / sellPrice) * 100;
}

/**
 * Calculate daily revenue from products and their sales targets
 */
export function calculateDailyRevenue(products) {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, p) => sum + (p.sellPrice * (p.dailyQty || 0)), 0);
}

/**
 * Calculate daily COGS (Cost of Goods Sold)
 */
export function calculateDailyCOGS(products) {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, p) => sum + (p.costPrice * (p.dailyQty || 0)), 0);
}

/**
 * Calculate total monthly operational costs
 */
export function calculateMonthlyOpCosts(costs) {
    if (!costs || costs.length === 0) return 0;
    return costs.reduce((sum, c) => sum + (c.amount || 0), 0);
}

/**
 * Generate full financial projection
 */
export function generateProjection(project) {
    const { products = [], costs = [], investment = {} } = project;

    const dailyRevenue = calculateDailyRevenue(products);
    const dailyCOGS = calculateDailyCOGS(products);
    const dailyGrossProfit = dailyRevenue - dailyCOGS;

    const monthlyRevenue = dailyRevenue * 30;
    const monthlyCOGS = dailyCOGS * 30;
    const monthlyGrossProfit = monthlyRevenue - monthlyCOGS;
    const monthlyOpCosts = calculateMonthlyOpCosts(costs);
    const monthlyNetProfit = monthlyGrossProfit - monthlyOpCosts;

    const yearlyRevenue = monthlyRevenue * 12;
    const yearlyCOGS = monthlyCOGS * 12;
    const yearlyGrossProfit = yearlyRevenue - yearlyCOGS;
    const yearlyOpCosts = monthlyOpCosts * 12;
    const yearlyNetProfit = yearlyGrossProfit - yearlyOpCosts;

    const totalInvestment = investment.totalCapital || 0;
    const grossMargin = monthlyRevenue > 0 ? (monthlyGrossProfit / monthlyRevenue) * 100 : 0;
    const netMargin = monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0;
    const roi = totalInvestment > 0 ? (yearlyNetProfit / totalInvestment) * 100 : 0;
    const paybackPeriod = monthlyNetProfit > 0 ? totalInvestment / monthlyNetProfit : 0;

    const dailyOpCosts = monthlyOpCosts / 30;
    const dailyNetCost = dailyCOGS + dailyOpCosts;
    const bepDays = dailyRevenue > dailyNetCost
        ? totalInvestment / (dailyRevenue - dailyNetCost)
        : 0;

    // Generate monthly projection for 12 months
    const monthlyProjection = [];
    let cumulativeProfit = 0;
    let breakEvenMonth = 0;

    for (let i = 1; i <= 12; i++) {
        // Apply growth factor (conservative 3-5% monthly growth)
        const growthFactor = 1 + ((investment.growthRate || 3) / 100 * (i - 1));
        const mRevenue = monthlyRevenue * growthFactor;
        const mCOGS = monthlyCOGS * growthFactor;
        const mGross = mRevenue - mCOGS;
        const mNet = mGross - monthlyOpCosts;
        cumulativeProfit += mNet;

        if (cumulativeProfit >= totalInvestment && breakEvenMonth === 0) {
            breakEvenMonth = i;
        }

        monthlyProjection.push({
            month: i,
            label: `Bln ${i}`,
            revenue: mRevenue,
            cogs: mCOGS,
            grossProfit: mGross,
            opCosts: monthlyOpCosts,
            netProfit: mNet,
            cumulativeProfit,
        });
    }

    return {
        daily: {
            revenue: dailyRevenue,
            cogs: dailyCOGS,
            grossProfit: dailyGrossProfit,
            opCosts: dailyOpCosts,
            netProfit: dailyGrossProfit - dailyOpCosts,
        },
        monthly: {
            revenue: monthlyRevenue,
            cogs: monthlyCOGS,
            grossProfit: monthlyGrossProfit,
            opCosts: monthlyOpCosts,
            netProfit: monthlyNetProfit,
        },
        yearly: {
            revenue: yearlyRevenue,
            cogs: yearlyCOGS,
            grossProfit: yearlyGrossProfit,
            opCosts: yearlyOpCosts,
            netProfit: yearlyNetProfit,
        },
        metrics: {
            grossMargin,
            netMargin,
            roi,
            paybackPeriod,
            bepDays,
            breakEvenMonth: breakEvenMonth || (paybackPeriod > 0 ? Math.ceil(paybackPeriod) : 0),
            totalInvestment,
        },
        monthlyProjection,
        products,
    };
}

/**
 * Calculate average margin across all products
 */
export function calculateAvgMargin(products) {
    if (!products || products.length === 0) return 0;
    const margins = products.map(p => calculateMargin(p.costPrice, p.sellPrice));
    return margins.reduce((sum, m) => sum + m, 0) / margins.length;
}
