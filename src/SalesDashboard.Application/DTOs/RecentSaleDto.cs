using SalesDashboard.Domain.Entities;

namespace SalesDashboard.Application.DTOs;

public record RecentSaleDto(
    Guid Id,
    DateTime Date,
    string ManagerName,
    string CustomerName,
    string ProductsSummary,
    SaleStatus Status,
    decimal Amount,
    decimal GrossProfit
);
