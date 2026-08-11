using HeaL.API.Models.Entities;

namespace HeaL.API.Repositories
{
    public interface ICartRepository
    {
        Task<IEnumerable<Cart>> GetCartItemsAsync(int userId);
        Task<Cart?> GetCartItemByIdAsync(int id);
        Task<Cart?> GetProductCartItemAsync(int userId, int productSizeId);
        Task<Cart?> GetComboCartItemAsync(int userId, int comboId);
        Task<Cart> AddOrUpdateCartItemAsync(Cart cart);
        Task UpdateAsync(Cart cart);
        Task RemoveCartItemAsync(int id);
        Task ClearCartAsync(int userId);
    }
}