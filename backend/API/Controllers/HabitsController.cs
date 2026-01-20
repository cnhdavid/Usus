using AutoMapper;
using Usus.API.Core.DTOs;
using Usus.API.Core.Entities;
using Usus.API.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Usus.API.Infrastructure.Interfaces;

namespace Usus.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HabitsController : ControllerBase
{
    private readonly IHabitRepository _habitRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<HabitsController> _logger;

    public HabitsController(
        IHabitRepository habitRepository,
        IMapper mapper,
        ILogger<HabitsController> logger)
    {
        _habitRepository = habitRepository;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HabitDto>>> GetHabits([FromQuery] int userId = 1)
    {
        var habits = await _habitRepository.GetAllAsync(userId);
        var habitDtos = _mapper.Map<IEnumerable<HabitDto>>(habits);
        return Ok(habitDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HabitDto>> GetHabit(int id)
    {
        var habit = await _habitRepository.GetByIdAsync(id);
        if (habit == null)
        {
            return NotFound(new { message = $"Habit with ID {id} not found" });
        }

        var habitDto = _mapper.Map<HabitDto>(habit);
        return Ok(habitDto);
    }

    [HttpPost]
    public async Task<ActionResult<HabitDto>> CreateHabit([FromBody] CreateHabitRequest request)
    {
        var habit = _mapper.Map<Habit>(request);
        var createdHabit = await _habitRepository.CreateAsync(habit);
        var habitDto = _mapper.Map<HabitDto>(createdHabit);

        return CreatedAtAction(nameof(GetHabit), new { id = habitDto.Id }, habitDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<HabitDto>> UpdateHabit(int id, [FromBody] UpdateHabitRequest request)
    {
        var existingHabit = await _habitRepository.GetByIdAsync(id);
        if (existingHabit == null)
        {
            return NotFound(new { message = $"Habit with ID {id} not found" });
        }

        if (!string.IsNullOrEmpty(request.Name))
            existingHabit.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description))
            existingHabit.Description = request.Description;
        if (!string.IsNullOrEmpty(request.Frequency))
            existingHabit.Frequency = request.Frequency;
        if (request.TargetCount.HasValue)
            existingHabit.TargetCount = request.TargetCount.Value;

        var updatedHabit = await _habitRepository.UpdateAsync(id, existingHabit);
        var habitDto = _mapper.Map<HabitDto>(updatedHabit);

        return Ok(habitDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHabit(int id)
    {
        var deleted = await _habitRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"Habit with ID {id} not found" });
        }

        return NoContent();
    }
}
