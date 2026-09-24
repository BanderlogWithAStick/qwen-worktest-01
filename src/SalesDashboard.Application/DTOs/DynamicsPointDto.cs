namespace SalesDashboard.Application.DTOs;

public record DynamicsPointDto(
    DateTime Date,
    decimal Revenue,
    decimal GrossProfit,
    int SalesCount
);
