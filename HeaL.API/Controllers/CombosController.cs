using HeaL.API.Models.DTOs;
using HeaL.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeaL.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CombosController : ControllerBase
    {
        private readonly IComboService _comboService;

        public CombosController(IComboService comboService)
        {
            _comboService = comboService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCombos([FromQuery] bool? isActive)
        {
            try
            {
                var combos = await _comboService.GetCombosAsync(isActive);
                return Ok(combos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting combos: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách combo" });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveCombos()
        {
            try
            {
                var combos = await _comboService.GetActiveCombosAsync();
                return Ok(combos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting active combos: {ex.Message}");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách combo" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCombo(int id)
        {
            var combo = await _comboService.GetComboByIdAsync(id);
            if (combo == null)
                return NotFound();
            return Ok(combo);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateCombo([FromBody] ComboCreateDto dto)
        {
            try
            {
                var created = await _comboService.CreateComboAsync(dto);
                return CreatedAtAction(nameof(GetCombo), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error creating combo: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCombo(int id, [FromBody] ComboUpdateDto dto)
        {
            try
            {
                await _comboService.UpdateComboAsync(id, dto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error updating combo: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCombo(int id)
        {
            try
            {
                await _comboService.DeleteComboAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error deleting combo: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}