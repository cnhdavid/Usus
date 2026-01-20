using AutoMapper;
using Usus.API.Core.DTOs;
using Usus.API.Core.Entities;
using Usus.API.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Usus.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly IDailyLogRepository _dailyLogRepository;
    private readonly IHabitRepository _habitRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<LogsController> _logger;

    public LogsController(
        IDailyLogRepository dailyLogRepository,
        IHabitRepository habitRepository,
        IMapper mapper,
        ILogger<LogsController> logger)
    {
        _dailyLogRepository = dailyLogRepository;
        _habitRepository = habitRepository;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet("habit/{habitId}")]
    public async Task<ActionResult<IEnumerable<DailyLogDto>>> GetLogsByHabit(int habitId)
    {
        var habitExists = await _habitRepository.ExistsAsync(habitId);
        if (!habitExists)
        {
            return NotFound(new { message = $"Habit with ID {habitId} not found" });
        }

        var logs = await _dailyLogRepository.GetByHabitIdAsync(habitId);
        var logDtos = _mapper.Map<IEnumerable<DailyLogDto>>(logs);
        return Ok(logDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DailyLogDto>> GetLog(int id)
    {
        var log = await _dailyLogRepository.GetByIdAsync(id);
        if (log == null)
        {
            return NotFound(new { message = $"Log with ID {id} not found" });
        }

        var logDto = _mapper.Map<DailyLogDto>(log);
        return Ok(logDto);
    }

    [HttpPost]
    public async Task<ActionResult<DailyLogDto>> CreateLog([FromBody] CreateDailyLogRequest request)
    {
        var habitExists = await _habitRepository.ExistsAsync(request.HabitId);
        if (!habitExists)
        {
            return NotFound(new { message = $"Habit with ID {request.HabitId} not found" });
        }

        var existingLog = await _dailyLogRepository.GetByHabitAndDateAsync(request.HabitId, request.Date);
        if (existingLog != null)
        {
            return Conflict(new { message = "A log for this habit and date already exists" });
        }

        var dailyLog = _mapper.Map<DailyLog>(request);
        var createdLog = await _dailyLogRepository.CreateAsync(dailyLog);
        var logDto = _mapper.Map<DailyLogDto>(createdLog);

        return CreatedAtAction(nameof(GetLog), new { id = logDto.Id }, logDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DailyLogDto>> UpdateLog(int id, [FromBody] UpdateDailyLogRequest request)
    {
        var existingLog = await _dailyLogRepository.GetByIdAsync(id);
        if (existingLog == null)
        {
            return NotFound(new { message = $"Log with ID {id} not found" });
        }

        if (request.CompletedCount.HasValue)
            existingLog.CompletedCount = request.CompletedCount.Value;
        if (request.Notes != null)
            existingLog.Notes = request.Notes;

        var updatedLog = await _dailyLogRepository.UpdateAsync(id, existingLog);
        var logDto = _mapper.Map<DailyLogDto>(updatedLog);

        return Ok(logDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLog(int id)
    {
        var deleted = await _dailyLogRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"Log with ID {id} not found" });
        }

        return NoContent();
    }
}
