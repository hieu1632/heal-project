using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using HeaL.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IVoucherService _voucherService;
        private readonly IProductRepository _productRepository;
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IVoucherService voucherService,
            IProductRepository productRepository,
            ApplicationDbContext context,
            INotificationService notificationService) 
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _voucherService = voucherService;
            _productRepository = productRepository;
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<OrderDto> CreateOrderAsync(int userId, OrderCreateDto dto)
        {
            // 1. Lấy giỏ hàng của user
            var cartItems = await _cartRepository.GetCartItemsAsync(userId);
            if (!cartItems.Any())
                throw new InvalidOperationException("Cart is empty");

            decimal totalAmount = 0;
            decimal originalAmount = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var cart in cartItems)
            {
                // Xử lý sản phẩm thường
                if (cart.ProductSizeId.HasValue && cart.ProductSize != null)
                {
                    var productSize = cart.ProductSize;
                    var product = productSize.Product;

                    orderDetails.Add(new OrderDetail
                    {
                        ProductSizeId = cart.ProductSizeId,
                        ProductName = product.Name,
                        SizeName = productSize.SizeName,
                        Quantity = cart.Quantity,
                        Price = productSize.Price,
                        Total = productSize.Price * cart.Quantity,
                        IsComboItem = false
                    });

                    totalAmount += productSize.Price * cart.Quantity;
                    originalAmount += productSize.Price * cart.Quantity;
                }
                // Xử lý combo
                else if (cart.ComboId.HasValue && cart.Combo != null)
                {
                    var combo = cart.Combo;

                    var comboItems = await _context.ComboItems
                        .Include(ci => ci.Product)
                        .Include(ci => ci.ProductSize)
                        .Where(ci => ci.ComboId == combo.Id)
                        .ToListAsync();

                    // Tính giá gốc của combo
                    decimal comboOriginalPrice = 0;
                    foreach (var item in comboItems)
                    {
                        var price = item.ProductSize?.Price ?? item.Product.Price;
                        comboOriginalPrice += price * item.Quantity;
                    }
                    comboOriginalPrice *= cart.Quantity;

                    // Thêm OrderDetail cho combo
                    orderDetails.Add(new OrderDetail
                    {
                        ProductSizeId = null,
                        ProductName = $"🎁 Combo: {combo.Name}",
                        SizeName = "Combo",
                        Quantity = cart.Quantity,
                        Price = cart.Price,
                        Total = cart.Price * cart.Quantity,
                        IsComboItem = true,
                        ComboId = combo.Id,
                        OriginalPrice = comboOriginalPrice
                    });

                    totalAmount += cart.Price * cart.Quantity;
                    originalAmount += comboOriginalPrice;
                }
                else
                {
                    Console.WriteLine($"⚠️ Cart ID {cart.Id} không hợp lệ");
                }
            }

            if (!orderDetails.Any())
                throw new InvalidOperationException("Không có sản phẩm nào để đặt hàng");

            // 2. Áp dụng voucher (nếu có)
            decimal discountAmount = 0;
            Voucher? voucher = null;

            if (!string.IsNullOrEmpty(dto.VoucherCode))
            {
                var voucherResult = await _voucherService.ValidateAndApplyVoucherAsync(
                    dto.VoucherCode, userId, totalAmount);

                if (voucherResult != null)
                {
                    discountAmount = voucherResult.DiscountAmount;
                    voucher = voucherResult.Voucher;
                }
            }

            // 3. Tạo đơn hàng
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount,
                OriginalAmount = originalAmount,
                DiscountAmount = discountAmount,
                FinalAmount = totalAmount - discountAmount,
                Status = "Pending",
                Address = dto.Address,
                Phone = dto.Phone,
                Note = dto.Note,
                PaymentMethod = dto.PaymentMethod,
                VoucherId = voucher?.Id,
                CreatedAt = DateTime.UtcNow,
                OrderDetails = orderDetails
            };

            // 4. Lưu đơn hàng
            var createdOrder = await _orderRepository.CreateOrderAsync(order);

            // 5. Xóa giỏ hàng
            await _cartRepository.ClearCartAsync(userId);

            // 6. Đánh dấu voucher đã sử dụng
            if (voucher != null)
            {
                await _voucherService.MarkVoucherAsUsedAsync(voucher.Id, userId);
            }

            return MapToOrderDto(createdOrder);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _orderRepository.GetUserOrdersAsync(userId);
            var result = new List<OrderDto>();
            foreach (var order in orders)
            {
                result.Add(MapToOrderDto(order));
            }
            return result;
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null || order.UserId != userId)
                return null;
            return MapToOrderDto(order);
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            try
            {
                var orders = await _orderRepository.GetAllOrdersAsync();
                var result = new List<OrderDto>();
                
                foreach (var order in orders)
                {
                    try
                    {
                        result.Add(MapToOrderDto(order));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ Lỗi map order {order.Id}: {ex.Message}");
                        // Trả về order cơ bản nếu lỗi
                        result.Add(new OrderDto
                        {
                            Id = order.Id,
                            OrderDate = order.OrderDate,
                            TotalAmount = order.TotalAmount,
                            OriginalAmount = order.OriginalAmount,
                            DiscountAmount = order.DiscountAmount,
                            FinalAmount = order.FinalAmount,
                            Status = order.Status ?? "Pending",
                            Address = order.Address ?? "N/A",
                            Phone = order.Phone ?? "N/A",
                            PaymentMethod = order.PaymentMethod ?? "COD",
                            User = new UserProfileDto
                            {
                                Id = order.UserId,
                                FullName = "Người dùng đã bị xóa",
                                Email = "N/A",
                                Phone = "N/A"
                            },
                            OrderDetails = new List<OrderDetailDto>()
                        });
                    }
                }
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi GetAllOrdersAsync: {ex.Message}");
                Console.WriteLine($"📚 Stack: {ex.StackTrace}");
                throw;
            }
        }

        public async Task UpdateOrderStatusAsync(int orderId, string status)
        {
            var validStatuses = new[] { "Pending", "Processing", "Completed", "Cancelled" };
            if (!validStatuses.Contains(status))
                throw new ArgumentException("Invalid status");

            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new KeyNotFoundException($"Order {orderId} not found");

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateOrderAsync(order);

            await _notificationService.SendOrderStatusNotificationAsync(order.UserId, orderId, status);
        }

        public async Task CancelOrderAsync(int orderId, int userId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new KeyNotFoundException($"Order {orderId} not found");

            if (order.UserId != userId)
                throw new UnauthorizedAccessException("You don't have permission to cancel this order");

            if (order.Status != "Pending")
                throw new InvalidOperationException("Only pending orders can be cancelled");

            order.Status = "Cancelled";
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepository.UpdateOrderAsync(order);
        }

        private OrderDto MapToOrderDto(Order order)
        {
            if (order == null)
                throw new ArgumentNullException(nameof(order));

            // Xử lý User null
            UserProfileDto userDto;
            if (order.User != null)
            {
                userDto = new UserProfileDto
                {
                    Id = order.User.Id,
                    FullName = order.User.FullName ?? "Unknown",
                    Email = order.User.Email ?? "N/A",
                    Phone = order.User.Phone ?? "N/A"
                };
            }
            else
            {
                userDto = new UserProfileDto
                {
                    Id = order.UserId,
                    FullName = $"User {order.UserId} (đã bị xóa)",
                    Email = "N/A",
                    Phone = "N/A"
                };
            }

            // Xử lý OrderDetails null
            var orderDetails = order.OrderDetails != null
                ? order.OrderDetails.Select(od => new OrderDetailDto
                {
                    Id = od.Id,
                    ProductName = od.ProductName ?? "Unknown",
                    SizeName = od.SizeName ?? "N/A",
                    Quantity = od.Quantity,
                    Price = od.Price,
                    Total = od.Total,
                    IsComboItem = od.IsComboItem,
                    ComboId = od.ComboId,
                    OriginalPrice = od.OriginalPrice
                }).ToList()
                : new List<OrderDetailDto>();

            // ✅ Trả về OrderDto
            return new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OriginalAmount = order.OriginalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.FinalAmount,
                Status = order.Status ?? "Pending",
                Address = order.Address ?? string.Empty,
                Phone = order.Phone ?? string.Empty,
                Note = order.Note,
                PaymentMethod = order.PaymentMethod ?? "COD",
                VoucherCode = order.Voucher?.Code,
                User = userDto,
                OrderDetails = orderDetails
            };
        }
    }
}