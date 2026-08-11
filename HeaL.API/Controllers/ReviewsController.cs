using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HeaL.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsByProduct(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDetailDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    ProductId = r.ProductId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    User = new ReviewUserDto { FullName = r.User.FullName }
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("my-reviews")]
        public async Task<IActionResult> GetMyReviews()
        {
            var userId = GetUserId();

            var reviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDetailDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    ProductId = r.ProductId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    User = new ReviewUserDto { FullName = r.User.FullName }
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto dto)
        {
            if (dto.ProductId <= 0)
                return BadRequest(new { message = "ProductId không hợp lệ" });

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "Rating phải từ 1 đến 5" });

            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            var userId = GetUserId();
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == dto.ProductId);

            if (existingReview != null)
                return BadRequest(new { message = "Bạn đã đánh giá sản phẩm này rồi" });

            var review = new Review
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new ReviewDetailDto
            {
                Id = review.Id,
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                User = new ReviewUserDto { FullName = User.Identity?.Name ?? "User" }
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] ReviewUpdateDto dto)
        {
            var userId = GetUserId();
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (review == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "Rating phải từ 1 đến 5" });

            review.Rating = dto.Rating;
            review.Comment = dto.Comment.Trim();
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật đánh giá thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = GetUserId();
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (review == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa đánh giá thành công" });
        }

        [HttpGet("all")]
[AllowAnonymous]
public async Task<IActionResult> GetAllReviews([FromQuery] int limit = 6)
{
    var reviews = await _context.Reviews
        .Include(r => r.User)
        .Include(r => r.Product)
        .Where(r => r.Comment != null && r.Comment.Length > 0)
        .OrderByDescending(r => r.CreatedAt)
        .Take(limit)
        .Select(r => new
        {
            r.Id,
            r.Rating,
            r.Comment,
            r.CreatedAt,
            UserName = r.User.FullName,
            ProductName = r.Product.Name
        })
        .ToListAsync();

    return Ok(reviews);
}
    }
}
