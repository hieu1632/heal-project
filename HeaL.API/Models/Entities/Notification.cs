using System.ComponentModel.DataAnnotations;

namespace HeaL.API.Models.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        [Required, MaxLength(500)]
        public string Content { get; set; } = string.Empty;
        [Required, MaxLength(20)]
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public string? Data { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}