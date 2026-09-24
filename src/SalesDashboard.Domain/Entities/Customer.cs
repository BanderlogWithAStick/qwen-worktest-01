namespace SalesDashboard.Domain.Entities;

public class Customer
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Segment { get; set; } = string.Empty; // "SMB", "Mid-Market", "Enterprise"
    
    // Navigation
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
}
