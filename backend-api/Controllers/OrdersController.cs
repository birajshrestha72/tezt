using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly EmailService _emailService;

    public OrdersController(AppDbContext context, NotificationService notificationService, EmailService emailService)
    {
        _context = context;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var data = await _context.Orders
                .AsNoTracking()
                .Select(order => new OrderDto
                {
                    Id = order.Id,
                    OrderDate = order.OrderDate,
                    CreditDueDate = order.CreditDueDate,
                    AmountPaid = order.AmountPaid,
                    DiscountAmount = order.DiscountAmount,
                    LoyaltyDiscountApplied = order.LoyaltyDiscountApplied,
                    TotalAmount = order.OrderItems.Sum(orderItem => orderItem.Quantity * orderItem.UnitPrice) - order.DiscountAmount,
                    Status = order.Status,
                    CustomerId = order.CustomerId,
                    ItemCount = order.OrderItems.Count
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load orders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var order = await _context.Orders
                .AsNoTracking()
                .Include(item => item.Customer)
                .Include(item => item.OrderItems)
                    .ThenInclude(orderItem => orderItem.Product)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

            return Ok(ApiResponse<object>.Ok(MapOrderDetail(order)));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load order: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet("{id:int}/items")]
    public async Task<IActionResult> GetItems(int id)
    {
        try
        {
            var exists = await _context.Orders.AnyAsync(order => order.Id == id);
            if (!exists) return NotFound(ApiResponse<object>.Fail("Order not found"));

            var items = await _context.OrderItems
                .AsNoTracking()
                .Where(orderItem => orderItem.OrderId == id)
                .Select(orderItem => new OrderItemSummaryDto
                {
                    ProductId = orderItem.ProductId,
                    ProductName = orderItem.Product.Name,
                    Quantity = orderItem.Quantity,
                    UnitPrice = orderItem.UnitPrice
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(items));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load order items: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet("{id:int}/customer")]
    public async Task<IActionResult> GetCustomer(int id)
    {
        try
        {
            var order = await _context.Orders
                .AsNoTracking()
                .Include(item => item.Customer)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

            return Ok(ApiResponse<object>.Ok(MapCustomer(order.Customer)));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load order customer: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Staff")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid order data."));
            }

            if (dto.Items == null || dto.Items.Count == 0)
            {
                return BadRequest(ApiResponse<object>.Fail("At least one order item is required."));
            }

            var customerExists = await _context.Customers.AnyAsync(customer => customer.Id == dto.CustomerId);
            if (!customerExists)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid customer."));
            }

            var productIds = dto.Items.Select(item => item.ProductId).Distinct().ToList();
            var products = await _context.Products.Where(product => productIds.Contains(product.Id)).ToListAsync();
            if (products.Count != productIds.Count)
            {
                return BadRequest(ApiResponse<object>.Fail("One or more products are invalid."));
            }

            if (dto.Items.Any(item => item.Quantity <= 0 || item.UnitPrice <= 0))
            {
                return BadRequest(ApiResponse<object>.Fail("Each order item must have a quantity and unit price greater than zero."));
            }

            if (dto.Items.Select(item => item.ProductId).Distinct().Count() != dto.Items.Count)
            {
                return BadRequest(ApiResponse<object>.Fail("Duplicate products are not allowed in a single order."));
            }

            var orderDate = NormalizeUtc(dto.OrderDate == default ? DateTime.UtcNow : dto.OrderDate);
            var order = new Order
            {
                OrderDate = orderDate,
                CreditDueDate = NormalizeUtc(dto.CreditDueDate ?? orderDate.AddDays(30)),
                AmountPaid = dto.AmountPaid,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                CustomerId = dto.CustomerId,
                OrderItems = dto.Items?.Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                }).ToList() ?? new List<OrderItem>()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var persistedOrder = await _context.Orders
                .Include(item => item.Customer)
                .Include(item => item.OrderItems)
                    .ThenInclude(orderItem => orderItem.Product)
                .FirstAsync(item => item.Id == order.Id);

            var subtotal = GetOrderSubtotal(persistedOrder);
            var discount = subtotal > 5000m ? subtotal * 0.10m : 0m;
            persistedOrder.DiscountAmount = discount;
            persistedOrder.LoyaltyDiscountApplied = discount > 0m;

            foreach (var orderItem in persistedOrder.OrderItems)
            {
                var product = orderItem.Product;
                if (product == null)
                {
                    return BadRequest(ApiResponse<object>.Fail($"Product {orderItem.ProductId} could not be found."));
                }

                product.StockQty = Math.Max(0, product.StockQty - orderItem.Quantity);
                try
                {
                    await NotifyLowStockIfNeeded(product, $"order:{persistedOrder.Id}");
                }
                catch
                {
                    // Low-stock notification failures must not block order creation.
                }
            }

            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(new
            {
                order = MapOrderDto(persistedOrder),
                subtotal,
                discountAmount = discount,
                totalAmount = subtotal - discount,
                loyaltyDiscountApplied = persistedOrder.LoyaltyDiscountApplied
            }, "Order created successfully"));
        }
        catch (DbUpdateException)
        {
            return BadRequest(ApiResponse<object>.Fail("The order could not be saved because one of the referenced records is invalid."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to create order: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Staff")]
    [HttpPost("{id:int}/items")]
    public async Task<IActionResult> AddItem(int id, CreateOrderLineDto item)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid order item data."));
            }

            var orderExists = await _context.Orders.AnyAsync(order => order.Id == id);
            if (!orderExists) return NotFound(ApiResponse<object>.Fail("Order not found"));

            var exists = await _context.OrderItems.AnyAsync(orderItem => orderItem.OrderId == id && orderItem.ProductId == item.ProductId);
            if (exists) return BadRequest(ApiResponse<object>.Fail("Item already exists in order"));

            _context.OrderItems.Add(new OrderItem
            {
                OrderId = id,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });

            var product = await _context.Products.FirstOrDefaultAsync(productItem => productItem.Id == item.ProductId);
            if (product != null)
            {
                product.StockQty = Math.Max(0, product.StockQty - item.Quantity);
                await NotifyLowStockIfNeeded(product, $"order:{id}");
            }

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { created = true }, "Item added to order"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to add order item: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Staff")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateOrderDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid order data."));
            }

            var order = await _context.Orders.Include(item => item.OrderItems).FirstOrDefaultAsync(item => item.Id == id);
            if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

            order.OrderDate = NormalizeUtc(dto.OrderDate);
            order.CreditDueDate = NormalizeUtc(dto.CreditDueDate ?? dto.OrderDate.AddDays(30));
            order.AmountPaid = dto.AmountPaid;
            order.Status = dto.Status;
            order.CustomerId = dto.CustomerId;

            _context.OrderItems.RemoveRange(order.OrderItems);

            if (dto.Items != null && dto.Items.Any())
            {
                order.OrderItems = dto.Items.Select(item => new OrderItem
                {
                    OrderId = id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                }).ToList();
            }

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { updated = true }, "Order updated successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to update order: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Staff")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Order deleted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to delete order: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Staff")]
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateOrderDto> dtos)
    {
        try
        {
            var orders = dtos.Select(dto => new Order
            {
                OrderDate = NormalizeUtc(dto.OrderDate == default ? DateTime.UtcNow : dto.OrderDate),
                CreditDueDate = NormalizeUtc(dto.CreditDueDate ?? (dto.OrderDate == default ? DateTime.UtcNow : dto.OrderDate).AddDays(30)),
                AmountPaid = dto.AmountPaid,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Pending" : dto.Status,
                CustomerId = dto.CustomerId,
                OrderItems = dto.Items?.Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                }).ToList() ?? new List<OrderItem>()
            }).ToList();

            await _context.Orders.AddRangeAsync(orders);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { inserted = orders.Count }, "Orders inserted successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to insert orders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("with-details")]
    public async Task<IActionResult> WithDetails()
    {
        try
        {
            var data = await _context.Orders
                .AsNoTracking()
                .Include(order => order.Customer)
                .Include(order => order.OrderItems)
                    .ThenInclude(orderItem => orderItem.Product)
                .Select(order => new OrderWithDetailsDto
                {
                    Id = order.Id,
                    OrderDate = order.OrderDate,
                    CreditDueDate = order.CreditDueDate,
                    AmountPaid = order.AmountPaid,
                    DiscountAmount = order.DiscountAmount,
                    LoyaltyDiscountApplied = order.LoyaltyDiscountApplied,
                    TotalAmount = order.OrderItems.Sum(orderItem => orderItem.Quantity * orderItem.UnitPrice) - order.DiscountAmount,
                    Status = order.Status,
                    CustomerId = order.CustomerId,
                    Customer = MapCustomer(order.Customer),
                    OrderItems = order.OrderItems.Select(orderItem => new OrderItemSummaryDto
                    {
                        ProductId = orderItem.ProductId,
                        ProductName = orderItem.Product.Name,
                        Quantity = orderItem.Quantity,
                        UnitPrice = orderItem.UnitPrice
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load detailed orders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("count")]
    public async Task<IActionResult> Count()
    {
        try
        {
            return Ok(ApiResponse<object>.Ok(new { totalOrders = await _context.Orders.CountAsync() }));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to count orders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("total-amount")]
    public async Task<IActionResult> TotalAmount()
    {
        try
        {
            var total = await _context.OrderItems.SumAsync(orderItem => orderItem.UnitPrice * orderItem.Quantity);
            return Ok(ApiResponse<object>.Ok(new { totalAmount = total }));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to calculate total amount: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("top-customers")]
    public async Task<IActionResult> TopCustomers()
    {
        try
        {
            var data = await _context.Orders
                .AsNoTracking()
                .GroupBy(order => new { order.CustomerId, order.Customer.FirstName, order.Customer.LastName })
                .Select(group => new
                {
                    group.Key.CustomerId,
                    CustomerName = group.Key.FirstName + " " + group.Key.LastName,
                    OrderCount = group.Count()
                })
                .OrderByDescending(item => item.OrderCount)
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load top customers: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Staff")]
    [HttpPost("{id:int}/send-invoice")]
    public async Task<IActionResult> SendInvoice(int id)
    {
        try
        {
            var order = await _context.Orders
                .AsNoTracking()
                .Include(item => item.Customer)
                .Include(item => item.OrderItems)
                    .ThenInclude(orderItem => orderItem.Product)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (order == null)
            {
                return NotFound(ApiResponse<object>.Fail("Order not found"));
            }

            var subtotal = GetOrderSubtotal(order);
            var items = order.OrderItems.Select(orderItem => new InvoiceLineItemDto
            {
                ProductName = orderItem.Product.Name,
                Quantity = orderItem.Quantity,
                UnitPrice = orderItem.UnitPrice,
                LineTotal = orderItem.Quantity * orderItem.UnitPrice
            }).ToList();

            await _emailService.SendInvoiceEmail(
                order.Customer.Email,
                $"{order.Customer.FirstName} {order.Customer.LastName}".Trim(),
                order.Id,
                subtotal - order.DiscountAmount,
                order.DiscountAmount,
                items);

            return Ok(ApiResponse<object>.Ok(new { sent = true, orderId = order.Id }, "Invoice email sent successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to send invoice: {ex.Message}"));
        }
    }

    private async Task NotifyLowStockIfNeeded(Product product, string referenceKey)
    {
        if (product.StockQty >= 10)
        {
            return;
        }

        await _notificationService.Add(
            $"Low stock alert: {product.Name} is down to {product.StockQty} unit(s).",
            "LowStock",
            $"low-stock:product:{product.Id}:{referenceKey}");
    }

    private static decimal GetOrderSubtotal(Order order)
    {
        return order.OrderItems.Sum(orderItem => orderItem.Quantity * orderItem.UnitPrice);
    }

    private static DateTime NormalizeUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    private static OrderDto MapOrderDto(Order order)
    {
        var subtotal = GetOrderSubtotal(order);
        return new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            CreditDueDate = order.CreditDueDate,
            AmountPaid = order.AmountPaid,
            DiscountAmount = order.DiscountAmount,
            LoyaltyDiscountApplied = order.LoyaltyDiscountApplied,
            TotalAmount = subtotal - order.DiscountAmount,
            Status = order.Status,
            CustomerId = order.CustomerId,
            ItemCount = order.OrderItems.Count
        };
    }

    private static OrderDetailDto MapOrderDetail(Order order)
    {
        var subtotal = GetOrderSubtotal(order);
        return new OrderDetailDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            CreditDueDate = order.CreditDueDate,
            AmountPaid = order.AmountPaid,
            DiscountAmount = order.DiscountAmount,
            LoyaltyDiscountApplied = order.LoyaltyDiscountApplied,
            TotalAmount = subtotal - order.DiscountAmount,
            Status = order.Status,
            CustomerId = order.CustomerId,
            OrderItems = order.OrderItems.Select(orderItem => new OrderItemSummaryDto
            {
                ProductId = orderItem.ProductId,
                ProductName = orderItem.Product.Name,
                Quantity = orderItem.Quantity,
                UnitPrice = orderItem.UnitPrice
            }).ToList()
        };
    }

    private static CustomerDto MapCustomer(Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            Phone = customer.Phone,
            VehicleNumber = customer.VehicleNumber,
            VehicleMake = customer.VehicleMake,
            VehicleModel = customer.VehicleModel,
            VehicleYear = customer.VehicleYear
        };
    }
}