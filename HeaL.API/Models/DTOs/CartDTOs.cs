using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.DTOs
{
    // -------- Sản phẩm thường --------
    public class AddToCartDto
    {
        [Required]
        public int ProductSizeId { get; set; }
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;
    }

    // -------- Combo --------
    public class AddComboDto
    {
        [Required]
        public int ComboId { get; set; }
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;
    }

    // -------- Response --------
    public class CartResponseDto
    {
        public List<CartItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public int TotalItems { get; set; }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = "Product";
        public int? ProductSizeId { get; set; }
        public string? SizeName { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Total => Price * Quantity;
        public string? Image { get; set; }
        public bool IsCombo { get; set; }
        public decimal? OriginalPrice { get; set; }
        public List<CartComboItemDto>? ComboItems { get; set; } // Đổi tên
    }

    // Đổi tên từ ComboItemDto -> CartComboItemDto để tránh conflict
    public class CartComboItemDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string? SizeName { get; set; }
        public int Quantity { get; set; }
        public bool IsFreebie { get; set; }
    }

    // -------- Cập nhật số lượng --------
    public class UpdateCartDto
    {
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}