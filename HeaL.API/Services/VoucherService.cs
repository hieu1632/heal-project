using HeaL.API.Data;
using HeaL.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly ApplicationDbContext _context;

        public VoucherService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<VoucherValidationResult?> ValidateAndApplyVoucherAsync(string voucherCode, int userId, decimal orderTotal)
        {
            var normalizedCode = voucherCode.Trim();
            if (string.IsNullOrWhiteSpace(normalizedCode))
                return null;

            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.Code == normalizedCode && v.IsActive);

            if (voucher == null)
                return null;

            if (voucher.ExpiryDate < DateTime.UtcNow)
                return null;

            if (voucher.Quantity <= 0)
                return null;

            if (voucher.MinOrderValue.HasValue && orderTotal < voucher.MinOrderValue.Value)
                return null;

            var hasUsed = await _context.UserVouchers
                .AnyAsync(uv => uv.UserId == userId && uv.VoucherId == voucher.Id && uv.IsUsed);

            if (hasUsed)
                return null;

            decimal discountAmount = orderTotal * voucher.DiscountPercent / 100m;
            if (voucher.MaxDiscount.HasValue)
                discountAmount = Math.Min(discountAmount, voucher.MaxDiscount.Value);

            return new VoucherValidationResult
            {
                DiscountAmount = discountAmount,
                Voucher = voucher
            };
        }

        public async Task MarkVoucherAsUsedAsync(int voucherId, int userId)
        {
            var userVoucher = await _context.UserVouchers
                .FirstOrDefaultAsync(uv => uv.UserId == userId && uv.VoucherId == voucherId);

            if (userVoucher == null)
            {
                _context.UserVouchers.Add(new UserVoucher
                {
                    UserId = userId,
                    VoucherId = voucherId,
                    IsUsed = true,
                    UsedDate = DateTime.UtcNow,
                    AssignedDate = DateTime.UtcNow
                });
            }
            else
            {
                userVoucher.IsUsed = true;
                userVoucher.UsedDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
    }
}
