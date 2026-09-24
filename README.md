# Sales Performance Dashboard — DJI-Market.ru

Full-stack dashboard for sales analytics built with React + TypeScript (frontend) and ASP.NET Core + EF Core + PostgreSQL (backend).

## Quick Start

```bash
docker compose up --build
```

Then open http://localhost:5173

## Architecture

```
├── frontend/              # React + TypeScript + Tailwind CSS + Vite
├── src/                   # Backend .NET solution
│   ├── SalesDashboard.Api/           # ASP.NET Core Web API
│   ├── SalesDashboard.Application/   # Services, DTOs, interfaces
│   ├── SalesDashboard.Domain/        # Entities, enums
│   └── SalesDashboard.Infrastructure/ # EF Core, migrations, seed
├── tests/                 # xUnit tests
├── docker-compose.yml
└── README.md
```

## Business Rules

| Metric | Formula |
|--------|---------|
| Revenue | Σ (UnitPrice × Quantity) for **Paid** sales only |
| Gross Profit | Σ ((UnitPrice − UnitCost) × Quantity) for **Paid** sales only |
| Margin | Gross Profit / Revenue × 100 (0 if no revenue) |
| Average Check | Revenue / Count(Paid sales) (0 if no sales) |
| Cancelled | Excluded from all calculations |
| Refunded | Excluded from all calculations (treated same as Cancelled — money returned = no net revenue) |
| Previous Period | For range [from; to]: prev = [from − duration; from − 1 day] |
| Date Bounds | Inclusive: SaleDate >= from AND SaleDate <= to |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/dashboard/kpi?from=&to=` | KPI metrics with delta |
| `GET /api/dashboard/managers/rating?from=&to=&sortBy=&order=` | Manager ranking |
| `GET /api/dashboard/dynamics?from=&to=&granularity=` | Time series data |
| `GET /api/dashboard/categories?from=&to=` | Category breakdown |
| `GET /api/dashboard/products/top?from=&to=&limit=` | Top products |
| `GET /api/dashboard/sales/recent?from=&to=&limit=` | Recent transactions |
| `GET /api/managers` | All managers list |

## Database

- PostgreSQL 16
- EF Core 8.0 with Code-First migrations
- Key indexes: Sale(SaleDate), Sale(ManagerId, SaleDate), Sale(Status, SaleDate), SaleItem(SaleId), SaleItem(ProductId), Product(CategoryId)
- Deterministic seed: 20 managers, 80 customers, 6 categories, 40 products, ~3500 sales over 12 months

## Tech Stack

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Recharts, Framer Motion, Lucide Icons

**Backend:** .NET 8, ASP.NET Core, Entity Framework Core, PostgreSQL, xUnit, FluentAssertions

**Infrastructure:** Docker, Docker Compose, Nginx

## What Was Done in 8 Hours

- ✅ Full domain model with 6 entities
- ✅ REST API with 7 endpoints
- ✅ Business logic with correct KPI calculations
- ✅ Deterministic seed data (Random(42))
- ✅ Database indexes for performance
- ✅ React dashboard with KPI cards, charts, rating table
- ✅ Period selector with 6 presets + custom range
- ✅ Animations and loading states
- ✅ Docker Compose one-command startup
- ✅ Unit tests for business rules
- ✅ Global exception middleware
- ✅ CORS configuration

## What Could Be Improved

- Raw SQL / Dapper for complex analytics queries
- CQRS with MediatR for better separation
- FluentValidation for request validation
- Redis caching for KPI endpoints
- Integration tests with Testcontainers
- CI/CD pipeline (GitHub Actions)
- OpenTelemetry for observability
- Rate limiting and request throttling
- Pagination for large datasets
- Export to Excel/PDF
