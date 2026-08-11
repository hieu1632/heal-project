namespace HeaL.API.Models.Entities
{
    public class ComboItem
    {
        public int Id { get; set; }
        public int ComboId { get; set; }
        public int ProductId { get; set; }
        public int? ProductSizeId { get; set; }
        public int Quantity { get; set; } = 1;
        public bool IsRequired { get; set; } = true;
        public bool IsFreebie { get; set; } = false;
        public int? MaxQuantity { get; set; }
        public string? Note { get; set; }

        public Combo Combo { get; set; } = null!;
        public Product Product { get; set; } = null!;
        public ProductSize? ProductSize { get; set; }
    }
}