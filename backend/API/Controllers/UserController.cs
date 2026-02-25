using AutoMapper;
using Usus.API.Core.DTOs;
using Usus.API.Core.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Usus.API.Infrastructure.Interfaces;

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

    // GET /api/user/me – liefert den eingeloggten User anhand des Cookies
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<LoginResponse>> Me()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound();
        return Ok(_mapper.Map<LoginResponse>(user));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = $"User with ID {id} not found" });

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }

    // POST /api/user – Signup
    [HttpPost]
    public async Task<ActionResult<LoginResponse>> CreateUser([FromBody] CreateUserRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            return Conflict(new { message = "Email already in use" });

        var user = _mapper.Map<User>(request);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var createdUser = await _userRepository.CreateAsync(user);

        await SignInUser(createdUser);

        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, _mapper.Map<LoginResponse>(createdUser));
    }

    // POST /api/user/login – Login
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        bool passwordValid = false;
        try
        {
            passwordValid = user != null && BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            // ungültiger Hash-Format
        }

        if (!passwordValid)
            return Unauthorized(new { message = "Invalid email or password" });

        await SignInUser(user!);
        return Ok(_mapper.Map<LoginResponse>(user));
    }

    // POST /api/user/logout – Logout
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { message = "Logged out" });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        var userToUpdate = _mapper.Map<User>(request);
        var updatedUser = await _userRepository.UpdateAsync(id, userToUpdate);
        if (updatedUser == null)
            return NotFound(new { message = $"User with ID {id} not found" });

        return Ok(_mapper.Map<UserDto>(updatedUser));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userRepository.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = $"User with ID {id} not found" });

        return NoContent();
    }

    // ──────────────────────────────────────────────────────────────
    private async Task SignInUser(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(30),
            });
    }
}
