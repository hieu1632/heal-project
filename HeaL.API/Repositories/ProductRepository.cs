using HeaL.API.Data;
using HeaL.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(int? categoryId, string? search, string? sortBy, bool? isAvailable)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes.OrderBy(ps => ps.DisplayOrder))
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (isAvailable.HasValue)
                query = query.Where(p => p.IsAvailable == isAvailable.Value);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.Name.Contains(search) || (p.Description != null && p.Description.Contains(search)));

            query = sortBy?.ToLower() switch
            {
                "price" => query.OrderBy(p => p.ProductSizes.Min(ps => ps.Price)),
                "price_desc" => query.OrderByDescending(p => p.ProductSizes.Min(ps => ps.Price)),
                "bestseller" => query.OrderByDescending(p => p.IsBestSeller),
                _ => query.OrderByDescending(p => p.CreatedAt)
            };

            return await query.ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes.OrderBy(ps => ps.DisplayOrder))
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> AddAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Product>> GetBestSellersAsync(int count)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes.OrderBy(ps => ps.DisplayOrder))
                .Where(p => p.IsBestSeller && p.IsAvailable)
                .OrderByDescending(p => p.Views)
                .Take(count)
                .ToListAsync();
        }

        public async Task<bool> ProductExistsAsync(int id)
        {
            return await _context.Products.AnyAsync(p => p.Id == id);
        }

        public async Task<ProductSize?> GetProductSizeByIdAsync(int id)
{
    return await _context.ProductSizes
        .Include(ps => ps.Product)
        .FirstOrDefaultAsync(ps => ps.Id == id);
}
    }
}