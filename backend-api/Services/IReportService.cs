public interface IReportService
{
    Task<object> GetFinancialReport();
    Task<object> GetCreditReminderReport();
}