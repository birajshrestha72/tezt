public class Order
{
   public int Id { get; set; }
   public DateTime OrderDate { get; set; }
   public DateTime? CreditDueDate { get; set; }
   public decimal AmountPaid { get; set; } = 0m;
   public decimal DiscountAmount { get; set; } = 0m;
   public bool LoyaltyDiscountApplied { get; set; } = false;
   public string Status { get; set; } = string.Empty;  // Pending, Paid, Shipped, Cancelled

   // Many Orders belong to one Customer (M-to-1)
   public int CustomerId { get; set; }
   public Customer Customer { get; set; } = null!;

   // One Order has many OrderItems (1-to-M)
   public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
