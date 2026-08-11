namespace HeaL.API.Models.Entities
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? ProductSizeId { get; set; }
        public int? ComboId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal Price { get; set; } // Giá combo hoặc giá sản phẩm
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public User User { get; set; } = null!;
        public ProductSize? ProductSize { get; set; }
        public Combo? Combo { get; set; }
    }
}