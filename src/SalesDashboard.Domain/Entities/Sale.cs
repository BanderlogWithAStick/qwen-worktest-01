namespace SalesDashboard.Domain.Entities;

public class Sale
{
    public Guid Id { get; set; }
    public Guid ManagerId { get; set; }
    public Manager Manager { get; set; } = null!;
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public DateTime SaleDate { get; set; }
    public SaleStatus Status { get; set; }
    
    // Navigation
    public List<SaleItem> Items { get; set; } = new();
}
