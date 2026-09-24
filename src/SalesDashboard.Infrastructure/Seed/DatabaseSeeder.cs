using Microsoft.EntityFrameworkCore;
using SalesDashboard.Domain.Entities;
using SalesDashboard.Infrastructure.Data;

namespace SalesDashboard.Infrastructure.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Managers.AnyAsync())
            return;

        var random = new Random(42); // Deterministic seed

        // Seed Managers (20)
        var managerNames = new[]
        {
            ("Алексей Петров", "Team Alpha", "Senior Sales Manager"),
            ("Мария Иванова", "Team Alpha", "Account Executive"),
            ("Дмитрий Сидоров", "Team Beta", "Senior Sales Manager"),
            ("Елена Козлова", "Team Beta", "Account Executive"),
            ("Сергей Новиков", "Team Gamma", "Sales Manager"),
            ("Анна Морозова", "Team Gamma", "Account Executive"),
            ("Игорь Волков", "Enterprise", "Enterprise Sales"),
            ("Ольга Соловьёва", "Enterprise", "Key Account Manager"),
            ("Павел Лебедев", "SMB", "SMB Sales"),
            ("Наталья Кузнецова", "SMB", "SMB Sales"),
            ("Андрей Попов", "Team Alpha", "Sales Manager"),
            ("Татьяна Васильева", "Team Beta", "Sales Manager"),
            ("Михаил Зайцев", "Team Gamma", "Account Executive"),
            ("Екатерина Павлова", "Enterprise", "Enterprise Sales"),
            ("Николай Семёнов", "SMB", "SMB Sales"),
            ("Юлия Голубева", "Team Alpha", "Junior Sales"),
            ("Виктор Виноградов", "Team Beta", "Junior Sales"),
            ("Светлана Богданова", "Team Gamma", "Junior Sales"),
            ("Роман Воробьёв", "Enterprise", "Junior Sales"),
            ("Ирина Фёдорова", "SMB", "Junior Sales")
        };

        var managers = managerNames.Select((m, i) => new Manager
        {
            Id = Guid.NewGuid(),
            FullName = m.Item1,
            Team = m.Item2,
            Position = m.Item3,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await context.Managers.AddRangeAsync(managers);

        // Seed Customers (80)
        var companies = new[]
        {
            "ТехноСервис", "АльфаГрупп", "МегаСтрой", "ИнноВат", "ПрофИТ",
            "ДатаЛайн", "СмартСистемы", "ГлобалТех", "НеоФорм", "КиберЩит",
            "РосИнтеграция", "ВебСолюшнз", "ПраймТек", "АйТиМастер", "ДиджиТранс",
            "ЛогистикПро", "МедиаПлюс", "ЭнергоСбыт", "АгроХолдинг", "ФинКонсалт",
            "СтройИнвест", "ТоргСервис", "АвтоПарт", "ФудЛайн", "ЭкоПром",
            "ТелекомМ", "КлинингМастер", "ОфисПлюс", "МаркетПро", "БизнесЛайн",
            "ТрансЛогистик", "МедТех", "СпецОдежда", "ХимПром", "МеталлТрейд",
            "ЛесПром", "НефтеГаз", "АтомЭнерго", "КосмоТех", "БиоФарм"
        };

        var segments = new[] { "SMB", "Mid-Market", "Enterprise" };
        var customers = Enumerable.Range(0, 80).Select(i => new Customer
        {
            Id = Guid.NewGuid(),
            Name = $"Contact {i + 1}",
            Company = companies[i % companies.Length] + (i >= companies.Length ? $" {i / companies.Length + 1}" : ""),
            Segment = segments[i % segments.Length]
        }).ToList();

        await context.Customers.AddRangeAsync(customers);

        // Seed Categories (6)
        var categories = new[]
        {
            "Дроны", "Аксессуары", "Камеры", "Стабилизаторы", "Батареи и зарядки", "Программное обеспечение"
        }.Select(name => new Category
        {
            Id = Guid.NewGuid(),
            Name = name
        }).ToList();

        await context.Categories.AddRangeAsync(categories);

        // Seed Products (40)
        var productData = new[]
        {
            ("DJI Mavic 3 Pro", 0, 215000m, 150000m),
            ("DJI Air 3", 0, 125000m, 85000m),
            ("DJI Mini 4 Pro", 0, 89000m, 60000m),
            ("DJI Matrice 350 RTK", 0, 650000m, 450000m),
            ("DJI Avata 2", 0, 95000m, 65000m),
            ("DJI Inspire 3", 0, 1200000m, 850000m),
            ("DJI Fly More Kit", 1, 18000m, 10000m),
            ("DJI RC Pro", 1, 62000m, 40000m),
            ("DJI ND Filter Set", 1, 8500m, 4500m),
            ("DJI Propellers (pair)", 1, 1200m, 600m),
            ("DJI Care Refresh", 1, 15000m, 8000m),
            ("DJI RS 4 Pro", 3, 72000m, 48000m),
            ("DJI RS 4", 3, 45000m, 30000m),
            ("DJI Ronin-S", 3, 35000m, 23000m),
            ("DJI Osmo Pocket 3", 2, 55000m, 37000m),
            ("DJI Osmo Action 4", 2, 38000m, 25000m),
            ("DJI Action 4 Creator Combo", 2, 52000m, 35000m),
            ("DJI Battery (Mavic 3)", 4, 14000m, 8000m),
            ("DJI Charging Hub", 4, 7500m, 4000m),
            ("DJI Power Station", 4, 45000m, 28000m),
            ("DJI Terra License", 5, 120000m, 70000m),
            ("DJI Flight Simulator", 5, 35000m, 18000m),
            ("DJI Mavic 3 Classic", 0, 155000m, 108000m),
            ("DJI Mini 3", 0, 52000m, 35000m),
            ("DJI Transmission", 1, 85000m, 55000m),
            ("DJI FPV Combo", 0, 110000m, 75000m),
            ("DJI Smart Controller", 1, 48000m, 30000m),
            ("DJI Mic 2", 2, 22000m, 12000m),
            ("DJI Pocket 2", 2, 32000m, 20000m),
            ("DJI Action 3", 2, 28000m, 18000m),
            ("DJI Battery (Air 3)", 4, 11000m, 6000m),
            ("DJI Battery (Mini 4)", 4, 8000m, 4500m),
            ("DJI Charging Station", 4, 25000m, 15000m),
            ("DJI SDK License", 5, 80000m, 45000m),
            ("DJI Mapping Software", 5, 95000m, 55000m),
            ("DJI Lens Kit", 1, 35000m, 20000m),
            ("DJI Gimbal Protector", 1, 3500m, 1800m),
            ("DJI Landing Pad", 1, 5500m, 2800m),
            ("DJI Backpack", 1, 12000m, 6500m),
            ("DJI Tablet Mount", 1, 4500m, 2200m)
        };

        var products = productData.Select(p => new Product
        {
            Id = Guid.NewGuid(),
            Name = p.Item1,
            CategoryId = categories[p.Item2].Id,
            BaseCost = p.Item4,
            IsActive = true
        }).ToList();

        // Store prices for later use
        var productPrices = productData.Select(p => p.Item3).ToArray();

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        // Seed Sales (~3500 over 12 months)
        var startDate = new DateTime(2025, 1, 1);
        var endDate = new DateTime(2025, 12, 15);
        var sales = new List<Sale>();
        var saleItems = new List<SaleItem>();

        // Manager performance multipliers
        var managerMultipliers = managers.Select((_, i) =>
        {
            if (i < 3) return 1.5 + random.NextDouble() * 0.8; // Top performers
            if (i < 10) return 0.8 + random.NextDouble() * 0.6; // Average
            return 0.3 + random.NextDouble() * 0.5; // Weak performers
        }).ToArray();

        // Seasonality
        var seasonality = new[] { 0.7, 0.75, 0.85, 0.9, 0.95, 1.0, 0.85, 0.9, 1.0, 1.1, 1.3, 1.4 };

        var saleId = 0;
        for (var month = 0; month < 12; month++)
        {
            var daysInMonth = DateTime.DaysInMonth(2025, month + 1);
            var seasonalFactor = seasonality[month];

            for (var day = 1; day <= daysInMonth; day++)
            {
                var date = new DateTime(2025, month + 1, day);
                if (date > endDate) break;

                // Skip some weekends
                if (date.DayOfWeek == DayOfWeek.Sunday && random.NextDouble() > 0.3) continue;
                if (date.DayOfWeek == DayOfWeek.Saturday && random.NextDouble() > 0.5) continue;

                for (var mi = 0; mi < managers.Count; mi++)
                {
                    var multiplier = managerMultipliers[mi];
                    var baseChance = 0.4 * multiplier * seasonalFactor;

                    if (random.NextDouble() < baseChance)
                    {
                        var numSales = random.Next(1, (int)Math.Ceiling(multiplier * 2) + 1);

                        for (var s = 0; s < numSales; s++)
                        {
                            var customer = customers[random.Next(customers.Count)];
                            var numItems = random.Next(1, 5);
                            var items = new List<SaleItem>();

                            for (var j = 0; j < numItems; j++)
                            {
                                var productIndex = random.Next(products.Count);
                                var product = products[productIndex];
                                var quantity = random.Next(1, (int)Math.Ceiling(3 * multiplier) + 1);
                                var unitPrice = productPrices[productIndex];
                                var unitCost = product.BaseCost;

                                items.Add(new SaleItem
                                {
                                    Id = Guid.NewGuid(),
                                    ProductId = product.Id,
                                    Quantity = quantity,
                                    UnitPrice = unitPrice,
                                    UnitCost = unitCost
                                });
                            }

                            // Status distribution
                            var statusRoll = random.NextDouble();
                            var status = statusRoll > 0.92 ? SaleStatus.Cancelled :
                                        statusRoll > 0.85 ? SaleStatus.Refunded :
                                        SaleStatus.Paid;

                            var sale = new Sale
                            {
                                Id = Guid.NewGuid(),
                                ManagerId = managers[mi].Id,
                                CustomerId = customer.Id,
                                SaleDate = date,
                                Status = status,
                                Items = items
                            };

                            sales.Add(sale);
                        }
                    }
                }
            }
        }

        await context.Sales.AddRangeAsync(sales);
        await context.SaveChangesAsync();
    }
}
