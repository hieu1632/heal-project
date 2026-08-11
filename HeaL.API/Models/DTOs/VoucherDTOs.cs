using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.DTOs
{
    public class VoucherDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal? MaxDiscount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int Quantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class VoucherCreateDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0, 100)]
        public decimal DiscountPercent { get; set; }

        public decimal? MaxDiscount { get; set; }
        public decimal? MinOrderValue { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }

    public class VoucherUpdateDto : VoucherCreateDto
    {
    }

    public class VoucherValidationResponseDto
    {
        public bool IsValid { get; set; }
        public decimal DiscountAmount { get; set; }
        public string Message { get; set; } = string.Empty;
        public VoucherDto? Voucher { get; set; }
    }
}
