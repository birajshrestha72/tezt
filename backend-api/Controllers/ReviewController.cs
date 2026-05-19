using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var reviews = await _context.Reviews
                .AsNoTracking()
                .Include(review => review.Customer)
                .ToListAsync();

            var mappedReviews = reviews
                .OrderByDescending(review => review.CreatedAt)
                .Select(MapReview)
                .ToList();

            return Ok(ApiResponse<object>.Ok(mappedReviews));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load reviews: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateReviewDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid review data."));
            }

            var review = new Review
            {
                CustomerId = dto.CustomerId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var created = await _context.Reviews
                .AsNoTracking()
                .Include(item => item.Customer)
                .FirstAsync(item => item.Id == review.Id);

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(MapReview(created), "Review submitted successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to create review: {ex.Message}"));
        }
    }

    private static ReviewDto MapReview(Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            CustomerId = review.CustomerId,
            CustomerName = $"{review.Customer.FirstName} {review.Customer.LastName}".Trim(),
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}