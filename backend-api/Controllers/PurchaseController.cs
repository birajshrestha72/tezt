using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.models;
using WeatherAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PurchaseController : ControllerBase
{
    private readonly AppDbContext _ctx;
    public PurchaseController(AppDbContext ctx) => _ctx = ctx;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _ctx.Set<PurchaseOrder>()
            .Include(o => o.Supplier)
            .Include(o => o.Items)
            .ThenInclude(i => i.Part)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        var data = orders.Select(o => new PurchaseOrderDto
        {
            Id = o.Id,
            SupplierId = o.SupplierId,
            SupplierName = o.Supplier != null ? o.Supplier.Name : null,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            Notes = o.Notes,
            OrderedAt = o.OrderedAt,
            ReceivedAt = o.ReceivedAt,
            Items = o.Items.Select(i => new PurchaseOrderItemDto
            {
                PartId = i.PartId,
                PartName = i.Part != null ? i.Part.Name : string.Empty,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Subtotal
            }).ToList()
        }).ToList();

        return Ok(data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _ctx.Set<PurchaseOrder>()
            .Include(o => o.Supplier)
            .Include(o => o.Items)
            .ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        return Ok(new PurchaseOrderDto
        {
            Id = order.Id,
            SupplierId = order.SupplierId,
            SupplierName = order.Supplier != null ? order.Supplier.Name : null,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Notes = order.Notes,
            OrderedAt = order.OrderedAt,
            ReceivedAt = order.ReceivedAt,
            Items = order.Items.Select(i => new PurchaseOrderItemDto
            {
                PartId = i.PartId,
                PartName = i.Part != null ? i.Part.Name : string.Empty,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Subtotal
            }).ToList()
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var supplierExists = await _ctx.Suppliers.AnyAsync(s => s.Id == dto.SupplierId);
        if (!supplierExists) return NotFound(new { message = "Supplier not found." });

        foreach (var item in dto.Items)
        {
            var partExists = await _ctx.Set<Part>().AnyAsync(p => p.Id == item.PartId);
            if (!partExists) return NotFound(new { message = $"Part not found: {item.PartId}" });
        }

        var order = new PurchaseOrder
        {
            SupplierId = dto.SupplierId,
            StaffId = dto.StaffId,
            Notes = dto.Notes,
            Status = "pending",
            TotalAmount = dto.Items.Sum(i => i.Quantity * i.UnitPrice)
        };

        _ctx.Add(order);

        foreach (var item in dto.Items)
        {
            _ctx.Add(new PurchaseOrderItem
            {
                PurchaseOrderId = order.Id,
                PartId = item.PartId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        await _ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { id = order.Id });
    }

    [HttpPut("{id:guid}/receive")]
    public async Task<IActionResult> MarkReceived(Guid id)
    {
        var order = await _ctx.Set<PurchaseOrder>()
            .Include(o => o.Items)
            .ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();
        if (order.Status != "pending") return BadRequest(new { message = $"Cannot receive order in '{order.Status}' status." });

        await using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            order.Status = "received";
            order.ReceivedAt = DateTime.UtcNow;

            foreach (var item in order.Items)
            {
                item.Part.StockQty += item.Quantity;
                item.Part.UpdatedAt = DateTime.UtcNow;
                _ctx.Add(new StockMovement
                {
                    PartId = item.PartId,
                    ChangeQty = item.Quantity,
                    MovementType = "purchase",
                    ReferenceId = order.Id,
                    Notes = "PO received"
                });
            }

            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }

        return Ok(new { message = "Received. Stock updated." });
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var order = await _ctx.Set<PurchaseOrder>().FindAsync(id);
        if (order == null) return NotFound();
        if (order.Status != "pending") return BadRequest(new { message = "Only pending orders can be cancelled." });

        order.Status = "cancelled";
        await _ctx.SaveChangesAsync();
        return Ok(new { message = "Order cancelled." });
    }
}