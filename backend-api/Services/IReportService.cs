public interface IReportService
{
    Task<object> GetFinancialReport(string period, DateTime? date);
    Task<object> GetCreditReminderReport();
    Task<object> GetTopSpenders();
    Task<object> GetRegularCustomers();
    Task<object> GetPendingCreditCustomers();
}