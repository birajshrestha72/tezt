namespace VehiclePartsAPI.DTOs;

public class CreditReminderDetailDto
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime DueDate { get; set; }
    public int OverdueDays { get; set; }
    public decimal OrderTotal { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal OutstandingAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string ReferenceKey { get; set; } = string.Empty;
    public string NotificationType { get; set; } = "CreditReminder";
    public string? PayloadJson { get; set; }
}

public class CreditReminderSummaryDto
{
    public int OverdueOrders { get; set; }
    public int OverdueCustomers { get; set; }
    public decimal TotalOutstandingAmount { get; set; }
    public List<CreditReminderDetailDto> Reminders { get; set; } = new();
}

public class GenerateCreditReminderResultDto
{
    public int ScannedOrders { get; set; }
    public int GeneratedNotifications { get; set; }
    public List<CreditReminderDetailDto> Reminders { get; set; } = new();
}