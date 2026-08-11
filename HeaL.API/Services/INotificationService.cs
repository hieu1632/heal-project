using HeaL.API.Models.DTOs;

namespace HeaL.API.Services
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int userId, List<int>? notificationIds);
        Task MarkAllAsReadAsync(int userId);
        Task SendWelcomeVoucherAsync(int userId);
        Task SendVoucherNotificationAsync(int userId, int voucherId, string voucherCode);
        Task SendOrderStatusNotificationAsync(int userId, int orderId, string status);
        Task SendPromotionNotificationAsync(int userId, string title, string content);
        Task DeleteNotificationAsync(int userId, int notificationId);
        Task SendPromotionToAllUsersAsync(string title, string content);  
        Task<IEnumerable<UserSimpleDto>> GetAllUsersAsync();  
    }
}