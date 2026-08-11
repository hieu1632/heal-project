using HeaL.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            // Tổng doanh thu (từ các đơn hàng Completed)
            var totalRevenue = await _context.Orders
                .Where(o => o.Status == "Completed")
                .SumAsync(o => o.FinalAmount);

            // Tổng số đơn hàng
            var totalOrders = await _context.Orders.CountAsync();

            // Đơn hàng đang xử lý (Pending + Processing)
            var processingOrders = await _context.Orders
                .CountAsync(o => o.Status == "Pending" || o.Status == "Processing");

            // Tổng số sản phẩm
            var totalProducts = await _context.Products.CountAsync();

            // Tổng số người dùng
            var totalUsers = await _context.Users.CountAsync();

            // Đơn hàng gần đây (10 đơn gần nhất)
            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new
                {
                    o.Id,
                    CustomerName = o.User.FullName,
                    o.FinalAmount,
                    o.Status,
                    o.CreatedAt
                })
                .ToListAsync();

            // Top 5 sản phẩm bán chạy
            var topProducts = await _context.OrderDetails
                .GroupBy(od => new { od.ProductName, od.SizeName })
                .Select(g => new
                {
                    ProductName = g.Key.ProductName,
                    SizeName = g.Key.SizeName,
                    TotalSold = g.Sum(od => od.Quantity),
                    TotalRevenue = g.Sum(od => od.Total)
                })
                .OrderByDescending(g => g.TotalSold)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                ProcessingOrders = processingOrders,
                TotalProducts = totalProducts,
                TotalUsers = totalUsers,
                RecentOrders = recentOrders,
                TopProducts = topProducts
            });
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue([FromQuery] string period = "month")
        {
            var today = DateTime.UtcNow.Date;
            DateTime startDate;

            switch (period)
            {
                case "week":
                    startDate = today.AddDays(-7);
                    break;
                case "month":
                    startDate = new DateTime(today.Year, today.Month, 1);
                    break;
                case "year":
                    startDate = new DateTime(today.Year, 1, 1);
                    break;
                default:
                    startDate = today.AddDays(-30);
                    break;
            }

            var revenueData = await _context.Orders
                .Where(o => o.Status == "Completed" && o.CreatedAt >= startDate)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.FinalAmount)
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            return Ok(revenueData);
        }
    }
}