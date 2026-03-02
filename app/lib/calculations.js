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

    // --- Advanced Startup Metrics ---
    // ARR (Annual Recurring Revenue) vs Yearly Revenue (Assuming SaaS or Subscription-based projection)
    const arr = yearlyRevenue; // Simplified for now

    // Burn Rate & Runway
    let monthlyBurnRate = 0;
    let runwayMonths = 0;
    if (monthlyNetProfit < 0) {
        monthlyBurnRate = Math.abs(monthlyNetProfit);
        runwayMonths = totalInvestment > 0 ? totalInvestment / monthlyBurnRate : project.defaultRunwayMonths || 12;
    } else {
        // If profitable, technically infinite runway from operations
        runwayMonths = -1; // -1 indicates profitable/infinite
    }

    // LTV & CAC
    const pitchDeck = project.pitchDeck || {};
    const cac = pitchDeck.cac || 0;
    const ltv = pitchDeck.ltv || 0;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const churnRate = pitchDeck.churnRate || 0.05;

    // Valuation Estimation (Simple Multiples)
    const revenueMultiple = pitchDeck.revenueMultiple || 5.0;
    const ebitdaMultiple = pitchDeck.ebitdaMultiple || 8.0;

    // Using Yearly Net Profit as a proxy for EBITDA (simplified)
    const valuationRevenue = arr * revenueMultiple;
    const valuationEbitda = yearlyNetProfit > 0 ? yearlyNetProfit * ebitdaMultiple : 0;

    // Average Valuation
    const estimatedValuation = (valuationRevenue + (valuationEbitda > 0 ? valuationEbitda : valuationRevenue)) / 2;


    // Generate monthly projection for 24 months (2 years)
    const monthlyProjection = [];
    let cumulativeProfit = 0;
    let breakEvenMonth = 0;

    // Interactive Scenario Bounds (default 1.0 if missing)
    const pessimisticFactor = project.scenarioPessimistic || 0.75;
    const optimisticFactor = project.scenarioOptimistic || 1.25;

    for (let i = 1; i <= 24; i++) {
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
            // Scenarios
            pessimisticRevenue: mRevenue * pessimisticFactor,
            optimisticRevenue: mRevenue * optimisticFactor,
        });
    }

    // --- DCF & NPV (Discounted Cash Flow) ---
    const annualDiscountRate = investment.discountRate || 10;
    const monthlyDiscountRate = Math.pow(1 + (annualDiscountRate / 100), 1 / 12) - 1;

    let npv = 0;
    monthlyProjection.forEach((m, idx) => {
        const discountFactor = Math.pow(1 + monthlyDiscountRate, m.month);
        npv += m.netProfit / discountFactor;
    });

    // Terminal Value (Assuming 3-5% perpetual growth after 24 months)
    const terminalGrowthRate = 0.03;
    const lastMonthNetProfit = monthlyProjection[23].netProfit;
    const terminalValue = (lastMonthNetProfit * (1 + terminalGrowthRate)) / (monthlyDiscountRate - (terminalGrowthRate / 12));
    const discountedTerminalValue = terminalValue / Math.pow(1 + monthlyDiscountRate, 24);
    const enterpriseValueDCF = npv + discountedTerminalValue;

    // --- Cap Table Simulation ---
    const investorShare = investment.investorShare || 15; // e.g. 15%
    const investmentAmount = investment.totalCapital || 0;
    const postMoneyValuation = investmentAmount / (investorShare / 100);
    const preMoneyValuation = postMoneyValuation - investmentAmount;

    const capTable = [
        { name: 'Founders', stake: 100 - investorShare - 10, type: 'Common' },
        { name: 'Investors (Seed)', stake: investorShare, type: 'Preferred' },
        { name: 'ESOP (Option Pool)', stake: 10, type: 'Common' },
    ];

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
        startupMetrics: {
            arr,
            monthlyBurnRate,
            runwayMonths,
            cac,
            ltv,
            ltvCacRatio,
            churnRate,
        },
        valuation: {
            revenueMultiple,
            ebitdaMultiple,
            valuationRevenue,
            valuationEbitda,
            estimatedValuation,
            dcf: {
                enterpriseValue: enterpriseValueDCF,
                npv,
                terminalValue: discountedTerminalValue,
                discountRate: annualDiscountRate
            },
            capTable: {
                preMoney: preMoneyValuation,
                postMoney: postMoneyValuation,
                shares: capTable
            }
        },
        scenarios: {
            pessimisticFactor,
            optimisticFactor,
            // 1 Year Averages for the scenario cards
            pessimistic: {
                revenue: monthlyRevenue * pessimisticFactor,
                netProfit: (monthlyRevenue * pessimisticFactor) - (monthlyCOGS * pessimisticFactor) - monthlyOpCosts
            },
            realistic: {
                revenue: monthlyRevenue,
                netProfit: monthlyNetProfit
            },
            optimistic: {
                revenue: monthlyRevenue * optimisticFactor,
                netProfit: (monthlyRevenue * optimisticFactor) - (monthlyCOGS * optimisticFactor) - monthlyOpCosts
            }
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
