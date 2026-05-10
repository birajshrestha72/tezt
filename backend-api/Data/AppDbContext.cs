using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.models;

public class AppDbContext : DbContext
{
    //Add constructor to accept DbContextOptions 
    //This allows configuration to be passed in from Program.cs when registering the DbContext 
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    // ── BIRAJ (M2) DbSets ────────────────────────────────────────────────────
    public DbSet<PartCategory>      PartCategories     => Set<PartCategory>();
    public DbSet<Part>              Parts              => Set<Part>();
    public DbSet<StockMovement>     StockMovements     => Set<StockMovement>();
    public DbSet<PurchaseOrder>     PurchaseOrders     => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    // ── RABIN (M3) adds: SaleInvoices, SaleInvoiceItems, CreditPayments
    // ── AYUSH (M4) adds: Customers, VehicleModels, Vehicles, Appointments, PartRequests, Reviews

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite Key: OrderItem
        modelBuilder.Entity<OrderItem>()
            .HasKey(oi => new { oi.OrderId, oi.ProductId });

        // Configure relationships

        // Category - Product (1-M)
        modelBuilder.Entity<Category>()
            .HasMany(c => c.Products)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Supplier - Product (1-M)
        modelBuilder.Entity<Supplier>()
            .HasMany(s => s.Products)
            .WithOne(p => p.Supplier)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

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
