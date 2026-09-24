using SalesDashboard.Application.DTOs;

namespace SalesDashboard.Application.Interfaces;

public interface IDashboardService
{
    Task<KpiDto> GetKpiAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<List<ManagerRatingDto>> GetManagerRatingAsync(DateTime from, DateTime to, string sortBy = "GrossProfit", string order = "desc", CancellationToken ct = default);
    Task<List<DynamicsPointDto>> GetDynamicsAsync(DateTime from, DateTime to, string granularity = "day", CancellationToken ct = default);
    Task<List<CategoryStatDto>> GetCategoryStatsAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<List<TopProductDto>> GetTopProductsAsync(DateTime from, DateTime to, int limit = 10, CancellationToken ct = default);
    Task<List<RecentSaleDto>> GetRecentSalesAsync(DateTime from, DateTime to, int limit = 20, CancellationToken ct = default);
}
