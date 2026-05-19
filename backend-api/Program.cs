using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VehiclePartsAPI.Services;
using VehiclePartsAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<CreditReminderService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtConfig = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]!)),
            NameClaimType = System.Security.Claims.ClaimTypes.Name,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

    options.AddPolicy("ProductionPolicy", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});


builder.Services.Configure<ExternalServicesOptions>(builder.Configuration.GetSection("ExternalServices"));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));



var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    var adminExists = await db.Staff.AnyAsync(staff => staff.Role == "Admin");
    if (!adminExists)
    {
        db.Staff.Add(new Staff
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@vehicleparts.com",
            Role = "Admin",
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@2025")
        });
        await db.SaveChangesAsync();
    }

    var staffExists = await db.Staff.AnyAsync(staff => staff.Email == "staff1@vehicleparts.com");
    if (!staffExists)
    {
        db.Staff.Add(new Staff
        {
            FirstName = "Staff",
            LastName = "Member",
            Email = "staff1@vehicleparts.com",
            Role = "Staff",
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@2025")
        });
        await db.SaveChangesAsync();
    }

    var customerExists = await db.Customers.AnyAsync(customer => customer.Email == "cust1@vehicleparts.com");
    if (!customerExists)
    {
        db.Customers.Add(new Customer
        {
            FirstName = "Customer",
            LastName = "User",
            Email = "cust1@vehicleparts.com",
            Phone = "555-0100",
            VehicleNumber = "WBM-1001",
            VehicleMake = "Toyota",
            VehicleModel = "Corolla",
            VehicleYear = 2019,
            VehicleType = "Sedan",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cust@2025!")
        });
        await db.SaveChangesAsync();
    }

    if (db.Database.CanConnect())
    {
        Console.WriteLine("Database connected successfully!");
    }
    else
    {

        Console.WriteLine(" Database connection failed!");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(app.Environment.IsDevelopment() ? "DevelopmentPolicy" : "ProductionPolicy");
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
}