namespace SalesDashboard.Domain.Entities;

public class Manager
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Team { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
