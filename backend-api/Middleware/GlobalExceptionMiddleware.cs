using System.Net;
using VehiclePartsAPI.DTOs;

namespace VehiclePartsAPI.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = HttpStatusCode.InternalServerError.GetHashCode();

        var response = exception switch
        {
            ArgumentNullException => ApiResponse<object>.Fail("A required argument was null."),
            ArgumentException => ApiResponse<object>.Fail("Invalid argument provided."),
            KeyNotFoundException => ApiResponse<object>.Fail("The requested resource was not found."),
            UnauthorizedAccessException => ApiResponse<object>.Fail("You are not authorized to perform this action."),
            InvalidOperationException => ApiResponse<object>.Fail("An invalid operation was attempted."),
            _ => ApiResponse<object>.Fail("An error occurred processing your request. Please try again.")
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}
