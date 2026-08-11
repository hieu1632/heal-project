using HeaL.API.Models.Entities;

namespace HeaL.API.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(Order order);
        Task<Order?> GetOrderByIdAsync(int id);
        Task<IEnumerable<Order>> GetUserOrdersAsync(int userId);
        Task<IEnumerable<Order>> GetAllOrdersAsync();
        Task UpdateOrderAsync(Order order);
        Task<bool> OrderExistsAsync(int id);
        Task<bool> IsOrderBelongsToUserAsync(int orderId, int userId);
    }
}