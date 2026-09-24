namespace SalesDashboard.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public decimal BaseCost { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}
