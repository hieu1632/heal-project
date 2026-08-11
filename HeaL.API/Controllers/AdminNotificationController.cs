using HeaL.API.Models.DTOs;
using HeaL.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeaL.API.Controllers
{
    [ApiController]
    [Route("api/admin/notification")]
    [Authorize(Roles = "Admin")]
    public class AdminNotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public AdminNotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpPost("send-to-user")]
        public async Task<IActionResult> SendToUser([FromBody] AdminSendNotificationDto dto)
        {
            try
            {
                await _notificationService.SendPromotionNotificationAsync(
                    dto.UserId, 
                    dto.Title, 
                    dto.Content
                );
                return Ok(new { message = "Gửi thông báo thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("send-to-all")]
        public async Task<IActionResult> SendToAll([FromBody] AdminSendAllNotificationDto dto)
        {
            try
            {
                await _notificationService.SendPromotionToAllUsersAsync(dto.Title, dto.Content);
                return Ok(new { message = "Gửi thông báo đến tất cả user thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _notificationService.GetAllUsersAsync();
            return Ok(users);
        }
    }
}