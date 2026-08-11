namespace HeaL.API.Models.Entities
{
    public class OrderDetail
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int? ProductSizeId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SizeName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
        public bool IsComboItem { get; set; } = false;
        public int? ComboId { get; set; }
        public decimal? OriginalPrice { get; set; }

        public Order Order { get; set; } = null!;
        public ProductSize? ProductSize { get; set; }
    }
}