namespace HeaL.API.Models.Entities
{
    public class ProductSize
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string SizeName { get; set; } = string.Empty; // S, M, L, XL
        public decimal Price { get; set; }
        public int Stock { get; set; } = 0;
        public bool IsAvailable { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        public Product Product { get; set; } = null!;
        public ICollection<Cart> Carts { get; set; } = new List<Cart>();
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}