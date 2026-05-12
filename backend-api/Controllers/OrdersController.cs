using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    public OrdersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.Orders
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                CreditDueDate = o.CreditDueDate,
                AmountPaid = o.AmountPaid,
                Status = o.Status,
                CustomerId = o.CustomerId,
                ItemCount = o.OrderItems.Count
            })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

        return Ok(ApiResponse<object>.Ok(new OrderDetailDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            CreditDueDate = order.CreditDueDate,
            AmountPaid = order.AmountPaid,
            Status = order.Status,
            CustomerId = order.CustomerId,
            OrderItems = order.OrderItems.Select(oi => new OrderItemSummaryDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        }));
    }

    [HttpGet("{id:int}/items")]
    public async Task<IActionResult> GetItems(int id)
    {
        var exists = await _context.Orders.AnyAsync(o => o.Id == id);
        if (!exists) return NotFound(ApiResponse<object>.Fail("Order not found"));

        var items = await _context.OrderItems
            .Where(oi => oi.OrderId == id)
            .Select(oi => new OrderItemSummaryDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(items));
    }

    [HttpGet("{id:int}/customer")]
    public async Task<IActionResult> GetCustomer(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

        var c = order.Customer;
        return Ok(ApiResponse<object>.Ok(new CustomerDto
        {
            Id = c.Id,
            FirstName = c.FirstName,
            LastName = c.LastName,
            Email = c.Email,
            Phone = c.Phone
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var order = new Order
        {
            OrderDate = dto.OrderDate,
            CreditDueDate = dto.CreditDueDate ?? dto.OrderDate.AddDays(30),
            AmountPaid = dto.AmountPaid,
            Status = dto.Status,
            CustomerId = dto.CustomerId,
            OrderItems = dto.Items?.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, ApiResponse<OrderDto>.Ok(new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            CreditDueDate = order.CreditDueDate,
            AmountPaid = order.AmountPaid,
            Status = order.Status,
            CustomerId = order.CustomerId,
            ItemCount = order.OrderItems?.Count ?? 0
        }, "Order created successfully"));
    }

    [HttpPost("{id:int}/items")]
    public async Task<IActionResult> AddItem(int id, CreateOrderLineDto item)
    {
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == id);
        if (!orderExists) return NotFound(ApiResponse<object>.Fail("Order not found"));

        var exists = await _context.OrderItems.AnyAsync(oi => oi.OrderId == id && oi.ProductId == item.ProductId);
        if (exists) return BadRequest(ApiResponse<object>.Fail("Item already exists in order"));

        _context.OrderItems.Add(new OrderItem
        {
            OrderId = id,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice
        });

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { created = true }, "Item added to order"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateOrderDto dto)
    {
        var order = await _context.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

        order.OrderDate = dto.OrderDate;
        order.CreditDueDate = dto.CreditDueDate ?? dto.OrderDate.AddDays(30);
        order.AmountPaid = dto.AmountPaid;
        order.Status = dto.Status;
        order.CustomerId = dto.CustomerId;

        _context.OrderItems.RemoveRange(order.OrderItems);

        if (dto.Items != null && dto.Items.Any())
        {
            order.OrderItems = dto.Items.Select(i => new OrderItem
            {
                OrderId = id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList();
        }

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { updated = true }, "Order updated successfully"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound(ApiResponse<object>.Fail("Order not found"));

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Order deleted successfully"));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateOrderDto> dtos)
    {
        var orders = dtos.Select(dto => new Order
        {
            OrderDate = dto.OrderDate,
            CreditDueDate = dto.CreditDueDate ?? dto.OrderDate.AddDays(30),
            AmountPaid = dto.AmountPaid,
            Status = dto.Status,
            CustomerId = dto.CustomerId,
            OrderItems = dto.Items?.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        }).ToList();

        await _context.Orders.AddRangeAsync(orders);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { inserted = orders.Count }, "Orders inserted successfully"));
    }

    [HttpGet("with-details")]
    public async Task<IActionResult> WithDetails()
    {
        var data = await _context.Orders
            .Select(o => new OrderWithDetailsDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                CreditDueDate = o.CreditDueDate,
                AmountPaid = o.AmountPaid,
                Status = o.Status,
                Customer = new CustomerDto
                {
                    Id = o.Customer.Id,
                    FirstName = o.Customer.FirstName,
                    LastName = o.Customer.LastName,
                    Email = o.Customer.Email,
                    Phone = o.Customer.Phone
                },
                OrderItems = o.OrderItems.Select(oi => new OrderItemSummaryDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("count")]
    public async Task<IActionResult> Count()
        => Ok(ApiResponse<object>.Ok(new { totalOrders = await _context.Orders.CountAsync() }));

    [HttpGet("total-amount")]
    public async Task<IActionResult> TotalAmount()
    {
        var total = await _context.OrderItems
            .SumAsync(oi => oi.UnitPrice * oi.Quantity);
        return Ok(ApiResponse<object>.Ok(new { totalAmount = total }));
    }

    [HttpGet("top-customers")]
    public async Task<IActionResult> TopCustomers()
    {
        var data = await _context.Orders
            .GroupBy(o => new { o.CustomerId, o.Customer.FirstName, o.Customer.LastName })
            .Select(g => new
            {
                g.Key.CustomerId,
                CustomerName = g.Key.FirstName + " " + g.Key.LastName,
                OrderCount = g.Count()
            })
            .OrderByDescending(x => x.OrderCount)
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(data));
    }
}