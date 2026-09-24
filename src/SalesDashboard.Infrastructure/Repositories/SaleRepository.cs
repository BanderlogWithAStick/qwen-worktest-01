using Microsoft.EntityFrameworkCore;
using SalesDashboard.Application.Interfaces;
using SalesDashboard.Domain.Entities;
using SalesDashboard.Infrastructure.Data;

namespace SalesDashboard.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Sale>> GetSalesByDateRangeAsync(DateTime from, DateTime to, CancellationToken ct = default)
    {
        return await _context.Sales
            .Include(s => s.Manager)
            .Include(s => s.Customer)
            .Include(s => s.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Category)
            .Where(s => s.SaleDate >= from && s.SaleDate <= to)
            .ToListAsync(ct);
    }

    public async Task<List<Manager>> GetAllManagersAsync(CancellationToken ct = default)
    {
        return await _context.Managers
            .OrderBy(m => m.FullName)
            .ToListAsync(ct);
    }
}
