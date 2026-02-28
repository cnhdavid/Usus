FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY *.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .

RUN mkdir -p /app/data

ENV ASPNETCORE_URLS=http://+:5112
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 5112

ENTRYPOINT ["dotnet", "HabitTracker.API.dll"]
