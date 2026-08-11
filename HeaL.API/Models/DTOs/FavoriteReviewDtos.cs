namespace HeaL.API.Models.DTOs
{
    public class FavoriteCreateDto
    {
        public int ProductId { get; set; }
    }

    public class FavoriteItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public DateTime CreatedAt { get; set; }
        public FavoriteProductSummaryDto Product { get; set; } = new();
    }

    public class FavoriteProductSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Image { get; set; }
        public string? Ingredients { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsBestSeller { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public List<ProductSizeDto> Sizes { get; set; } = new();
    }

    public class ReviewCreateDto
    {
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ReviewUpdateDto
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ReviewDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ReviewUserDto? User { get; set; }
    }

    public class ReviewUserDto
    {
        public string FullName { get; set; } = string.Empty;
    }
}
