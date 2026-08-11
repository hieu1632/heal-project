using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.DTOs
{
    public class ComboDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? Image { get; set; }
        public string Type { get; set; } = "Product";
        public bool IsActive { get; set; }
        public List<ComboItemDto> Items { get; set; } = new();
        public decimal OriginalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
    }

    public class ComboItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int? ProductSizeId { get; set; }
        public string? SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public bool IsFreebie { get; set; }
        public string? Note { get; set; }
    }

    public class ComboCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? Image { get; set; }
        public string Type { get; set; } = "Product";
        public bool IsActive { get; set; } = true;
        public List<ComboItemCreateDto> Items { get; set; } = new();
    }

    public class ComboItemCreateDto
    {
        [Required]
        public int ProductId { get; set; }
        public int? ProductSizeId { get; set; }
        public int Quantity { get; set; } = 1;
        public bool IsFreebie { get; set; } = false;
        public string? Note { get; set; }
    }

    public class ComboUpdateDto : ComboCreateDto { }
}