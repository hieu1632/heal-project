using HeaL.API.Models.DTOs;
using HeaL.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HeaL.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            try
            {
                var userId = GetUserId();
                var order = await _orderService.CreateOrderAsync(userId, dto);
                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi CreateOrder: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi tạo đơn hàng" });
            }
        }

        [Authorize]
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            try
            {
                var userId = GetUserId();
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi GetMyOrders: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy đơn hàng" });
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            try
            {
                var userId = GetUserId();
                var order = await _orderService.GetOrderByIdAsync(id, userId);
                if (order == null)
                    return NotFound();
                return Ok(order);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi GetOrder {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết đơn hàng" });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                Console.WriteLine("📋 Admin đang lấy tất cả đơn hàng...");
                var orders = await _orderService.GetAllOrdersAsync();
                Console.WriteLine($"✅ Lấy thành công {orders?.Count() ?? 0} đơn hàng");
                return Ok(orders);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi GetAllOrders: {ex.Message}");
                Console.WriteLine($"📚 Stack: {ex.StackTrace}");
                return StatusCode(500, new { 
                    message = "Lỗi khi lấy danh sách đơn hàng", 
                    detail = ex.Message 
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto dto)
        {
            try
            {
                await _orderService.UpdateOrderStatusAsync(id, dto.Status);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi UpdateOrderStatus {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái" });
            }
        }

        [Authorize]
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = GetUserId();
                await _orderService.CancelOrderAsync(id, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi CancelOrder {id}: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi hủy đơn hàng" });
            }
        }
    }
}