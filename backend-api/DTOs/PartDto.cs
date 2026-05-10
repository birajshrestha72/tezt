using System.ComponentModel.DataAnnotations;

namespace WeatherAPI.DTOs;

public class PartDto {
    public Guid    Id           { get; set; }
    public int?    SupplierId   { get; set; }
    public string? SupplierName { get; set; }
    public Guid?   CategoryId   { get; set; }
    public string? CategoryName { get; set; }
    public string  Name         { get; set; } = "";
    public decimal UnitPrice    { get; set; }
    public decimal CostPrice    { get; set; }
    public int     StockQty     { get; set; }
    public int     ReorderLevel { get; set; }
    public bool    IsActive     { get; set; }
    public bool    IsLowStock   { get; set; }
    public bool    IsOutOfStock { get; set; }
    public DateTime UpdatedAt   { get; set; }
}

public class CreatePartDto {
    [Required][MaxLength(150)] public string  Name         { get; set; } = "";
    public int?    SupplierId   { get; set; }
    public Guid?   CategoryId   { get; set; }
    [Range(0,double.MaxValue)] public decimal UnitPrice    { get; set; }
    [Range(0,double.MaxValue)] public decimal CostPrice    { get; set; }
    [Range(0,int.MaxValue)]    public int     StockQty     { get; set; } = 0;
    [Range(1,int.MaxValue)]    public int     ReorderLevel { get; set; } = 10;
}

public class UpdatePartDto {
    public string?  Name         { get; set; }
    public int?     SupplierId   { get; set; }
    public Guid?    CategoryId   { get; set; }
    public decimal? UnitPrice    { get; set; }
    public decimal? CostPrice    { get; set; }
    public int?     StockQty     { get; set; }
    public int?     ReorderLevel { get; set; }
    public bool?    IsActive     { get; set; }
}

public class PartCategoryDto {
    public Guid   Id   { get; set; }
    public string Name { get; set; } = "";
}

public class CreatePartCategoryDto {
    [Required][MaxLength(100)] public string Name { get; set; } = "";
}