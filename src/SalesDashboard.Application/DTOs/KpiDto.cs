namespace SalesDashboard.Application.DTOs;

public record KpiDto(
    decimal Revenue,
    decimal GrossProfit,
    decimal Margin,
    int SalesCount,
    decimal AverageCheck,
    TopManagerDto? BestManager,
    KpiDeltaDto Delta
);

public record KpiDeltaDto(
    decimal RevenuePct,
    decimal GrossProfitPct,
    decimal MarginPct,
    int SalesCountPct,
    decimal AverageCheckPct
);

public record TopManagerDto(Guid Id, string Name, decimal GrossProfit);
