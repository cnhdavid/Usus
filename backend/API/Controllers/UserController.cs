using AutoMapper;
using Usus.API.Core.DTOs;
using Usus.API.Core.Entities;
using Usus.API.Infrastructure.Repositories;
using Microsoft.AspNetCore.Mvc;
using Usus.API.Infrastructure.Interfaces;
using BCrypt.Net;

namespace Usus.API.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserController(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = _mapper.Map<User>(request);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var createdUser = await _userRepository.CreateAsync(user);
        var userDto = _mapper.Map<UserDto>(createdUser);

        return CreatedAtAction(nameof(GetUser), new { id = userDto.Id }, userDto);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var response = _mapper.Map<LoginResponse>(user);
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var userToUpdate = _mapper.Map<User>(request);
        var updatedUser = await _userRepository.UpdateAsync(id, userToUpdate);
        if (updatedUser == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        var userDto = _mapper.Map<UserDto>(updatedUser);
        return Ok(userDto);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        return NoContent();
    }
}