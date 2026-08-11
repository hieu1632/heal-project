namespace HeaL.API.Models.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; } // Giá thấp nhất (cho hiển thị nhanh), nhưng chi tiết sẽ lấy từ ProductSizes
        public int CategoryId { get; set; }
        public string? Image { get; set; }
        public string? Ingredients { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsBestSeller { get; set; } = false;
        public int Views { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public Category Category { get; set; } = null!;
        public ICollection<ProductSize> ProductSizes { get; set; } = new List<ProductSize>();
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
        public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    }
}