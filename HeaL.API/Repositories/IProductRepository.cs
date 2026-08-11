using HeaL.API.Models.Entities;

namespace HeaL.API.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetProductsAsync(int? categoryId, string? search, string? sortBy, bool? isAvailable);
        Task<Product?> GetProductByIdAsync(int id);
        Task<Product> AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(int id);
        Task<IEnumerable<Product>> GetBestSellersAsync(int count);
        Task<bool> ProductExistsAsync(int id);
        Task<ProductSize?> GetProductSizeByIdAsync(int id);
    }
}