using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;
    public CustomersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var customers = await _context.Customers
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Email = c.Email,
                Phone = c.Phone
            })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(customers));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound(ApiResponse<object>.Fail("Customer not found."));

        return Ok(ApiResponse<object>.Ok(new CustomerDto
        {
            Id = customer.Id,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            Phone = customer.Phone
        }));
    }

    [HttpGet("{id:int}/orders")]
    public async Task<IActionResult> GetOrders(int id)
    {
        var exists = await _context.Customers.AnyAsync(c => c.Id == id);
        if (!exists) return NotFound(ApiResponse<object>.Fail("Customer not found."));

        var orders = await _context.Orders.Where(o => o.CustomerId == id).ToListAsync();
        return Ok(ApiResponse<object>.Ok(orders));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, ApiResponse<object>.Ok(new CustomerDto
        {
            Id = customer.Id,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            Phone = customer.Phone
        }, "Customer created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound(ApiResponse<object>.Fail("Customer not found."));

        customer.FirstName = dto.FirstName;
        customer.LastName = dto.LastName;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { updated = id }, "Customer updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null) return NotFound(ApiResponse<object>.Fail("Customer not found."));

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Customer deleted successfully."));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateCustomerDto> dtos)
    {
        var customers = dtos.Select(dto => new Customer
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone
        }).ToList();

        await _context.Customers.AddRangeAsync(customers);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { inserted = customers.Count }, "Customers inserted successfully."));
    }

    [HttpGet("with-orders")]
    public async Task<IActionResult> WithOrders()
    {
        var data = await _context.Customers
            .Include(c => c.Orders)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("count")]
    public async Task<IActionResult> Count()
        => Ok(ApiResponse<object>.Ok(new { totalCustomers = await _context.Customers.CountAsync() }));

    [HttpGet("full-details")]
    public async Task<IActionResult> FullDetails()
    {
        var data = await _context.Customers
            .Include(c => c.Orders)
                .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data));
    }
}