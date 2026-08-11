namespace HeaL.API.Models.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; } // Giá thấp nhất
        public string? Image { get; set; }
        public string? Ingredients { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsBestSeller { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<ProductSizeDto> Sizes { get; set; } = new();
        public List<ReviewDto>? Reviews { get; set; }
    }

    public class ProductSizeDto
    {
        public int Id { get; set; }
        public string SizeName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public bool IsAvailable { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ReviewDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}