using HeaL.API.Models.DTOs;

namespace HeaL.API.Services
{
    public interface IComboService
    {
        Task<IEnumerable<ComboDto>> GetCombosAsync(bool? isActive);
        Task<IEnumerable<ComboDto>> GetActiveCombosAsync();
        Task<ComboDto?> GetComboByIdAsync(int id);
        Task<ComboDto> CreateComboAsync(ComboCreateDto dto);
        Task UpdateComboAsync(int id, ComboUpdateDto dto);
        Task DeleteComboAsync(int id);
    }
}