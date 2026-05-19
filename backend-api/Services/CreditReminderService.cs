using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

public class CreditReminderService
{
    private const int DefaultCreditTermDays = 30;

    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly EmailService _emailService;

    public CreditReminderService(AppDbContext context, NotificationService notificationService, EmailService emailService)
    {
        _context = context;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task<List<CreditReminderDetailDto>> GetOverdueCredits()
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.OrderItems)
                .ThenInclude(orderItem => orderItem.Product)
            .Where(order => order.Status != "Paid")
            .ToListAsync();

        var now = DateTime.UtcNow;

        return orders
            .Select(BuildReminderDetail)
            .Where(reminder => reminder.DueDate < now && reminder.OutstandingAmount > 0m)
            .OrderByDescending(reminder => reminder.OverdueDays)
            .ThenByDescending(reminder => reminder.OutstandingAmount)
            .ToList();
    }

    public async Task<CreditReminderSummaryDto> GetSummary()
    {
        var reminders = await GetOverdueCredits();

        return new CreditReminderSummaryDto
        {
            OverdueOrders = reminders.Count,
            OverdueCustomers = reminders.Select(reminder => reminder.CustomerId).Distinct().Count(),
            TotalOutstandingAmount = reminders.Sum(reminder => reminder.OutstandingAmount),
            Reminders = reminders
        };
    }

    public async Task<CreditReminderDetailDto?> GetPreview(int orderId)
    {
        var reminder = await GetOverdueCredits();
        return reminder.FirstOrDefault(item => item.OrderId == orderId);
    }

    public async Task<GenerateCreditReminderResultDto> GenerateReminders()
    {
        var reminders = await GetOverdueCredits();
        var generatedNotifications = 0;

        foreach (var reminder in reminders)
        {
            if (await _notificationService.ReferenceKeyExists(reminder.ReferenceKey))
            {
                continue;
            }

            await _notificationService.Add(
                reminder.Body,
                reminder.NotificationType,
                reminder.ReferenceKey,
                reminder.PayloadJson);

            try
            {
                await _emailService.SendCreditReminderEmail(
                    reminder.CustomerEmail,
                    reminder.CustomerName,
                    reminder.OrderId,
                    reminder.OutstandingAmount,
                    reminder.OverdueDays);
            }
            catch
            {
                // Email delivery is best-effort; notification creation remains the primary action.
            }

            generatedNotifications++;
        }

        return new GenerateCreditReminderResultDto
        {
            ScannedOrders = reminders.Count,
            GeneratedNotifications = generatedNotifications,
            Reminders = reminders
        };
    }

    public async Task SendReminderEmail(CreditReminderDetailDto reminder)
    {
        var subject = $"Payment Reminder: Outstanding Balance of {reminder.OutstandingAmount:C}";
        var body = $@"Dear {reminder.CustomerName},

This is a reminder that your payment of {reminder.OutstandingAmount:C} was due on
{reminder.DueDate:MMMM dd, yyyy} ({reminder.OverdueDays} days ago).

Please settle your outstanding balance at your earliest convenience.

Thank you,
Vehicle Parts Service Center";

        await _emailService.SendCreditReminderEmail(reminder.CustomerEmail, reminder.CustomerName, reminder.OrderId, reminder.OutstandingAmount, reminder.OverdueDays);

        // Log notification
        await _notificationService.Add(
            $"Credit reminder sent to {reminder.CustomerName} for order #{reminder.OrderId} ({reminder.OutstandingAmount:C} overdue).",
            "CreditReminder",
            reminder.ReferenceKey,
            reminder.PayloadJson);
    }

    private static CreditReminderDetailDto BuildReminderDetail(Order order)
    {
        var orderTotal = order.OrderItems.Sum(orderItem => orderItem.Quantity * orderItem.UnitPrice);
        var effectiveDueDate = order.CreditDueDate ?? order.OrderDate.AddDays(DefaultCreditTermDays);
        var overdueDays = Math.Max(0, (DateTime.UtcNow.Date - effectiveDueDate.Date).Days);
        var outstandingAmount = Math.Max(orderTotal - order.AmountPaid, 0m);
        var customerName = string.Join(" ", new[] { order.Customer.FirstName, order.Customer.LastName }.Where(name => !string.IsNullOrWhiteSpace(name)));
        var subject = $"Credit reminder for order #{order.Id}";
        var body = $"Dear {customerName}, your order #{order.Id} is overdue by {overdueDays} day(s). Outstanding balance: {outstandingAmount:C}. Please settle the balance as soon as possible.";
        var payload = new
        {
            orderId = order.Id,
            customerId = order.CustomerId,
            customerName,
            customerEmail = order.Customer.Email,
            orderDate = order.OrderDate,
            dueDate = effectiveDueDate,
            overdueDays,
            orderTotal,
            amountPaid = order.AmountPaid,
            outstandingAmount,
            status = order.Status,
            subject,
            body
        };

        return new CreditReminderDetailDto
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = customerName,
            CustomerEmail = order.Customer.Email,
            OrderDate = order.OrderDate,
            DueDate = effectiveDueDate,
            OverdueDays = overdueDays,
            OrderTotal = orderTotal,
            AmountPaid = order.AmountPaid,
            OutstandingAmount = outstandingAmount,
            Status = order.Status,
            Subject = subject,
            Body = body,
            ReferenceKey = $"credit-reminder:order:{order.Id}",
            NotificationType = "CreditReminder",
            PayloadJson = JsonSerializer.Serialize(payload)
        };
    }
}