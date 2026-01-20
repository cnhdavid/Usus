using AutoMapper;
using Usus.API.Core.DTOs;
using Usus.API.Core.Entities;

namespace Usus.API.API.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Habit, HabitDto>();
        CreateMap<CreateHabitRequest, Habit>();
        
        CreateMap<DailyLog, DailyLogDto>();
        CreateMap<CreateDailyLogRequest, DailyLog>();
        
        CreateMap<User, UserDto>();
        CreateMap<CreateUserRequest, User>();
    }
}
