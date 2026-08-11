using AutoMapper;
using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using HeaL.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public ProductService(IProductRepository productRepository, IMapper mapper, ApplicationDbContext context)
        {
            _productRepository = productRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetProductsAsync(int? categoryId, string? search, string? sortBy, bool? isAvailable)
        {
            var products = await _productRepository.GetProductsAsync(categoryId, search, sortBy, isAvailable);
            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetProductByIdAsync(id);
            return product == null ? null : _mapper.Map<ProductDto>(product);
        }

        public async Task<ProductDto> CreateProductAsync(ProductCreateDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                Image = dto.Image,
                Ingredients = dto.Ingredients,
                IsAvailable = dto.IsAvailable,
                IsBestSeller = dto.IsBestSeller,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var sizeDto in dto.Sizes)
            {
                product.ProductSizes.Add(new ProductSize
                {
                    SizeName = sizeDto.SizeName,
                    Price = sizeDto.Price,
                    Stock = sizeDto.Stock,
                    IsAvailable = sizeDto.IsAvailable,
                    DisplayOrder = sizeDto.DisplayOrder
                });
            }

            product.Price = dto.Sizes.Any() ? dto.Sizes.Min(s => s.Price) : 0;

            var created = await _productRepository.AddAsync(product);
            return _mapper.Map<ProductDto>(created);
        }

        public async Task UpdateProductAsync(int id, ProductUpdateDto dto)
        {
            var product = await _productRepository.GetProductByIdAsync(id);
            if (product == null)
                throw new KeyNotFoundException($"Product with id {id} not found.");

            // Cập nhật thông tin cơ bản
            product.Name = dto.Name;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.Image = dto.Image;
            product.Ingredients = dto.Ingredients;
            product.IsAvailable = dto.IsAvailable;
            product.IsBestSeller = dto.IsBestSeller;
            product.UpdatedAt = DateTime.UtcNow;

            // Lấy danh sách size cũ
            var existingSizes = product.ProductSizes.ToList();
            
            // Lấy danh sách size mới từ DTO
            var newSizeNames = dto.Sizes.Select(s => s.SizeName).ToList();
            
            // Xóa các size cũ KHÔNG có trong danh sách mới VÀ chưa có trong OrderDetails
            var sizesToRemove = existingSizes
                .Where(s => !newSizeNames.Contains(s.SizeName))
                .ToList();

            foreach (var size in sizesToRemove)
            {
                // Kiểm tra xem size có đang được sử dụng trong OrderDetails không
                var isUsedInOrders = await _context.OrderDetails
                    .AnyAsync(od => od.ProductSizeId == size.Id);
                    
                if (isUsedInOrders)
                {
                    // Nếu đã dùng trong đơn hàng, chỉ đánh dấu IsAvailable = false, không xóa
                    size.IsAvailable = false;
                }
                else
                {
                    // Nếu chưa dùng, xóa bình thường
                    _context.ProductSizes.Remove(size);
                }
            }

            // Thêm các size mới (nếu chưa có)
            foreach (var sizeDto in dto.Sizes)
            {
                var existingSize = existingSizes.FirstOrDefault(s => s.SizeName == sizeDto.SizeName);
                if (existingSize != null)
                {
                    // Cập nhật size hiện có
                    existingSize.Price = sizeDto.Price;
                    existingSize.Stock = sizeDto.Stock;
                    existingSize.IsAvailable = sizeDto.IsAvailable;
                    existingSize.DisplayOrder = sizeDto.DisplayOrder;
                }
                else
                {
                    // Thêm size mới
                    product.ProductSizes.Add(new ProductSize
                    {
                        SizeName = sizeDto.SizeName,
                        Price = sizeDto.Price,
                        Stock = sizeDto.Stock,
                        IsAvailable = sizeDto.IsAvailable,
                        DisplayOrder = sizeDto.DisplayOrder
                    });
                }
            }

            product.Price = dto.Sizes.Any() ? dto.Sizes.Min(s => s.Price) : 0;

            await _productRepository.UpdateAsync(product);
        }

        public async Task DeleteProductAsync(int id)
        {
            await _productRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<ProductDto>> GetBestSellersAsync(int count)
        {
            var products = await _productRepository.GetBestSellersAsync(count);
            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }
    }
}