using AutoMapper;
using HeaL.API.Data;
using HeaL.API.Models.DTOs;
using HeaL.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Services
{
    public class ComboService : IComboService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ComboService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ComboDto>> GetCombosAsync(bool? isActive)
        {
            var query = _context.Combos
                .Include(c => c.ComboItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.ComboItems)
                    .ThenInclude(ci => ci.ProductSize)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);

            var combos = await query
                .OrderBy(c => c.DisplayOrder)
                .ToListAsync();

            var result = new List<ComboDto>();
            foreach (var combo in combos)
            {
                result.Add(await MapToDto(combo));
            }
            return result;
        }

        public async Task<ComboDto?> GetComboByIdAsync(int id)
        {
            var combo = await _context.Combos
                .Include(c => c.ComboItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.ComboItems)
                    .ThenInclude(ci => ci.ProductSize)
                .FirstOrDefaultAsync(c => c.Id == id);

            return combo == null ? null : await MapToDto(combo);
        }

        public async Task<IEnumerable<ComboDto>> GetActiveCombosAsync()
        {
            return await GetCombosAsync(true);
        }

        public async Task<ComboDto> CreateComboAsync(ComboCreateDto dto)
        {
            var combo = new Combo
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DiscountPercent = dto.DiscountPercent,
                Image = dto.Image,
                Type = dto.Type,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var itemDto in dto.Items)
            {
                combo.ComboItems.Add(new ComboItem
                {
                    ProductId = itemDto.ProductId,
                    ProductSizeId = itemDto.ProductSizeId,
                    Quantity = itemDto.Quantity,
                    IsFreebie = itemDto.IsFreebie,
                    Note = itemDto.Note
                });
            }

            _context.Combos.Add(combo);
            await _context.SaveChangesAsync();

            return await MapToDto(combo);
        }

        public async Task UpdateComboAsync(int id, ComboUpdateDto dto)
        {
            var combo = await _context.Combos
                .Include(c => c.ComboItems)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (combo == null)
                throw new KeyNotFoundException($"Combo with id {id} not found");

            combo.Name = dto.Name;
            combo.Description = dto.Description;
            combo.Price = dto.Price;
            combo.DiscountPercent = dto.DiscountPercent;
            combo.Image = dto.Image;
            combo.Type = dto.Type;
            combo.IsActive = dto.IsActive;
            combo.UpdatedAt = DateTime.UtcNow;

            // Xóa items cũ
            _context.ComboItems.RemoveRange(combo.ComboItems);

            // Thêm items mới
            foreach (var itemDto in dto.Items)
            {
                combo.ComboItems.Add(new ComboItem
                {
                    ProductId = itemDto.ProductId,
                    ProductSizeId = itemDto.ProductSizeId,
                    Quantity = itemDto.Quantity,
                    IsFreebie = itemDto.IsFreebie,
                    Note = itemDto.Note
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteComboAsync(int id)
        {
            var combo = await _context.Combos.FindAsync(id);
            if (combo != null)
            {
                _context.Combos.Remove(combo);
                await _context.SaveChangesAsync();
            }
        }

        private async Task<ComboDto> MapToDto(Combo combo)
        {
            var dto = new ComboDto
            {
                Id = combo.Id,
                Name = combo.Name,
                Description = combo.Description,
                Price = combo.Price ?? 0,
                DiscountPercent = combo.DiscountPercent,
                Image = combo.Image,
                Type = combo.Type,
                IsActive = combo.IsActive,
                Items = new List<ComboItemDto>()
            };

            decimal originalPrice = 0;

            foreach (var item in combo.ComboItems)
            {
                var price = item.ProductSize?.Price ?? item.Product.Price;
                originalPrice += price * item.Quantity;

                dto.Items.Add(new ComboItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    ProductSizeId = item.ProductSizeId,
                    SizeName = item.ProductSize?.SizeName,
                    Quantity = item.Quantity,
                    Price = price,
                    IsFreebie = item.IsFreebie,
                    Note = item.Note
                });
            }

            dto.OriginalPrice = originalPrice;
            dto.DiscountAmount = originalPrice - dto.Price;

            return dto;
        }
    }
}