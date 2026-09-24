using Microsoft.AspNetCore.Mvc;
using SalesDashboard.Application.Interfaces;

namespace SalesDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// Get KPI metrics for the specified period
    /// </summary>
    [HttpGet("kpi")]
    public async Task<IActionResult> GetKpi(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken ct)
    {
        if (from > to)
            return BadRequest(new { error = "From date must be before or equal to To date" });

        if ((to - from).TotalDays > 730)
            return BadRequest(new { error = "Date range cannot exceed 2 years" });

        var result = await _dashboardService.GetKpiAsync(from, to, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get manager rating for the specified period
    /// </summary>
    [HttpGet("managers/rating")]
    public async Task<IActionResult> GetManagerRating(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string sortBy = "GrossProfit",
        [FromQuery] string order = "desc",
        CancellationToken ct = default)
    {
        if (from > to)
            return BadRequest(new { error = "From date must be before or equal to To date" });

        if (!new[] { "GrossProfit", "AverageCheck" }.Contains(sortBy, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { error = "sortBy must be 'GrossProfit' or 'AverageCheck'" });

        if (!new[] { "asc", "desc" }.Contains(order, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { error = "order must be 'asc' or 'desc'" });

        var result = await _dashboardService.GetManagerRatingAsync(from, to, sortBy, order, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get dynamics (time series) for the specified period
    /// </summary>
    [HttpGet("dynamics")]
    public async Task<IActionResult> GetDynamics(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string granularity = "day",
        CancellationToken ct = default)
    {
        if (from > to)
            return BadRequest(new { error = "From date must be before or equal to To date" });

        if (!new[] { "day", "week", "month" }.Contains(granularity, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { error = "granularity must be 'day', 'week', or 'month'" });

        var result = await _dashboardService.GetDynamicsAsync(from, to, granularity, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get category statistics for the specified period
    /// </summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        CancellationToken ct = default)
    {
        if (from > to)
            return BadRequest(new { error = "From date must be before or equal to To date" });

        var result = await _dashboardService.GetCategoryStatsAsync(from, to, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get top products for the specified period
    /// </summary>
    [HttpGet("products/top")]
    public async Task<IActionResult> GetTopProducts(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        if (from > to)
            return BadRequest(new { error = "From date must be before or equal to To date" });

        if (limit < 1 || limit > 100)
            return BadRequest(new { error = "limit must be between 1 and 100" });

        var result = await _dashboardService.GetTopProductsAsync(from, to, limit, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get recent sales for the specified period
    /// </summary>
    [HttpGet("sales/recent")]
    public async Task<IActionResult> GetRecentSales(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int limit = 20,
        CancellationToken ct = default)
    {
        if (from > to)
            return BadRequest(new { error = "From date must be before or equal to To date" });

        if (limit < 1 || limit > 100)
            return BadRequest(new { error = "limit must be between 1 and 100" });

        var result = await _dashboardService.GetRecentSalesAsync(from, to, limit, ct);
        return Ok(result);
    }
}
