namespace SalesDashboard.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    // Navigation
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
