using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.DTOs
{
    public class OrderCreateDto
    {
        [Required]
        public string Address { get; set; } = string.Empty;

        [Required, Phone]
        public string Phone { get; set; } = string.Empty;

        public string? Note { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = "COD";

        public string? VoucherCode { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal OriginalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? VoucherCode { get; set; }
        public UserProfileDto? User { get; set; }  // ✅ Dùng UserProfileDto
        public List<OrderDetailDto> OrderDetails { get; set; } = new();
    }

    public class OrderDetailDto
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SizeName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
        public bool IsComboItem { get; set; }
        public int? ComboId { get; set; }
        public decimal? OriginalPrice { get; set; }
    }

    public class OrderStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}