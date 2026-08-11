using HeaL.API.Models.Entities;

namespace HeaL.API.Services
{
    public class VoucherValidationResult
    {
        public decimal DiscountAmount { get; set; }
        public Voucher Voucher { get; set; } = null!;
    }

    public interface IVoucherService
    {
        Task<VoucherValidationResult?> ValidateAndApplyVoucherAsync(string voucherCode, int userId, decimal orderTotal);
        Task MarkVoucherAsUsedAsync(int voucherId, int userId);
    }
}
