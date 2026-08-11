using HeaL.API.Models.DTOs;

namespace HeaL.API.Services
{
    public interface ICartService
    {
        Task<CartResponseDto> GetCartAsync(int userId);
        Task<CartResponseDto> AddToCartAsync(int userId, AddToCartDto dto);
        Task<CartResponseDto> AddComboToCartAsync(int userId, AddComboDto dto);
        Task<CartResponseDto> UpdateCartAsync(int cartId, int userId, UpdateCartDto dto);
        Task<CartResponseDto> RemoveFromCartAsync(int cartId, int userId);
        Task ClearCartAsync(int userId);
    }
}