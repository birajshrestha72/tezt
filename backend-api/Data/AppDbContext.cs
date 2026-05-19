using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.models;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Milestone 1 Models
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<Part> Parts { get; set; }

        // Existing Models (For compatibility)
        public DbSet<Category> Categories { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }

        // ── BIRAJ (M2) DbSets ────────────────────────────────────────────────────
        public DbSet<PartCategory> PartCategories => Set<PartCategory>();
        public DbSet<StockMovement> StockMovements => Set<StockMovement>();
        public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
        public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
        // ── RABIN (M3) adds: SaleInvoices, SaleInvoiceItems, CreditPayments
        // ── AYUSH (M4) adds: Customers, VehicleModels, Vehicles, Appointments, PartRequests, Reviews

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure OrderItem composite key
            modelBuilder.Entity<OrderItem>()
                .HasKey(oi => new { oi.OrderId, oi.ProductId });

            // Seed Data GUIDs
            var adminRoleId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            var staffRoleId = Guid.Parse("00000000-0000-0000-0000-000000000002");
            var customerRoleId = Guid.Parse("00000000-0000-0000-0000-000000000003");
            var adminUserId = Guid.Parse("f0000000-0000-0000-0000-000000000000");

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = adminRoleId, Name = "Admin" },
                new Role { Id = staffRoleId, Name = "Staff" },
                new Role { Id = customerRoleId, Name = "Customer" }
            );

            // Seed Admin User
            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = adminUserId, 
                    Email = "admin@vp.com", 
                    PasswordHash = "Admin@123", 
                    FullName = "System Admin", 
                    RoleId = adminRoleId 
                }
            );

            // Customer - Order (1-M)
            modelBuilder.Entity<Customer>()
                .HasMany(c => c.Orders)
                .WithOne(o => o.Customer)
                .HasForeignKey(o => o.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order - OrderItem (1-M)
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product - OrderItem (1-M)
            modelBuilder.Entity<Product>()
                .HasMany(p => p.OrderItems)
                .WithOne(oi => oi.Product)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── BIRAJ (M2) EF configs ────────────────────────────────────────────
            modelBuilder.Entity<Part>()
                .HasOne(p => p.Supplier).WithMany()
                .HasForeignKey(p => p.SupplierId).OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Part>()
                .HasOne(p => p.Category).WithMany(c => c.Parts)
                .HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<PurchaseOrderItem>()
                .HasIndex(i => new { i.PurchaseOrderId, i.PartId }).IsUnique();
            // ── RABIN (M3) adds EF configs below ─────────────────────────────
        }
    }
}

