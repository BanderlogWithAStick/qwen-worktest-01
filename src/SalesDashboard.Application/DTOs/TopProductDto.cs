namespace SalesDashboard.Application.DTOs;

public record TopProductDto(
    Guid ProductId,
    string Name,
    string CategoryName,
    int UnitsSold,
    decimal Revenue,
    decimal GrossProfit
);
