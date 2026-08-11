using HeaL.API.Data;
using HeaL.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Cart>> GetCartItemsAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.ProductSize)
                    .ThenInclude(ps => ps != null ? ps.Product : null!) // ✅ Fix null
                .Include(c => c.Combo)
                    .ThenInclude(co => co != null ? co.ComboItems : null!)
                        .ThenInclude(ci => ci != null ? ci.Product : null!)
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<Cart?> GetCartItemByIdAsync(int id)
        {
            return await _context.Carts
                .Include(c => c.ProductSize)
                    .ThenInclude(ps => ps != null ? ps.Product : null!)
                .Include(c => c.Combo)
                    .ThenInclude(co => co != null ? co.ComboItems : null!)
                        .ThenInclude(ci => ci != null ? ci.Product : null!)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Cart?> GetProductCartItemAsync(int userId, int productSizeId)
        {
            return await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductSizeId == productSizeId);
        }

        public async Task<Cart?> GetComboCartItemAsync(int userId, int comboId)
        {
            return await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ComboId == comboId);
        }

        public async Task<Cart> AddOrUpdateCartItemAsync(Cart cart)
        {
            if (cart.ProductSizeId.HasValue)
            {
                var existing = await GetProductCartItemAsync(cart.UserId, cart.ProductSizeId.Value);
                if (existing != null)
                {
                    existing.Quantity += cart.Quantity;
                    existing.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return existing;
                }
            }
            else if (cart.ComboId.HasValue)
            {
                var existing = await GetComboCartItemAsync(cart.UserId, cart.ComboId.Value);
                if (existing != null)
                {
                    existing.Quantity += cart.Quantity;
                    existing.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return existing;
                }
            }

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task UpdateAsync(Cart cart)
        {
            _context.Carts.Update(cart);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveCartItemAsync(int id)
        {
            var cart = await _context.Carts.FindAsync(id);
            if (cart != null)
            {
                _context.Carts.Remove(cart);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClearCartAsync(int userId)
        {
            var carts = await _context.Carts.Where(c => c.UserId == userId).ToListAsync();
            if (carts.Any())
            {
                _context.Carts.RemoveRange(carts);
                await _context.SaveChangesAsync();
            }
        }
    }
}