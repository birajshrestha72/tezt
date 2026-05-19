using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class PurchaseOrderController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;

    public PurchaseOrderController(AppDbContext context, NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var purchaseOrders = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(order => order.Supplier)
                .Include(order => order.Items)
                    .ThenInclude(item => item.Product)
                .ToListAsync();

            var mappedPurchaseOrders = purchaseOrders
                .OrderByDescending(order => order.OrderDate)
                .Select(MapPurchaseOrder)
                .ToList();

            return Ok(ApiResponse<object>.Ok(mappedPurchaseOrders));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load purchase orders: {ex.Message}"));
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(order => order.Supplier)
                .Include(order => order.Items)
                    .ThenInclude(item => item.Product)
                .FirstOrDefaultAsync(order => order.Id == id);

            if (purchaseOrder == null)
            {
                return NotFound(ApiResponse<object>.Fail("Purchase order not found"));
            }

            return Ok(ApiResponse<object>.Ok(MapPurchaseOrder(purchaseOrder)));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load purchase order: {ex.Message}"));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePurchaseOrderDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid purchase order data."));
            }

            var purchaseOrder = new PurchaseOrder
            {
                SupplierId = dto.SupplierId,
                Items = dto.Items.Select(item => new PurchaseOrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitCost = item.UnitCost
                }).ToList()
            };

            _context.PurchaseOrders.Add(purchaseOrder);
            await _context.SaveChangesAsync();

            var created = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(order => order.Supplier)
                .Include(order => order.Items)
                    .ThenInclude(item => item.Product)
                .FirstAsync(order => order.Id == purchaseOrder.Id);

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(MapPurchaseOrder(created), "Purchase order created successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to create purchase order: {ex.Message}"));
        }
    }

    [HttpPut("{id:int}/receive")]
    public async Task<IActionResult> Receive(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(order => order.Items)
                    .ThenInclude(item => item.Product)
                .FirstOrDefaultAsync(order => order.Id == id);

            if (purchaseOrder == null)
            {
                return NotFound(ApiResponse<object>.Fail("Purchase order not found"));
            }

            if (string.Equals(purchaseOrder.Status, "Received", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(ApiResponse<object>.Fail("Purchase order has already been received."));
            }

            purchaseOrder.Status = "Received";

            foreach (var item in purchaseOrder.Items)
            {
                var product = item.Product;
                product.StockQty += item.Quantity;

                if (product.StockQty < 10)
                {
                    await _notificationService.Add(
                        $"Low stock alert: {product.Name} is down to {product.StockQty} unit(s).",
                        "LowStock",
                        $"low-stock:product:{product.Id}:purchase-order:{purchaseOrder.Id}");
                }
            }

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { received = true, purchaseOrderId = purchaseOrder.Id }, "Purchase order marked as received."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to receive purchase order: {ex.Message}"));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
            {
                return NotFound(ApiResponse<object>.Fail("Purchase order not found"));
            }

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Purchase order deleted successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to delete purchase order: {ex.Message}"));
        }
    }

    private static PurchaseOrderDto MapPurchaseOrder(PurchaseOrder purchaseOrder)
    {
        return new PurchaseOrderDto
        {
            Id = purchaseOrder.Id,
            OrderDate = purchaseOrder.OrderDate,
            Status = purchaseOrder.Status,
            SupplierId = purchaseOrder.SupplierId,
            SupplierName = purchaseOrder.Supplier.Name,
            Items = purchaseOrder.Items.Select(item => new PurchaseOrderItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                Quantity = item.Quantity,
                UnitCost = item.UnitCost
            }).ToList()
        };
    }
}