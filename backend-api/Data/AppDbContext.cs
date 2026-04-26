using Microsoft.EntityFrameworkCore;
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
        }
    }
}
