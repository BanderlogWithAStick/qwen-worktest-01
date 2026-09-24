namespace SalesDashboard.Application.DTOs;

public record CategoryStatDto(
    Guid CategoryId,
    string Name,
    decimal Revenue,
    decimal GrossProfit,
    int SalesCount
);
