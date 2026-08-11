using HeaL.API.Models.DTOs;

namespace HeaL.API.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(int userId, OrderCreateDto dto);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);
        Task<OrderDto?> GetOrderByIdAsync(int orderId, int userId);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
        Task UpdateOrderStatusAsync(int orderId, string status);
        Task CancelOrderAsync(int orderId, int userId);
    }
}