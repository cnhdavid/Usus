using AutoMapper;
using Usus.API.Core.DTOs;
using Usus.API.Core.Entities;
using Usus.API.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Usus.API.Infrastructure.Interfaces;

namespace Usus.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HabitDto>>> GetHabits()
    {
        var habits = await _habitRepository.GetAllAsync(GetUserId());
        return Ok(_mapper.Map<IEnumerable<HabitDto>>(habits));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HabitDto>> GetHabit(int id)
    {
        var habit = await _habitRepository.GetByIdAsync(id);
        if (habit == null || habit.UserId != GetUserId())
            return NotFound(new { message = $"Habit with ID {id} not found" });

        return Ok(_mapper.Map<HabitDto>(habit));
    }

    [HttpPost]
    public async Task<ActionResult<HabitDto>> CreateHabit([FromBody] CreateHabitRequest request)
    {
        request.UserId = GetUserId();
        var habit = _mapper.Map<Habit>(request);
        var createdHabit = await _habitRepository.CreateAsync(habit);
        var habitDto = _mapper.Map<HabitDto>(createdHabit);
        return CreatedAtAction(nameof(GetHabit), new { id = habitDto.Id }, habitDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<HabitDto>> UpdateHabit(int id, [FromBody] UpdateHabitRequest request)
    {
        var existingHabit = await _habitRepository.GetByIdAsync(id);
        if (existingHabit == null || existingHabit.UserId != GetUserId())
            return NotFound(new { message = $"Habit with ID {id} not found" });

        if (!string.IsNullOrEmpty(request.Name)) existingHabit.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Description)) existingHabit.Description = request.Description;
        if (!string.IsNullOrEmpty(request.Frequency)) existingHabit.Frequency = request.Frequency;
        if (request.TargetCount.HasValue) existingHabit.TargetCount = request.TargetCount.Value;
        if (request.TargetValue.HasValue) existingHabit.TargetValue = request.TargetValue.Value;
        if (request.Unit != null) existingHabit.Unit = request.Unit;
        if (request.Category != null) existingHabit.Category = request.Category;

        var updatedHabit = await _habitRepository.UpdateAsync(id, existingHabit);
        return Ok(_mapper.Map<HabitDto>(updatedHabit));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHabit(int id)
    {
        var habit = await _habitRepository.GetByIdAsync(id);
        if (habit == null || habit.UserId != GetUserId())
            return NotFound(new { message = $"Habit with ID {id} not found" });

        await _habitRepository.DeleteAsync(id);
        return NoContent();
    }
}
