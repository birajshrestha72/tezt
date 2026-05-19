using Hangfire;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention());

// Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IPartService, PartService>();

// JWT Authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

builder.Services.Configure<ExternalServicesOptions>(builder.Configuration.GetSection("ExternalServices"));

// ── BIRAJ (M2) services ────────────────────────────────────────────────────
builder.Services.AddScoped<StockAlertService>();
// ── RABIN (M3) adds LoyaltyService + EmailService below this line ───────────

var app = builder.Build();

RecurringJob.AddOrUpdate<StockAlertService>(
    "stock-alert-hourly", svc => svc.CheckAndNotifyAsync(), Cron.Hourly);
// ── SAKSHAM (M5) adds RecurringJob for CreditReminderService below ──────────

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();