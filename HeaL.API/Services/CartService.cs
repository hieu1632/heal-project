using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using HeaL.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICartRepository _cartRepository;

        public CartService(ApplicationDbContext context, ICartRepository cartRepository)
        {
            _context = context;
            _cartRepository = cartRepository;
        }

        public async Task<CartResponseDto> GetCartAsync(int userId)
        {
            var items = await _cartRepository.GetCartItemsAsync(userId);
            var itemDtos = new List<CartItemDto>();

            foreach (var cart in items)
            {
                if (cart.ProductSizeId.HasValue && cart.ProductSize != null)
                {
                    var ps = cart.ProductSize;
                    var product = ps.Product;
                    itemDtos.Add(new CartItemDto
                    {
                        Id = cart.Id,
                        Type = "Product",
                        ProductSizeId = ps.Id,
                        ProductName = product.Name,
                        SizeName = ps.SizeName,
                        Price = ps.Price,
                        Quantity = cart.Quantity,
                        Image = product.Image,
                        IsCombo = false
                    });
                }
                else if (cart.ComboId.HasValue && cart.Combo != null)
                {
                    var combo = cart.Combo;
                    // ✅ Sửa: CartComboItemDto thay vì ComboItemDto
                    var comboItems = combo.ComboItems.Select(ci => new CartComboItemDto
                    {
                        ProductName = ci.Product.Name,
                        SizeName = ci.ProductSize?.SizeName,
                        Quantity = ci.Quantity,
                        IsFreebie = ci.IsFreebie
                    }).ToList();

                    var originalPrice = combo.ComboItems.Sum(ci =>
                        (ci.ProductSize?.Price ?? ci.Product.Price) * ci.Quantity
                    );

                    itemDtos.Add(new CartItemDto
                    {
                        Id = cart.Id,
                        Type = "Combo",
                        ProductName = combo.Name,
                        Price = cart.Price,
                        Quantity = cart.Quantity,
                        Image = combo.Image,
                        IsCombo = true,
                        OriginalPrice = originalPrice * cart.Quantity,
                        ComboItems = comboItems
                    });
                }
            }

            return new CartResponseDto
            {
                Items = itemDtos,
                TotalAmount = itemDtos.Sum(i => i.Price * i.Quantity),
                TotalItems = itemDtos.Sum(i => i.Quantity)
            };
        }

        public async Task<CartResponseDto> AddToCartAsync(int userId, AddToCartDto dto)
        {
            var productSize = await _context.ProductSizes.FindAsync(dto.ProductSizeId);
            if (productSize == null)
                throw new KeyNotFoundException("Product size not found");

            var cart = new Cart
            {
                UserId = userId,
                ProductSizeId = dto.ProductSizeId,
                Quantity = dto.Quantity,
                Price = productSize.Price,
                CreatedAt = DateTime.UtcNow
            };

            await _cartRepository.AddOrUpdateCartItemAsync(cart);
            return await GetCartAsync(userId);
        }

        public async Task<CartResponseDto> AddComboToCartAsync(int userId, AddComboDto dto)
        {
            var combo = await _context.Combos
                .Include(c => c.ComboItems)
                .FirstOrDefaultAsync(c => c.Id == dto.ComboId);

            if (combo == null)
                throw new KeyNotFoundException("Combo not found");

            if (!combo.IsActive)
                throw new InvalidOperationException("Combo is not active");

            var cart = new Cart
            {
                UserId = userId,
                ComboId = dto.ComboId,
                Quantity = dto.Quantity,
                Price = combo.Price ?? 0,
                CreatedAt = DateTime.UtcNow
            };

            await _cartRepository.AddOrUpdateCartItemAsync(cart);
            return await GetCartAsync(userId);
        }

        public async Task<CartResponseDto> UpdateCartAsync(int cartId, int userId, UpdateCartDto dto)
        {
            var cart = await _cartRepository.GetCartItemByIdAsync(cartId);
            if (cart == null || cart.UserId != userId)
                throw new KeyNotFoundException("Cart item not found");

            cart.Quantity = dto.Quantity;
            cart.UpdatedAt = DateTime.UtcNow;
            await _cartRepository.UpdateAsync(cart);

            return await GetCartAsync(userId);
        }

        public async Task<CartResponseDto> RemoveFromCartAsync(int cartId, int userId)
        {
            var cart = await _cartRepository.GetCartItemByIdAsync(cartId);
            if (cart == null || cart.UserId != userId)
                throw new KeyNotFoundException("Cart item not found");

            await _cartRepository.RemoveCartItemAsync(cartId);
            return await GetCartAsync(userId);
        }

        public async Task ClearCartAsync(int userId)
        {
            await _cartRepository.ClearCartAsync(userId);
        }
    }
}