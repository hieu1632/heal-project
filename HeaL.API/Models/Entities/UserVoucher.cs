namespace HeaL.API.Models.Entities
{
    public class UserVoucher
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime? UsedDate { get; set; }
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Voucher Voucher { get; set; } = null!;
    }
}