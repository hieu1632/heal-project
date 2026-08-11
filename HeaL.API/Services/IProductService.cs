using HeaL.API.Models.DTOs;

namespace HeaL.API.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetProductsAsync(int? categoryId, string? search, string? sortBy, bool? isAvailable);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(ProductCreateDto dto);
        Task UpdateProductAsync(int id, ProductUpdateDto dto);
        Task DeleteProductAsync(int id);
        Task<IEnumerable<ProductDto>> GetBestSellersAsync(int count);
    }
}