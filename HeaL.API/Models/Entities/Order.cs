using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public decimal OriginalAmount { get; set; } = 0; // Giá gốc (trước combo)
        public decimal DiscountAmount { get; set; } = 0; // Giảm từ voucher
        public decimal FinalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string PaymentMethod { get; set; } = "COD";
        public int? VoucherId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public User User { get; set; } = null!;
        public Voucher? Voucher { get; set; }
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}