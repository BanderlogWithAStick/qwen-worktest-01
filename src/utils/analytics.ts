import { Sale, KPIData, ManagerRating, TimeSeriesPoint, CategoryStat, ProductStat, RecentSale, DateRange } from '../types';
import { managers, customers, products, categories, getProduct, getCustomer, getManager, getCategory } from '../data/mockData';

/**
 * Business Rules:
 * - Revenue: sum of (quantity * unitPrice) for PAID sales only
 * - Cost: sum of (quantity * unitCost) for PAID sales only
 * - Gross Profit: Revenue - Cost
 * - Margin: Gross Profit / Revenue * 100
 * - Average Check: Revenue / count of paid sales
 * - Cancelled sales: excluded from all calculations
 * - Refunded sales: excluded from all calculations (treated same as cancelled for analytics)
 *   Rationale: refunded means money returned to customer, so no net revenue
 */

function filterSalesByDate(sales: Sale[], from: Date, to: Date): Sale[] {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];
  return sales.filter(s => s.date >= fromStr && s.date <= toStr);
}

function getPaidSales(sales: Sale[]): Sale[] {
  return sales.filter(s => s.status === 'Paid');
}

function calcRevenue(sales: Sale[]): number {
  return sales.reduce((sum, sale) => {
    return sum + sale.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  }, 0);
}

function calcCost(sales: Sale[]): number {
  return sales.reduce((sum, sale) => {
    return sum + sale.items.reduce((s, item) => s + item.quantity * item.unitCost, 0);
  }, 0);
}

function getPrevPeriod(from: Date, to: Date): DateRange {
  const diff = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diff);
  return { from: prevFrom, to: prevTo };
}

export function computeKPI(allSales: Sale[], from: Date, to: Date): KPIData {
  const periodSales = filterSalesByDate(allSales, from, to);
  const paidSales = getPaidSales(periodSales);
  const prev = getPrevPeriod(from, to);
  const prevPeriodSales = filterSalesByDate(allSales, prev.from, prev.to);
  const prevPaidSales = getPaidSales(prevPeriodSales);

  const revenue = calcRevenue(paidSales);
  const cost = calcCost(paidSales);
  const grossProfit = revenue - cost;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const salesCount = paidSales.length;
  const averageCheck = salesCount > 0 ? revenue / salesCount : 0;

  // Find best manager by gross profit
  const managerGP: Record<number, number> = {};
  paidSales.forEach(sale => {
    const gp = sale.items.reduce((sum, item) => sum + item.quantity * (item.unitPrice - item.unitCost), 0);
    managerGP[sale.managerId] = (managerGP[sale.managerId] || 0) + gp;
  });
  const bestManagerId = Object.entries(managerGP).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestManager = bestManagerId ? getManager(Number(bestManagerId))?.name || 'N/A' : 'N/A';

  const prevRevenue = calcRevenue(prevPaidSales);
  const prevCost = calcCost(prevPaidSales);
  const prevGrossProfit = prevRevenue - prevCost;
  const prevMargin = prevRevenue > 0 ? (prevGrossProfit / prevRevenue) * 100 : 0;
  const prevSalesCount = prevPaidSales.length;
  const prevAverageCheck = prevSalesCount > 0 ? prevRevenue / prevSalesCount : 0;

  return {
    revenue, grossProfit, margin, salesCount, averageCheck, bestManager,
    prevRevenue, prevGrossProfit, prevMargin, prevSalesCount, prevAverageCheck,
  };
}

export function computeManagerRating(allSales: Sale[], from: Date, to: Date): ManagerRating[] {
  const periodSales = filterSalesByDate(allSales, from, to);
  const paidSales = getPaidSales(periodSales);
  const prev = getPrevPeriod(from, to);
  const prevPeriodSales = filterSalesByDate(allSales, prev.from, prev.to);
  const prevPaidSales = getPaidSales(prevPeriodSales);

  const managerData: Record<number, { sales: Sale[]; prevSales: Sale[] }> = {};
  managers.forEach(m => { managerData[m.id] = { sales: [], prevSales: [] }; });
  
  paidSales.forEach(s => { if (managerData[s.managerId]) managerData[s.managerId].sales.push(s); });
  prevPaidSales.forEach(s => { if (managerData[s.managerId]) managerData[s.managerId].prevSales.push(s); });

  return managers.map(manager => {
    const { sales: mSales, prevSales: mPrevSales } = managerData[manager.id];
    const revenue = calcRevenue(mSales);
    const cost = calcCost(mSales);
    const grossProfit = revenue - cost;
    const salesCount = mSales.length;
    const averageCheck = salesCount > 0 ? revenue / salesCount : 0;
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const prevRevenue = calcRevenue(mPrevSales);
    const prevCost = calcCost(mPrevSales);
    const prevGrossProfit = prevRevenue - prevCost;
    const prevAverageCheck = mPrevSales.length > 0 ? prevRevenue / mPrevSales.length : 0;

    const gpChange = prevGrossProfit > 0 ? ((grossProfit - prevGrossProfit) / prevGrossProfit) * 100 : (grossProfit > 0 ? 100 : 0);
    const acChange = prevAverageCheck > 0 ? ((averageCheck - prevAverageCheck) / prevAverageCheck) * 100 : (averageCheck > 0 ? 100 : 0);

    return { manager, salesCount, revenue, grossProfit, averageCheck, margin, prevGrossProfit, prevAverageCheck, gpChange, acChange };
  });
}

