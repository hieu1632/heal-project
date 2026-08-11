using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.DTOs
{
    public class ProductCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public int CategoryId { get; set; }
        public string? Image { get; set; }
        public string? Ingredients { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsBestSeller { get; set; } = false;
        public List<ProductSizeCreateDto> Sizes { get; set; } = new();
    }

    public class ProductSizeCreateDto
    {
        [Required]
        public string SizeName { get; set; } = string.Empty;
        [Required]
        public decimal Price { get; set; }
        public int Stock { get; set; } = 0;
        public bool IsAvailable { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
    }

    public class ProductUpdateDto : ProductCreateDto
    {
    }
}