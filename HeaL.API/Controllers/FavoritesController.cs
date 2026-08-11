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
    public class FavoritesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = GetUserId();

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Product)
                    .ThenInclude(p => p.Category)
                .Include(f => f.Product)
                    .ThenInclude(p => p.ProductSizes)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FavoriteItemDto
                {
                    Id = f.Id,
                    ProductId = f.ProductId,
                    CreatedAt = f.CreatedAt,
                    Product = new FavoriteProductSummaryDto
                    {
                        Id = f.Product.Id,
                        Name = f.Product.Name,
                        Description = f.Product.Description,
                        Price = f.Product.Price,
                        Image = f.Product.Image,
                        Ingredients = f.Product.Ingredients,
                        IsAvailable = f.Product.IsAvailable,
                        IsBestSeller = f.Product.IsBestSeller,
                        CategoryId = f.Product.CategoryId,
                        CategoryName = f.Product.Category.Name,
                        Sizes = f.Product.ProductSizes.Select(ps => new ProductSizeDto
                        {
                            Id = ps.Id,
                            SizeName = ps.SizeName,
                            Price = ps.Price,
                            Stock = ps.Stock,
                            IsAvailable = ps.IsAvailable,
                            DisplayOrder = ps.DisplayOrder
                        }).OrderBy(ps => ps.DisplayOrder).ToList()
                    }
                })
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] FavoriteCreateDto dto)
        {
            var userId = GetUserId();
            if (dto.ProductId <= 0)
                return BadRequest(new { message = "ProductId không hợp lệ" });

            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            var exists = await _context.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == dto.ProductId);
            if (exists)
                return Ok(new { message = "Sản phẩm đã có trong danh sách yêu thích" });

            var favorite = new Favorite
            {
                UserId = userId,
                ProductId = dto.ProductId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thêm vào yêu thích", id = favorite.Id });
        }

        [HttpDelete("{productId}")]
        public async Task<IActionResult> RemoveFavorite(int productId)
        {
            var userId = GetUserId();

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);

            if (favorite == null)
                return NotFound(new { message = "Sản phẩm không có trong danh sách yêu thích" });

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa khỏi yêu thích" });
        }

        [HttpGet("check/{productId}")]
        public async Task<IActionResult> CheckFavorite(int productId)
        {
            var userId = GetUserId();
            var isFavorite = await _context.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId);
            return Ok(new { isFavorite });
        }
    }
}
