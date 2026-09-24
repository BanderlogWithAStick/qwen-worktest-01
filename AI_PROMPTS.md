# AI Prompts Journal

## 09:00 — Claude Code / Opus

Create a Sales Performance Dashboard frontend in React + TypeScript + Tailwind CSS. The dashboard should have:
- 6 KPI cards (Revenue, Gross Profit, Margin, Sales Count, Average Check, Best Manager) with comparison to previous period
- Period selector (Today, 7 Days, 30 Days, This Month, Last Month, Custom range)
- Revenue dynamics chart (area chart with toggle between Revenue/Gross Profit/Sales Count)
- Category breakdown (pie chart + list)
- Top products (bar chart)
- Manager rating table (sortable by Gross Profit or Average Check)
- Recent sales table with status badges
- Manager scatter plot (Revenue vs Margin)
- Top performers comparison bar chart
- Order status distribution
- Skeleton loading states
- Framer Motion animations

Use Recharts for charts, Lucide for icons. Desktop viewport 1440x900.

## 09:30 — Claude Code / Opus

Generate deterministic seed data for the sales dashboard:
- 20 managers with Russian names, teams, positions
- 80 customers with company names
- 6 categories (drones, accessories, cameras, stabilizers, batteries, software)
- 40 DJI products with realistic prices
- ~3500 sales over 12 months (Jan-Dec 2025)
- Seasonality: Q4 peak (×1.5), January dip (×0.6)
- Manager performance tiers: 3 top performers, 7 average, 10 weak
- Status distribution: ~85% Paid, ~8% Cancelled, ~7% Refunded
- Use Random(42) for reproducibility

## 10:15 — Claude Code / Opus

Create a .NET 8 backend solution with 4 projects:
- Domain: entities (Manager, Customer, Category, Product, Sale, SaleItem), SaleStatus enum
- Application: DTOs, IDashboardService interface, DashboardService implementation
- Infrastructure: AppDbContext with EF Core, indexes, SaleRepository, DatabaseSeeder
- Api: DashboardController, ManagersController, ExceptionMiddleware, Program.cs

Business rules:
- Revenue = sum of (UnitPrice × Quantity) for Paid sales only
- Gross Profit = sum of ((UnitPrice - UnitCost) × Quantity) for Paid only
- Cancelled and Refunded excluded from all calculations
- Previous period = same duration before the current period
- All calculations use decimal, not double

## 11:00 — Claude Code / Opus

Create xUnit tests for DashboardService covering:
- Revenue_OnlyCountsPaidSales
- Cancelled_ExcludedFromAllMetrics
- Refunded_ExcludedFromRevenue
- Margin_ReturnsZero_WhenNoRevenue
- AverageCheck_CorrectDivision
- Rating_SortedByGrossProfit
- EmptyPeriod_ReturnsZeroKpi
- PeriodFilter_InclusiveBounds

Use InMemory EF Core database for test isolation.

## 11:30 — Claude Code / Opus

Create Docker configuration:
- API Dockerfile (multi-stage .NET 8 build)
- Frontend Dockerfile (Node build + Nginx serve)
- docker-compose.yml with postgres, api, frontend services
- PostgreSQL healthcheck
- Nginx config with /api proxy to backend
