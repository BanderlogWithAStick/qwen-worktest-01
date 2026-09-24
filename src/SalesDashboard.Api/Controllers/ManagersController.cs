using Microsoft.AspNetCore.Mvc;
using SalesDashboard.Application.Interfaces;

namespace SalesDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManagersController : ControllerBase
{
    private readonly ISaleRepository _repository;

    public ManagersController(ISaleRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Get all managers
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var managers = await _repository.GetAllManagersAsync(ct);
        var result = managers.Select(m => new
        {
            m.Id,
            m.FullName,
            m.Team,
            m.Position,
            m.IsActive,
            m.AvatarUrl
        });
        return Ok(result);
    }
}
