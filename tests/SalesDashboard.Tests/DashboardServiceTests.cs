using Microsoft.EntityFrameworkCore;
using SalesDashboard.Application.Interfaces;
using SalesDashboard.Application.Services;
using SalesDashboard.Domain.Entities;
using SalesDashboard.Infrastructure.Data;
using SalesDashboard.Infrastructure.Repositories;
using FluentAssertions;

namespace SalesDashboard.Tests;

public class DashboardServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private async Task<(DashboardService service, AppDbContext context)> CreateServiceWithDataAsync()
    {
        var context = CreateContext();
        
        var manager = new Manager { Id = Guid.NewGuid(), FullName = "Test Manager", Team = "Test", Position = "Test" };
        var customer = new Customer { Id = Guid.NewGuid(), Name = "Test", Company = "Test Co", Segment = "SMB" };
        var category = new Category { Id = Guid.NewGuid(), Name = "Test Category" };
        var product = new Product { Id = Guid.NewGuid(), Name = "Test Product", CategoryId = category.Id, Category = category, BaseCost = 50 };

        context.Managers.Add(manager);
        context.Customers.Add(customer);
        context.Categories.Add(category);
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var repository = new SaleRepository(context);
        var service = new DashboardService(repository);
        return (service, context);
    }

    [Fact]
    public async Task Revenue_OnlyCountsPaidSales()
    {
        var (service, context) = await CreateServiceWithDataAsync();
        var manager = context.Managers.First();
        var customer = context.Customers.First();
        var product = context.Products.First();

        // Add paid sale
        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 15),
            Status = SaleStatus.Paid,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 2, UnitPrice = 100, UnitCost = 50 }
            }
        });

        // Add cancelled sale
        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 15),
            Status = SaleStatus.Cancelled,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 5, UnitPrice = 100, UnitCost = 50 }
            }
        });

        await context.SaveChangesAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30));

        result.Revenue.Should().Be(200); // Only paid sale: 2 * 100
    }

    [Fact]
    public async Task Cancelled_ExcludedFromAllMetrics()
    {
        var (service, context) = await CreateServiceWithDataAsync();
        var manager = context.Managers.First();
        var customer = context.Customers.First();
        var product = context.Products.First();

        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 15),
            Status = SaleStatus.Cancelled,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 3, UnitPrice = 100, UnitCost = 50 }
            }
        });
        await context.SaveChangesAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30));

        result.Revenue.Should().Be(0);
        result.GrossProfit.Should().Be(0);
        result.SalesCount.Should().Be(0);
    }

    [Fact]
    public async Task Refunded_ExcludedFromRevenue()
    {
        var (service, context) = await CreateServiceWithDataAsync();
        var manager = context.Managers.First();
        var customer = context.Customers.First();
        var product = context.Products.First();

        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 15),
            Status = SaleStatus.Refunded,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 2, UnitPrice = 100, UnitCost = 50 }
            }
        });
        await context.SaveChangesAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30));

        result.Revenue.Should().Be(0);
        result.GrossProfit.Should().Be(0);
    }

    [Fact]
    public async Task Margin_ReturnsZero_WhenNoRevenue()
    {
        var (service, _) = await CreateServiceWithDataAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30));

        result.Margin.Should().Be(0);
    }

    [Fact]
    public async Task AverageCheck_CorrectDivision()
    {
        var (service, context) = await CreateServiceWithDataAsync();
        var manager = context.Managers.First();
        var customer = context.Customers.First();
        var product = context.Products.First();

        // Add 2 paid sales
        for (int i = 0; i < 2; i++)
        {
            context.Sales.Add(new Sale
            {
                Id = Guid.NewGuid(),
                ManagerId = manager.Id,
                CustomerId = customer.Id,
                SaleDate = new DateTime(2025, 6, 15),
                Status = SaleStatus.Paid,
                Items = new List<SaleItem>
                {
                    new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 1, UnitPrice = 100, UnitCost = 50 }
                }
            });
        }
        await context.SaveChangesAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30));

        result.AverageCheck.Should().Be(100); // 200 / 2
    }

    [Fact]
    public async Task Rating_SortedByGrossProfit()
    {
        var (service, context) = await CreateServiceWithDataAsync();
        var manager1 = context.Managers.First();
        var customer = context.Customers.First();
        var product = context.Products.First();

        var manager2 = new Manager { Id = Guid.NewGuid(), FullName = "Manager 2", Team = "Test", Position = "Test" };
        context.Managers.Add(manager2);
        await context.SaveChangesAsync();

        // Manager 1: lower GP
        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager1.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 15),
            Status = SaleStatus.Paid,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 1, UnitPrice = 100, UnitCost = 80 }
            }
        });

        // Manager 2: higher GP
        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager2.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 15),
            Status = SaleStatus.Paid,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 1, UnitPrice = 200, UnitCost = 50 }
            }
        });
        await context.SaveChangesAsync();

        var result = await service.GetManagerRatingAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30), "GrossProfit");

        result[0].ManagerId.Should().Be(manager2.Id); // Higher GP first
    }

    [Fact]
    public async Task EmptyPeriod_ReturnsZeroKpi()
    {
        var (service, _) = await CreateServiceWithDataAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 1, 1), new DateTime(2025, 1, 31));

        result.Revenue.Should().Be(0);
        result.GrossProfit.Should().Be(0);
        result.SalesCount.Should().Be(0);
        result.AverageCheck.Should().Be(0);
        result.Margin.Should().Be(0);
    }

    [Fact]
    public async Task PeriodFilter_InclusiveBounds()
    {
        var (service, context) = await CreateServiceWithDataAsync();
        var manager = context.Managers.First();
        var customer = context.Customers.First();
        var product = context.Products.First();

        // Sale on exact boundary dates
        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 1), // from boundary
            Status = SaleStatus.Paid,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 1, UnitPrice = 100, UnitCost = 50 }
            }
        });

        context.Sales.Add(new Sale
        {
            Id = Guid.NewGuid(),
            ManagerId = manager.Id,
            CustomerId = customer.Id,
            SaleDate = new DateTime(2025, 6, 30), // to boundary
            Status = SaleStatus.Paid,
            Items = new List<SaleItem>
            {
                new() { Id = Guid.NewGuid(), ProductId = product.Id, Quantity = 1, UnitPrice = 100, UnitCost = 50 }
            }
        });

        await context.SaveChangesAsync();

        var result = await service.GetKpiAsync(new DateTime(2025, 6, 1), new DateTime(2025, 6, 30));

        result.SalesCount.Should().Be(2); // Both boundary sales included
    }
}
