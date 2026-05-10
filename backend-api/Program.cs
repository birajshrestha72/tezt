using Hangfire;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.AllowAnyOrigin() // Use AllowAnyOrigin() with caution
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});


builder.Services.Configure<ExternalServicesOptions>(builder.Configuration.GetSection("ExternalServices"));

// ── BIRAJ (M2) services ────────────────────────────────────────────────────
builder.Services.AddScoped<StockAlertService>();
// ── RABIN (M3) adds LoyaltyService + EmailService below this line ───────────


var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.CanConnect();
    if (db.Database.CanConnect())
    {
        Console.WriteLine("Database connected successfully!");
    }
    else
    {

        Console.WriteLine(" Database connection failed!");
    }
}

RecurringJob.AddOrUpdate<StockAlertService>(
    "stock-alert-hourly", svc => svc.CheckAndNotifyAsync(), Cron.Hourly);
// ── SAKSHAM (M5) adds RecurringJob for CreditReminderService below ──────────

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

app.UseAuthorization();

app.MapControllers();

app.Run();