using SalesDashboard.Application.DTOs;
using SalesDashboard.Application.Interfaces;
using SalesDashboard.Domain.Entities;

namespace SalesDashboard.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ISaleRepository _repository;

    public DashboardService(ISaleRepository repository)
    {
        _repository = repository;
    }

    public async Task<KpiDto> GetKpiAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var sales = await _repository.GetSalesByDateRangeAsync(from, to, ct);
        var paidSales = sales.Where(s => s.Status == SaleStatus.Paid).ToList();

        var revenue = paidSales.Sum(s => s.Items.Sum(i => i.UnitPrice * i.Quantity));
        var grossProfit = paidSales.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity));
        var margin = revenue > 0 ? grossProfit / revenue * 100 : 0;
        var salesCount = paidSales.Count;
        var averageCheck = salesCount > 0 ? revenue / salesCount : 0;

        // Find best manager by gross profit
        var managerGp = paidSales
            .GroupBy(s => s.ManagerId)
            .Select(g => new
            {
                ManagerId = g.Key,
                ManagerName = g.First().Manager.FullName,
                GrossProfit = g.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity))
            })
            .OrderByDescending(x => x.GrossProfit)
            .FirstOrDefault();

        var bestManager = managerGp != null
            ? new TopManagerDto(managerGp.ManagerId, managerGp.ManagerName, managerGp.GrossProfit)
            : null;

        // Calculate previous period
        var duration = to - from;
        var prevTo = from.AddDays(-1);
        var prevFrom = prevTo.AddDays(-duration.Days);
        var prevSales = await _repository.GetSalesByDateRangeAsync(prevFrom, prevTo, ct);
        var prevPaidSales = prevSales.Where(s => s.Status == SaleStatus.Paid).ToList();

        var prevRevenue = prevPaidSales.Sum(s => s.Items.Sum(i => i.UnitPrice * i.Quantity));
        var prevGrossProfit = prevPaidSales.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity));
        var prevMargin = prevRevenue > 0 ? prevGrossProfit / prevRevenue * 100 : 0;
        var prevSalesCount = prevPaidSales.Count;
        var prevAverageCheck = prevSalesCount > 0 ? prevRevenue / prevSalesCount : 0;

        var delta = new KpiDeltaDto(
            RevenuePct: prevRevenue > 0 ? (revenue - prevRevenue) / prevRevenue * 100 : 0,
            GrossProfitPct: prevGrossProfit > 0 ? (grossProfit - prevGrossProfit) / prevGrossProfit * 100 : 0,
            MarginPct: margin - prevMargin,
            SalesCountPct: prevSalesCount > 0 ? (salesCount - prevSalesCount) / (decimal)prevSalesCount * 100 : 0,
            AverageCheckPct: prevAverageCheck > 0 ? (averageCheck - prevAverageCheck) / prevAverageCheck * 100 : 0
        );

        return new KpiDto(revenue, grossProfit, margin, salesCount, averageCheck, bestManager, delta);
    }

    public async Task<List<ManagerRatingDto>> GetManagerRatingAsync(DateTime from, DateTime to, string sortBy = "GrossProfit", string order = "desc", CancellationToken ct = default)
    {
        var sales = await _repository.GetSalesByDateRangeAsync(from, to, ct);
        var paidSales = sales.Where(s => s.Status == SaleStatus.Paid).ToList();

        var managerStats = paidSales
            .GroupBy(s => s.ManagerId)
            .Select(g =>
            {
                var manager = g.First().Manager;
                var revenue = g.Sum(s => s.Items.Sum(i => i.UnitPrice * i.Quantity));
                var grossProfit = g.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity));
                var salesCount = g.Count();
                var averageCheck = salesCount > 0 ? revenue / salesCount : 0;
                var margin = revenue > 0 ? grossProfit / revenue * 100 : 0;

                return new
                {
                    manager.Id,
                    manager.FullName,
                    manager.Team,
                    manager.AvatarUrl,
                    SalesCount = salesCount,
                    Revenue = revenue,
                    GrossProfit = grossProfit,
                    AverageCheck = averageCheck,
                    Margin = margin
                };
            })
            .ToList();

        // Sort
        var sorted = sortBy.ToLower() == "averagecheck"
            ? (order.ToLower() == "desc" ? managerStats.OrderByDescending(x => x.AverageCheck) : managerStats.OrderBy(x => x.AverageCheck))
            : (order.ToLower() == "desc" ? managerStats.OrderByDescending(x => x.GrossProfit) : managerStats.OrderBy(x => x.GrossProfit));

        // Calculate delta for each manager
        var duration = to - from;
        var prevTo = from.AddDays(-1);
        var prevFrom = prevTo.AddDays(-duration.Days);
        var prevSales = await _repository.GetSalesByDateRangeAsync(prevFrom, prevTo, ct);
        var prevPaidSales = prevSales.Where(s => s.Status == SaleStatus.Paid).ToList();

        var prevManagerGp = prevPaidSales
            .GroupBy(s => s.ManagerId)
            .ToDictionary(g => g.Key, g => g.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity)));

        return sorted.Select((m, index) =>
        {
            var prevGp = prevManagerGp.GetValueOrDefault(m.Id, 0);
            var deltaPct = prevGp > 0 ? (m.GrossProfit - prevGp) / prevGp * 100 : 0;

            return new ManagerRatingDto(
                Rank: index + 1,
                ManagerId: m.Id,
                ManagerName: m.FullName,
                Team: m.Team,
                AvatarUrl: m.AvatarUrl,
                SalesCount: m.SalesCount,
                Revenue: m.Revenue,
                GrossProfit: m.GrossProfit,
                AverageCheck: m.AverageCheck,
                Margin: m.Margin,
                DeltaPct: deltaPct
            );
        }).ToList();
    }

    public async Task<List<DynamicsPointDto>> GetDynamicsAsync(DateTime from, DateTime to, string granularity = "day", CancellationToken ct = default)
    {
        var sales = await _repository.GetSalesByDateRangeAsync(from, to, ct);
        var paidSales = sales.Where(s => s.Status == SaleStatus.Paid).ToList();

        IEnumerable<DynamicsPointDto> result;

        if (granularity.ToLower() == "week")
        {
            result = paidSales
                .GroupBy(s => GetWeekStart(s.SaleDate))
                .Select(g => new DynamicsPointDto(
                    Date: g.Key,
                    Revenue: g.Sum(s => s.Items.Sum(i => i.UnitPrice * i.Quantity)),
                    GrossProfit: g.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity)),
                    SalesCount: g.Count()
                ))
                .OrderBy(x => x.Date);
        }
        else if (granularity.ToLower() == "month")
        {
            result = paidSales
                .GroupBy(s => new DateTime(s.SaleDate.Year, s.SaleDate.Month, 1))
                .Select(g => new DynamicsPointDto(
                    Date: g.Key,
                    Revenue: g.Sum(s => s.Items.Sum(i => i.UnitPrice * i.Quantity)),
                    GrossProfit: g.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity)),
                    SalesCount: g.Count()
                ))
                .OrderBy(x => x.Date);
        }
        else // day
        {
            result = paidSales
                .GroupBy(s => s.SaleDate.Date)
                .Select(g => new DynamicsPointDto(
                    Date: g.Key,
                    Revenue: g.Sum(s => s.Items.Sum(i => i.UnitPrice * i.Quantity)),
                    GrossProfit: g.Sum(s => s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity)),
                    SalesCount: g.Count()
                ))
                .OrderBy(x => x.Date);
        }

        return result.ToList();
    }

    public async Task<List<CategoryStatDto>> GetCategoryStatsAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        var sales = await _repository.GetSalesByDateRangeAsync(from, to, ct);
        var paidSales = sales.Where(s => s.Status == SaleStatus.Paid).ToList();

        var categoryStats = paidSales
            .SelectMany(s => s.Items.Select(i => new { Item = i, Category = i.Product.Category }))
            .GroupBy(x => x.Category.Id)
            .Select(g =>
            {
                var category = g.First().Category;
                var revenue = g.Sum(x => x.Item.UnitPrice * x.Item.Quantity);
                var grossProfit = g.Sum(x => (x.Item.UnitPrice - x.Item.UnitCost) * x.Item.Quantity);
                var salesCount = g.Count();

                return new CategoryStatDto(
                    CategoryId: category.Id,
                    Name: category.Name,
                    Revenue: revenue,
                    GrossProfit: grossProfit,
                    SalesCount: salesCount
                );
            })
            .OrderByDescending(x => x.Revenue)
            .ToList();

        return categoryStats;
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int limit = 10, CancellationToken ct = default)
    {
        var sales = await _repository.GetSalesByDateRangeAsync(from, to, ct);
        var paidSales = sales.Where(s => s.Status == SaleStatus.Paid).ToList();

        var productStats = paidSales
            .SelectMany(s => s.Items)
            .GroupBy(i => i.ProductId)
            .Select(g =>
            {
                var product = g.First().Product;
                var revenue = g.Sum(i => i.UnitPrice * i.Quantity);
                var grossProfit = g.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity);
                var unitsSold = g.Sum(i => i.Quantity);

                return new TopProductDto(
                    ProductId: product.Id,
                    Name: product.Name,
                    CategoryName: product.Category.Name,
                    UnitsSold: unitsSold,
                    Revenue: revenue,
                    GrossProfit: grossProfit
                );
            })
            .OrderByDescending(x => x.Revenue)
            .Take(limit)
            .ToList();

        return productStats;
    }

    public async Task<List<RecentSaleDto>> GetRecentSalesAsync(DateTime from, DateTime to, int limit = 20, CancellationToken ct = default)
    {
        var sales = await _repository.GetSalesByDateRangeAsync(from, to, ct);

        var recentSales = sales
            .OrderByDescending(s => s.SaleDate)
            .ThenByDescending(s => s.Id)
            .Take(limit)
            .Select(s =>
            {
                var amount = s.Items.Sum(i => i.UnitPrice * i.Quantity);
                var grossProfit = s.Status == SaleStatus.Paid
                    ? s.Items.Sum(i => (i.UnitPrice - i.UnitCost) * i.Quantity)
                    : 0;
                var productsSummary = string.Join(", ", s.Items.Select(i => i.Product.Name).Take(3));
                if (s.Items.Count > 3) productsSummary += $" +{s.Items.Count - 3}";

                return new RecentSaleDto(
                    Id: s.Id,
                    Date: s.SaleDate,
                    ManagerName: s.Manager.FullName,
                    CustomerName: s.Customer.Company,
                    ProductsSummary: productsSummary,
                    Status: s.Status,
                    Amount: amount,
                    GrossProfit: grossProfit
                );
            })
            .ToList();

        return recentSales;
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var daysToSubtract = (int)date.DayOfWeek;
        return date.AddDays(-daysToSubtract).Date;
    }
}
