namespace SalesDashboard.Application.DTOs;

public record ManagerRatingDto(
    int Rank,
    Guid ManagerId,
    string ManagerName,
    string Team,
    string? AvatarUrl,
    int SalesCount,
    decimal Revenue,
    decimal GrossProfit,
    decimal AverageCheck,
    decimal Margin,
    decimal DeltaPct
);
