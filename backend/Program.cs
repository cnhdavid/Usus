using Usus.API.API.Middleware;
using Usus.API.Infrastructure.Data;
using Usus.API.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Usus.API.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=usus_dev.db";
if (connectionString.Contains("Data Source") && connectionString.EndsWith(".db"))
    builder.Services.AddDbContext<DataContext>(options => options.UseSqlite(connectionString));
else
    builder.Services.AddDbContext<DataContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddScoped<IHabitRepository, HabitRepository>();
builder.Services.AddScoped<IDailyLogRepository, DailyLogRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "usus_session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None; // HTTP in dev
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
        options.SlidingExpiration = true;
        // Return 401 instead of redirecting to login page
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorizationBuilder();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
                  "http://localhost:8081"  // Expo web (Metro dev server)
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Nötig für Cookies
    });
});

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DataContext>();
    context.Database.Migrate();

    // Seed-User mit ungültigem PasswordHash bereinigen
    var badUser = context.Users.FirstOrDefault(u => u.Email == "default@usus.app");
    if (badUser != null && (badUser.PasswordHash == "seed" || badUser.PasswordHash.Length < 20))
    {
        var habits = context.Habits.Where(h => h.UserId == badUser.Id).ToList();
        context.Habits.RemoveRange(habits);
        context.Users.Remove(badUser);
        context.SaveChanges();
    }
}

app.Run();
