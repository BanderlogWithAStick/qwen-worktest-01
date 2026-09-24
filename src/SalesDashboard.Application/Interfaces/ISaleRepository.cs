using SalesDashboard.Domain.Entities;

namespace SalesDashboard.Application.Interfaces;

public interface ISaleRepository
{
    Task<List<Sale>> GetSalesByDateRangeAsync(DateTime from, DateTime to, CancellationToken ct = default);
    Task<List<Manager>> GetAllManagersAsync(CancellationToken ct = default);
}
