namespace HeaL.API.Models.Entities
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal DiscountPercent { get; set; } // Ví dụ 10.00 tức 10%
        public decimal? MaxDiscount { get; set; } // Giảm tối đa
        public decimal? MinOrderValue { get; set; } // Đơn hàng tối thiểu
        public DateTime ExpiryDate { get; set; }
        public int Quantity { get; set; } // Số lượng voucher có sẵn
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}