export function computeTimeSeries(allSales: Sale[], from: Date, to: Date): TimeSeriesPoint[] {
  const periodSales = filterSalesByDate(allSales, from, to);
  const paidSales = getPaidSales(periodSales);
  
  const byDate: Record<string, { revenue: number; gp: number; count: number }> = {};
  
  // Initialize all dates
  const current = new Date(from);
  while (current <= to) {
    const key = current.toISOString().split('T')[0];
    byDate[key] = { revenue: 0, gp: 0, count: 0 };
    current.setDate(current.getDate() + 1);
  }

  paidSales.forEach(sale => {
    const rev = sale.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
    const gp = sale.items.reduce((s, item) => s + item.quantity * (item.unitPrice - item.unitCost), 0);
    if (byDate[sale.date]) {
      byDate[sale.date].revenue += rev;
      byDate[sale.date].gp += gp;
      byDate[sale.date].count += 1;
    }
  });

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      grossProfit: data.gp,
      salesCount: data.count,
    }));
}

export function computeCategoryStats(allSales: Sale[], from: Date, to: Date): CategoryStat[] {
  const periodSales = filterSalesByDate(allSales, from, to);
  const paidSales = getPaidSales(periodSales);

  const catData: Record<number, { revenue: number; gp: number; count: number }> = {};
  categories.forEach(c => { catData[c.id] = { revenue: 0, gp: 0, count: 0 }; });

  paidSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = getProduct(item.productId);
      if (product && catData[product.categoryId]) {
        const rev = item.quantity * item.unitPrice;
        const gp = item.quantity * (item.unitPrice - item.unitCost);
        catData[product.categoryId].revenue += rev;
        catData[product.categoryId].gp += gp;
        catData[product.categoryId].count += 1;
      }
    });
  });

  return categories.map(cat => ({
    category: cat,
    revenue: catData[cat.id].revenue,
    grossProfit: catData[cat.id].gp,
    salesCount: catData[cat.id].count,
  })).sort((a, b) => b.revenue - a.revenue);
}

export function computeProductStats(allSales: Sale[], from: Date, to: Date): ProductStat[] {
  const periodSales = filterSalesByDate(allSales, from, to);
  const paidSales = getPaidSales(periodSales);

  const prodData: Record<number, { revenue: number; gp: number; qty: number }> = {};
  products.forEach(p => { prodData[p.id] = { revenue: 0, gp: 0, qty: 0 }; });

  paidSales.forEach(sale => {
    sale.items.forEach(item => {
      if (prodData[item.productId]) {
        prodData[item.productId].revenue += item.quantity * item.unitPrice;
        prodData[item.productId].gp += item.quantity * (item.unitPrice - item.unitCost);
        prodData[item.productId].qty += item.quantity;
      }
    });
  });

  return products.map(p => ({
    product: p,
    revenue: prodData[p.id].revenue,
    grossProfit: prodData[p.id].gp,
    quantitySold: prodData[p.id].qty,
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

export function computeRecentSales(allSales: Sale[], from: Date, to: Date): RecentSale[] {
  const periodSales = filterSalesByDate(allSales, from, to);
  
  return periodSales
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, 15)
    .map(sale => {
      const manager = getManager(sale.managerId)!;
      const customer = getCustomer(sale.customerId)!;
      const productNames = sale.items.map(item => getProduct(item.productId)?.name || 'Unknown');
      const amount = sale.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
      const grossProfit = sale.status === 'Paid' 
        ? sale.items.reduce((s, item) => s + item.quantity * (item.unitPrice - item.unitCost), 0)
        : 0;

      return {
        id: sale.id,
        date: sale.date,
        manager,
        customer,
        products: productNames,
        status: sale.status,
        amount,
        grossProfit,
      };
    });
}
