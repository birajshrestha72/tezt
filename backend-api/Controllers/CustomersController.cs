using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;
    public CustomersController(AppDbContext context) => _context = context;

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search = null, [FromQuery] string? phone = null, [FromQuery] string? vehicleNumber = null, [FromQuery] int? id = null)
    {
        try
        {
            var query = _context.Customers.AsNoTracking().AsQueryable();

            if (id.HasValue)
            {
                query = query.Where(customer => customer.Id == id.Value);
            }

            if (!string.IsNullOrWhiteSpace(phone))
            {
                query = query.Where(customer => customer.Phone != null && customer.Phone.Contains(phone));
            }

            if (!string.IsNullOrWhiteSpace(vehicleNumber))
            {
                query = query.Where(customer => customer.VehicleNumber != null && customer.VehicleNumber.Contains(vehicleNumber));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(customer =>
                    customer.FirstName.ToLower().Contains(term) ||
                    customer.LastName.ToLower().Contains(term) ||
                    customer.Email.ToLower().Contains(term) ||
                    (customer.Phone != null && customer.Phone.ToLower().Contains(term)) ||
                    (customer.VehicleNumber != null && customer.VehicleNumber.ToLower().Contains(term)));
            }

            var customers = await query
                .OrderBy(customer => customer.FirstName)
                .Select(customer => MapCustomer(customer))
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(customers));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customers: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            if (User.IsInRole("Customer") && GetCurrentUserId() != id)
            {
                return Forbid();
            }

            var customer = await _context.Customers.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id);
            if (customer == null) return NotFound(ApiResponse<object>.Fail("Customer not found."));

            return Ok(ApiResponse<object>.Ok(MapCustomer(customer)));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customer: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet("{id:int}/orders")]
    public async Task<IActionResult> GetOrders(int id)
    {
        try
        {
            if (User.IsInRole("Customer") && GetCurrentUserId() != id)
            {
                return Forbid();
            }

            var exists = await _context.Customers.AnyAsync(customer => customer.Id == id);
            if (!exists) return NotFound(ApiResponse<object>.Fail("Customer not found."));

            var orders = await _context.Orders
                .AsNoTracking()
                .Where(order => order.CustomerId == id)
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
                    Customer = new CustomerDto
                    {
                        Id = order.Customer.Id,
                        FirstName = order.Customer.FirstName,
                        LastName = order.Customer.LastName,
                        Email = order.Customer.Email,
                        Phone = order.Customer.Phone,
                        VehicleNumber = order.Customer.VehicleNumber,
                        VehicleMake = order.Customer.VehicleMake,
                        VehicleModel = order.Customer.VehicleModel,
                        VehicleYear = order.Customer.VehicleYear,
                        VehicleType = order.Customer.VehicleType
                    },
                    OrderItems = order.OrderItems.Select(orderItem => new OrderItemSummaryDto
                    {
                        ProductId = orderItem.ProductId,
                        ProductName = orderItem.Product.Name,
                        Quantity = orderItem.Quantity,
                        UnitPrice = orderItem.UnitPrice
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(orders));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customer orders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid customer data."));
            }

            var customer = new Customer
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                VehicleNumber = dto.VehicleNumber,
                VehicleMake = dto.VehicleMake,
                VehicleModel = dto.VehicleModel,
                VehicleYear = dto.VehicleYear,
                VehicleType = dto.VehicleType
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, ApiResponse<object>.Ok(MapCustomer(customer), "Customer created successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to create customer: {ex.Message}"));
        }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterCustomerDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid registration data."));
            }

            var existing = await _context.Customers.AnyAsync(customer => customer.Email == dto.Email);
            if (existing)
            {
                return BadRequest(ApiResponse<object>.Fail("A customer with that email already exists."));
            }

            var customer = new Customer
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                VehicleNumber = dto.VehicleNumber,
                VehicleMake = dto.VehicleMake,
                VehicleModel = dto.VehicleModel,
                VehicleYear = dto.VehicleYear,
                VehicleType = dto.VehicleType,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(MapCustomer(customer), "Customer registered successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to register customer: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid customer data."));
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(item => item.Id == id);
            if (customer == null) return NotFound(ApiResponse<object>.Fail("Customer not found."));

            var emailExists = await _context.Customers.AnyAsync(item => item.Email == dto.Email && item.Id != id);
            if (emailExists)
            {
                return BadRequest(ApiResponse<object>.Fail("Another customer already uses that email."));
            }

            customer.FirstName = dto.FirstName;
            customer.LastName = dto.LastName;
            customer.Email = dto.Email;
            customer.Phone = dto.Phone;
            customer.VehicleNumber = dto.VehicleNumber;
            customer.VehicleMake = dto.VehicleMake;
            customer.VehicleModel = dto.VehicleModel;
            customer.VehicleYear = dto.VehicleYear;
            customer.VehicleType = dto.VehicleType;

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(MapCustomer(customer), "Customer updated successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to update customer: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(ApiResponse<object>.Fail("Customer not found."));

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Customer deleted successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to delete customer: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateCustomerDto> dtos)
    {
        try
        {
            var customers = dtos.Select(dto => new Customer
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                VehicleNumber = dto.VehicleNumber,
                VehicleMake = dto.VehicleMake,
                VehicleModel = dto.VehicleModel,
                VehicleYear = dto.VehicleYear,
                VehicleType = dto.VehicleType
            }).ToList();

            await _context.Customers.AddRangeAsync(customers);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { inserted = customers.Count }, "Customers inserted successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to insert customers: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("with-orders")]
    public async Task<IActionResult> WithOrders()
    {
        try
        {
            var data = await _context.Customers
                .AsNoTracking()
                .Include(customer => customer.Orders)
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customers with orders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("count")]
    public async Task<IActionResult> Count()
    {
        try
        {
            return Ok(ApiResponse<object>.Ok(new { totalCustomers = await _context.Customers.CountAsync() }));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to count customers: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("full-details")]
    public async Task<IActionResult> FullDetails()
    {
        try
        {
            var data = await _context.Customers
                .AsNoTracking()
                .Include(customer => customer.Orders)
                    .ThenInclude(order => order.OrderItems)
                        .ThenInclude(orderItem => orderItem.Product)
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customer details: {ex.Message}"));
        }
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
            VehicleYear = customer.VehicleYear,
            VehicleType = customer.VehicleType
        };
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
        return int.TryParse(value, out var parsed) ? parsed : null;
    }
}