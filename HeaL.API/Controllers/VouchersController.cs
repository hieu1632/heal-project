using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VouchersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VouchersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private static VoucherDto MapToDto(Voucher voucher)
        {
            return new VoucherDto
            {
                Id = voucher.Id,
                Code = voucher.Code,
                Description = voucher.Description,
                DiscountPercent = voucher.DiscountPercent,
                MaxDiscount = voucher.MaxDiscount,
                MinOrderValue = voucher.MinOrderValue,
                ExpiryDate = voucher.ExpiryDate,
                Quantity = voucher.Quantity,
                IsActive = voucher.IsActive,
                CreatedAt = voucher.CreatedAt
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vouchers = await _context.Vouchers
                .OrderByDescending(v => v.CreatedAt)
                .Select(v => new VoucherDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    Description = v.Description,
                    DiscountPercent = v.DiscountPercent,
                    MaxDiscount = v.MaxDiscount,
                    MinOrderValue = v.MinOrderValue,
                    ExpiryDate = v.ExpiryDate,
                    Quantity = v.Quantity,
                    IsActive = v.IsActive,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();

            return Ok(vouchers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id);
            if (voucher == null)
                return NotFound(new { message = "Voucher không tồn tại" });

            return Ok(MapToDto(voucher));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] VoucherCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest(new { message = "Mã voucher không được để trống" });

            if (dto.DiscountPercent < 0 || dto.DiscountPercent > 100)
                return BadRequest(new { message = "Giảm giá phải nằm trong khoảng 0-100%" });

            if (dto.Quantity < 0)
                return BadRequest(new { message = "Số lượng voucher không hợp lệ" });

            var normalizedCode = dto.Code.Trim();
            if (await _context.Vouchers.AnyAsync(v => v.Code == normalizedCode))
                return Conflict(new { message = "Mã voucher đã tồn tại" });

            var voucher = new Voucher
            {
                Code = normalizedCode,
                Description = dto.Description,
                DiscountPercent = dto.DiscountPercent,
                MaxDiscount = dto.MaxDiscount,
                MinOrderValue = dto.MinOrderValue,
                ExpiryDate = dto.ExpiryDate,
                Quantity = dto.Quantity,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return Ok(MapToDto(voucher));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VoucherUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest(new { message = "Mã voucher không được để trống" });

            if (dto.DiscountPercent < 0 || dto.DiscountPercent > 100)
                return BadRequest(new { message = "Giảm giá phải nằm trong khoảng 0-100%" });

            if (dto.Quantity < 0)
                return BadRequest(new { message = "Số lượng voucher không hợp lệ" });

            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id);
            if (voucher == null)
                return NotFound(new { message = "Voucher không tồn tại" });

            var normalizedCode = dto.Code.Trim();
            var duplicate = await _context.Vouchers.AnyAsync(v => v.Id != id && v.Code == normalizedCode);
            if (duplicate)
                return Conflict(new { message = "Mã voucher đã tồn tại" });

            voucher.Code = normalizedCode;
            voucher.Description = dto.Description;
            voucher.DiscountPercent = dto.DiscountPercent;
            voucher.MaxDiscount = dto.MaxDiscount;
            voucher.MinOrderValue = dto.MinOrderValue;
            voucher.ExpiryDate = dto.ExpiryDate;
            voucher.Quantity = dto.Quantity;
            voucher.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(MapToDto(voucher));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Id == id);
            if (voucher == null)
                return NotFound(new { message = "Voucher không tồn tại" });

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa voucher thành công" });
        }

        [HttpGet("validate")]
        public async Task<IActionResult> Validate([FromQuery] string code, [FromQuery] decimal total)
        {
            if (string.IsNullOrWhiteSpace(code))
                return Ok(new VoucherValidationResponseDto { IsValid = false, DiscountAmount = 0, Message = "Mã voucher không hợp lệ" });

            var normalizedCode = code.Trim();
            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.Code == normalizedCode && v.IsActive);

            if (voucher == null)
                return Ok(new VoucherValidationResponseDto { IsValid = false, DiscountAmount = 0, Message = "Voucher không tồn tại hoặc đã bị vô hiệu hóa" });

            if (voucher.ExpiryDate < DateTime.UtcNow)
                return Ok(new VoucherValidationResponseDto { IsValid = false, DiscountAmount = 0, Message = "Voucher đã hết hạn" });

            if (voucher.Quantity <= 0)
                return Ok(new VoucherValidationResponseDto { IsValid = false, DiscountAmount = 0, Message = "Voucher đã hết số lượng" });

            if (voucher.MinOrderValue.HasValue && total < voucher.MinOrderValue.Value)
                return Ok(new VoucherValidationResponseDto { IsValid = false, DiscountAmount = 0, Message = $"Đơn hàng tối thiểu {voucher.MinOrderValue.Value:N0}đ" });

            decimal discountAmount = total * voucher.DiscountPercent / 100m;
            if (voucher.MaxDiscount.HasValue)
                discountAmount = Math.Min(discountAmount, voucher.MaxDiscount.Value);

            return Ok(new VoucherValidationResponseDto
            {
                IsValid = true,
                DiscountAmount = discountAmount,
                Message = "Áp dụng voucher thành công",
                Voucher = MapToDto(voucher)
            });
        }
    }
}
