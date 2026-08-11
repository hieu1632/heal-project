namespace HeaL.API.Models.Entities
{
    public class Banner
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string Image { get; set; } = string.Empty;
        public string? Link { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}