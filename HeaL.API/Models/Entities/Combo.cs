using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.Entities
{
    public class Combo
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public decimal? Price { get; set; }

        public decimal? DiscountPercent { get; set; } // ✅ Bỏ [Precision]

        public string? Image { get; set; }

        [Required, MaxLength(20)]
        public string Type { get; set; } = "Product";

        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<ComboItem> ComboItems { get; set; } = new List<ComboItem>();
    }
}