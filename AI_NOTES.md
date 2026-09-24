# AI Notes — Reflection on AI-Assisted Development

## Tools Used
- **Claude Code (Opus)** — primary coding agent for both frontend and backend
- **Web Search** — for verifying .NET 8 / EF Core patterns and Docker best practices

## What Was Delegated to AI
1. **Frontend component structure** — described the dashboard layout, AI generated all React components with Tailwind styling
2. **Seed data generation** — AI created the deterministic Random(42) seeder with realistic distributions
3. **Backend solution scaffolding** — all 4 .NET projects, entities, DbContext, repository pattern
4. **Business logic** — DashboardService with KPI calculations, manager rating, dynamics, etc.
5. **Unit tests** — test cases for all critical business rules
6. **Docker configuration** — Dockerfiles and docker-compose.yml

## What Was Designed Independently
- **API contract design** — chose REST endpoints, query parameters, and DTO shapes
- **Business rules** — defined how Cancelled/Refunded are handled (both excluded)
- **Index strategy** — decided which columns need indexes based on query patterns
- **Period comparison logic** — previous period = [from - duration; from - 1 day]
- **Project dependency graph** — Domain → Application → Infrastructure → Api

## Where AI Accelerated Work
- Generating 40 realistic DJI product names with prices and costs
- Creating the full React component tree with animations in one pass
- Writing the DatabaseSeeder with proper distribution logic
- Boilerplate: DTOs, entity configurations, controller methods

## Where AI Made Mistakes
- Initially suggested using `double` for money — corrected to `decimal`
- First version of seed had no seasonality — had to prompt for Q4 peaks
- AI included unnecessary MediatR/CQRS — removed per requirements
- Missing navigation property includes in repository — caused N+1 potential

## What Was Changed/Rejected
- Rejected AI's suggestion to use MediatR — overkill for this scope
- Changed seed from random Guids to sequential for better test debugging
- Added explicit `HasIndex` calls that AI omitted initially
- Modified AI's error handling to use RFC 7807 Problem Details format

## How Code Was Verified
- Read through all generated business logic to confirm formula correctness
- Checked that Cancelled AND Refunded are both excluded from Revenue
- Verified that previous period calculation is symmetric
- Confirmed all async methods use proper CancellationToken
- Reviewed generated SQL patterns (Include vs explicit loading)
- Ensured decimal types used everywhere for monetary values
