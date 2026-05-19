using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using VehiclePartsAPI.DTOs;

public class EmailService
{
    private readonly SmtpOptions _smtpOptions;

    public EmailService(IOptions<SmtpOptions> smtpOptions)
    {
        _smtpOptions = smtpOptions.Value;
    }

    /// <summary>
    /// Sends an invoice email to the customer with an order summary.
    /// </summary>
    public async Task SendInvoiceEmail(string toEmail, string customerName, int orderId, decimal total, decimal discount, List<InvoiceLineItemDto> items)
    {
        await SendHtmlEmail(
            toEmail,
            $"Invoice for order #{orderId}",
            BuildInvoiceBody(customerName, orderId, total, discount, items));
    }

    /// <summary>
    /// Sends a credit reminder email for an overdue order.
    /// </summary>
    public async Task SendCreditReminderEmail(string toEmail, string customerName, int orderId, decimal outstanding, int overdueDays)
    {
        await SendHtmlEmail(
            toEmail,
            $"Credit reminder for order #{orderId}",
            $"<p>Dear {customerName},</p><p>Your order <strong>#{orderId}</strong> is overdue by <strong>{overdueDays}</strong> day(s).</p><p>Outstanding balance: <strong>{outstanding:C}</strong>.</p><p>Please settle the balance as soon as possible.</p>");
    }

    private async Task SendHtmlEmail(string toEmail, string subject, string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(_smtpOptions.Host) ||
            string.IsNullOrWhiteSpace(_smtpOptions.User) ||
            string.IsNullOrWhiteSpace(_smtpOptions.Password) ||
            string.IsNullOrWhiteSpace(_smtpOptions.FromAddress))
        {
            Console.WriteLine("[EmailService] SMTP not configured. Email skipped.");
            return; // gracefully skip
        }

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(_smtpOptions.FromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(_smtpOptions.Host, _smtpOptions.Port, SecureSocketOptions.StartTls);

        if (!string.IsNullOrWhiteSpace(_smtpOptions.User))
        {
            await client.AuthenticateAsync(_smtpOptions.User, _smtpOptions.Password);
        }

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string BuildInvoiceBody(string customerName, int orderId, decimal total, decimal discount, List<InvoiceLineItemDto> items)
    {
        var rows = string.Join(string.Empty, items.Select(item => $"<tr><td>{item.ProductName}</td><td>{item.Quantity}</td><td>{item.UnitPrice:C}</td><td>{item.LineTotal:C}</td></tr>"));
        return $"<h2>Invoice Summary</h2><p>Dear {customerName},</p><p>Order #{orderId}</p><table border='1' cellpadding='8' cellspacing='0'><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>{rows}</tbody></table><p>Discount: {discount:C}</p><p><strong>Total: {total:C}</strong></p>";
    }
}