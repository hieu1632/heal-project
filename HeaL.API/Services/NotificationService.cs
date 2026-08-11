using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HeaL.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IVoucherService _voucherService;

        public NotificationService(ApplicationDbContext context, IVoucherService voucherService)
        {
            _context = context;
            _voucherService = voucherService;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications.Select(MapToDto);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task MarkAsReadAsync(int userId, List<int>? notificationIds)
        {
            var query = _context.Notifications.Where(n => n.UserId == userId && !n.IsRead);
            
            if (notificationIds != null && notificationIds.Any())
            {
                query = query.Where(n => notificationIds.Contains(n.Id));
            }

            var notifications = await query.ToListAsync();
            foreach (var n in notifications)
            {
                n.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            await MarkAsReadAsync(userId, null);
        }

        public async Task SendWelcomeVoucherAsync(int userId)
        {
            // Tạo voucher chào mừng
            var voucher = new Voucher
            {
                Code = $"WELCOME{userId}{DateTime.UtcNow:yyyyMMdd}",
                Description = "Voucher chào mừng thành viên mới",
                DiscountPercent = 10,
                MinOrderValue = 50000,
                MaxDiscount = 30000,
                ExpiryDate = DateTime.UtcNow.AddDays(30),
                Quantity = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            // Gán voucher cho user
            var userVoucher = new UserVoucher
            {
                UserId = userId,
                VoucherId = voucher.Id,
                IsUsed = false,
                AssignedDate = DateTime.UtcNow
            };
            _context.UserVouchers.Add(userVoucher);
            await _context.SaveChangesAsync();

            // Tạo thông báo
            var notification = new Notification
            {
                UserId = userId,
                Title = "🎉 Chào mừng bạn đến với HeaL!",
                Content = $"Bạn đã nhận được voucher giảm 10% (tối đa 30.000đ) cho đơn hàng đầu tiên. Mã: {voucher.Code}",
                Type = "Welcome",
                Data = JsonSerializer.Serialize(new { voucherId = voucher.Id }),
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task SendVoucherNotificationAsync(int userId, int voucherId, string voucherCode)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = "🎁 Bạn nhận được voucher mới!",
                Content = $"Bạn đã nhận được voucher giảm giá. Mã: {voucherCode}",
                Type = "Voucher",
                Data = JsonSerializer.Serialize(new { voucherId }),
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task SendOrderStatusNotificationAsync(int userId, int orderId, string status)
        {
            string title = "";
            string content = "";

            switch (status)
            {
                case "Processing":
                    title = "🔄 Đơn hàng đang được xử lý";
                    content = $"Đơn hàng #{orderId} đang được chuẩn bị. Cảm ơn bạn đã đợi!";
                    break;
                case "Completed":
                    title = "✅ Đơn hàng đã hoàn thành";
                    content = $"Đơn hàng #{orderId} đã được giao thành công. Hy vọng bạn hài lòng!";
                    break;
                case "Cancelled":
                    title = "❌ Đơn hàng đã hủy";
                    content = $"Đơn hàng #{orderId} đã được hủy.";
                    break;
                default:
                    title = $"📋 Đơn hàng #{orderId} cập nhật";
                    content = $"Đơn hàng #{orderId} đã chuyển sang trạng thái: {status}";
                    break;
            }

            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Content = content,
                Type = "Order",
                Data = JsonSerializer.Serialize(new { orderId, status }),
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task SendPromotionNotificationAsync(int userId, string title, string content)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Content = content,
                Type = "Promotion",
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteNotificationAsync(int userId, int notificationId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
            
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();
            }
        }

        private NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Content = notification.Content,
                Type = notification.Type,
                IsRead = notification.IsRead,
                Data = notification.Data,
                CreatedAt = notification.CreatedAt
            };
        }
   
public async Task SendPromotionToAllUsersAsync(string title, string content)
{
    var users = await _context.Users
        .Where(u => u.IsActive)
        .Select(u => u.Id)
        .ToListAsync();

    var notifications = users.Select(userId => new Notification
    {
        UserId = userId,
        Title = title,
        Content = content,
        Type = "Promotion",
        CreatedAt = DateTime.UtcNow
    }).ToList();

    _context.Notifications.AddRange(notifications);
    await _context.SaveChangesAsync();
}

public async Task<IEnumerable<UserSimpleDto>> GetAllUsersAsync()
{
    return await _context.Users
        .Where(u => u.IsActive)
        .Select(u => new UserSimpleDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email
        })
        .ToListAsync();
}

    }
}