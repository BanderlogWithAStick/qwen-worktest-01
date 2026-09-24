FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/SalesDashboard.Api/SalesDashboard.Api.csproj", "src/SalesDashboard.Api/"]
COPY ["src/SalesDashboard.Application/SalesDashboard.Application.csproj", "src/SalesDashboard.Application/"]
COPY ["src/SalesDashboard.Domain/SalesDashboard.Domain.csproj", "src/SalesDashboard.Domain/"]
COPY ["src/SalesDashboard.Infrastructure/SalesDashboard.Infrastructure.csproj", "src/SalesDashboard.Infrastructure/"]
RUN dotnet restore "src/SalesDashboard.Api/SalesDashboard.Api.csproj"
COPY . .
WORKDIR "/src/src/SalesDashboard.Api"
RUN dotnet build "SalesDashboard.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SalesDashboard.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SalesDashboard.Api.dll"]
