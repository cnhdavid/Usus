# Habit Tracker - Complete Project Structure Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Architecture (.NET 8)](#backend-architecture-net-8)
3. [Frontend Architecture (React + Vite)](#frontend-architecture-react--vite)
4. [Integration & Deployment](#integration--deployment)
5. [How Everything Works Together](#how-everything-works-together)

---

## Project Overview

This is a **commercial-grade habit tracking application** built with a **decoupled architecture**, meaning the frontend and backend are completely separate and communicate through HTTP requests (REST API).

### Technology Stack
- **Backend**: .NET 8 Web API (C#)
- **Frontend**: React 18 with TypeScript, Vite
- **Database**: SQLite (Entity Framework Core)
- **Architecture Pattern**: Clean Architecture (Separation of Concerns)

---

## Backend Architecture (.NET 8)

The backend follows **Clean Architecture** principles, which separates code into distinct layers with clear responsibilities. This makes the code maintainable, testable, and scalable.

### 📁 Root Backend Structure

```
backend/
├── Core/                    # Business logic and domain models
│   ├── Entities/           # Database models (what data looks like)
│   └── DTOs/               # Data Transfer Objects (API request/response models)
├── Infrastructure/          # Data access and external services
│   ├── Data/               # Database context and configuration
│   └── Repositories/       # Data access layer (CRUD operations)
├── API/                     # Web API layer (HTTP endpoints)
│   ├── Controllers/        # API endpoints that handle HTTP requests
│   ├── Middleware/         # Request/response pipeline components
│   └── Mapping/            # AutoMapper profiles (entity ↔ DTO conversion)
├── Program.cs              # Application entry point and configuration
└── HabitTracker.API.csproj # Project file with dependencies
```

---

### 🎯 Core Layer - The Heart of Your Application

The Core layer contains your **business logic** and **domain models**. It has NO dependencies on other layers, making it the most stable part of your application.

#### **Core/Entities/** - Database Models

These classes represent your database tables. Entity Framework Core uses these to create and manage your database schema.

##### **`User.cs`**
```csharp
public class User
{
    public int Id { get; set; }                           // Primary key
    public string Username { get; set; }                  // User's display name
    public string Email { get; set; }                     // Unique email address
    public DateTime CreatedAt { get; set; }               // Account creation timestamp
    public ICollection<Habit> Habits { get; set; }        // Navigation property: One user has many habits
}
```

**Purpose**: Represents a user account in the system.

**Key Concepts**:
- **Primary Key**: `Id` uniquely identifies each user
- **Navigation Property**: `Habits` creates a relationship between User and Habit tables
- **ICollection**: Allows Entity Framework to track multiple related habits

---

##### **`Habit.cs`**
```csharp
public class Habit
{
    public int Id { get; set; }                           // Primary key
    public string Name { get; set; }                      // Habit name (e.g., "Exercise")
    public string Description { get; set; }               // Detailed description
    public string Frequency { get; set; }                 // How often (Daily, Weekly, etc.)
    public int TargetCount { get; set; }                  // Goal (e.g., 3 times per day)
    public DateTime CreatedAt { get; set; }               // When habit was created
    public int UserId { get; set; }                       // Foreign key to User
    public User User { get; set; }                        // Navigation property to User
    public ICollection<DailyLog> DailyLogs { get; set; }  // Navigation property: One habit has many logs
}
```

**Purpose**: Represents a habit that a user wants to track.

**Key Concepts**:
- **Foreign Key**: `UserId` links this habit to a specific user
- **Navigation Properties**: Allow you to access related data (User and DailyLogs)
- **One-to-Many Relationship**: One habit can have many daily logs

---

##### **`DailyLog.cs`**
```csharp
public class DailyLog
{
    public int Id { get; set; }                           // Primary key
    public DateTime Date { get; set; }                    // Date of the log entry
    public int CompletedCount { get; set; }               // How many times completed
    public string? Notes { get; set; }                    // Optional notes
    public int HabitId { get; set; }                      // Foreign key to Habit
    public Habit Habit { get; set; }                      // Navigation property to Habit
}
```

**Purpose**: Records daily progress for a specific habit.

**Key Concepts**:
- **Nullable Type**: `string?` means notes are optional
- **Composite Unique Index**: (HabitId + Date) ensures only one log per habit per day
- **Cascade Delete**: If a habit is deleted, all its logs are automatically deleted

---

#### **Core/DTOs/** - Data Transfer Objects

DTOs are **simplified versions** of entities used for API communication. They control what data is sent/received and provide validation.

##### **`HabitDto.cs`**
```csharp
public class HabitDto                    // Response: What API sends to client
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Frequency { get; set; }
    public int TargetCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
}

public class CreateHabitRequest          // Request: What client sends to create a habit
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Frequency { get; set; }
    public int TargetCount { get; set; }
    public int UserId { get; set; }
}

public class UpdateHabitRequest          // Request: What client sends to update a habit
{
    public string? Name { get; set; }         // All fields optional for partial updates
    public string? Description { get; set; }
    public string? Frequency { get; set; }
    public int? TargetCount { get; set; }
}
```

**Why DTOs?**
1. **Security**: Don't expose internal entity structure
2. **Flexibility**: Different operations need different data
3. **Validation**: Can add validation attributes
4. **Versioning**: Can change DTOs without changing entities

---

##### **`DailyLogDto.cs`** and **`UserDto.cs`**
Similar structure to HabitDto - they provide request/response models for their respective entities.

---

### 🏗️ Infrastructure Layer - Data Access

This layer handles **database operations** and **external dependencies**. It depends on the Core layer but is independent of the API layer.

#### **Infrastructure/Data/DataContext.cs**

```csharp
public class DataContext : DbContext
{
    public DbSet<User> Users { get; set; }        // Represents Users table
    public DbSet<Habit> Habits { get; set; }      // Represents Habits table
    public DbSet<DailyLog> DailyLogs { get; set; }// Represents DailyLogs table

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure entity relationships and constraints
    }
}
```

**Purpose**: 
- **DbContext** is Entity Framework's main class for database operations
- **DbSet** properties represent database tables
- **OnModelCreating** configures relationships, indexes, and constraints

**Key Configurations**:
- **Unique Indexes**: Email must be unique
- **Foreign Keys**: Define parent-child relationships
- **Cascade Delete**: When parent is deleted, children are too
- **Max Lengths**: Prevent database overflow

---

#### **Infrastructure/Repositories/** - Data Access Pattern

Repositories provide a **clean abstraction** over database operations. Controllers don't need to know about Entity Framework - they just call repository methods.

##### **`IHabitRepository.cs`** (Interface)
```csharp
public interface IHabitRepository
{
    Task<IEnumerable<Habit>> GetAllAsync(int userId);   // Get all habits for a user
    Task<Habit?> GetByIdAsync(int id);                  // Get single habit by ID
    Task<Habit> CreateAsync(Habit habit);               // Create new habit
    Task<Habit?> UpdateAsync(int id, Habit habit);      // Update existing habit
    Task<bool> DeleteAsync(int id);                     // Delete habit
    Task<bool> ExistsAsync(int id);                     // Check if habit exists
}
```

**Why Interfaces?**
- **Dependency Inversion**: High-level code depends on abstractions, not implementations
- **Testability**: Easy to mock for unit tests
- **Flexibility**: Can swap implementations without changing controllers

---

##### **`HabitRepository.cs`** (Implementation)
```csharp
public class HabitRepository : IHabitRepository
{
    private readonly DataContext _context;

    public async Task<IEnumerable<Habit>> GetAllAsync(int userId)
    {
        return await _context.Habits
            .Where(h => h.UserId == userId)
            .Include(h => h.DailyLogs)      // Eager loading: Load related logs
            .ToListAsync();                  // Execute query asynchronously
    }
    
    // ... other methods
}
```

**Key Concepts**:
- **Async/Await**: Non-blocking database operations
- **LINQ**: Language Integrated Query for database queries
- **Include**: Eager loading of related data
- **Dependency Injection**: DataContext is injected via constructor

---

##### **`IDailyLogRepository.cs`** and **`DailyLogRepository.cs`**
Similar pattern for DailyLog operations, with additional methods like `GetByHabitAndDateAsync` for date-specific queries.

---

### 🌐 API Layer - HTTP Endpoints

This layer handles **HTTP requests and responses**. It's the entry point for all client communication.

#### **API/Controllers/HabitsController.cs**

```csharp
[ApiController]                          // Marks this as an API controller
[Route("api/[controller]")]              // Base route: /api/habits
public class HabitsController : ControllerBase
{
    private readonly IHabitRepository _habitRepository;
    private readonly IMapper _mapper;    // AutoMapper for entity ↔ DTO conversion

    [HttpGet]                            // GET /api/habits?userId=1
    public async Task<ActionResult<IEnumerable<HabitDto>>> GetHabits([FromQuery] int userId)
    {
        var habits = await _habitRepository.GetAllAsync(userId);
        var habitDtos = _mapper.Map<IEnumerable<HabitDto>>(habits);
        return Ok(habitDtos);            // Returns 200 OK with data
    }

    [HttpPost]                           // POST /api/habits
    public async Task<ActionResult<HabitDto>> CreateHabit([FromBody] CreateHabitRequest request)
    {
        var habit = _mapper.Map<Habit>(request);
        var createdHabit = await _habitRepository.CreateAsync(habit);
        var habitDto = _mapper.Map<HabitDto>(createdHabit);
        return CreatedAtAction(nameof(GetHabit), new { id = habitDto.Id }, habitDto);
    }
    
    // ... other endpoints
}
```

**HTTP Methods**:
- **GET**: Retrieve data (read-only)
- **POST**: Create new resource
- **PUT**: Update existing resource
- **DELETE**: Remove resource

**Status Codes**:
- **200 OK**: Successful GET/PUT
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

---

#### **API/Controllers/LogsController.cs**

Similar to HabitsController but handles DailyLog operations. Includes validation to ensure habits exist before creating logs.

---

#### **API/Middleware/GlobalExceptionMiddleware.cs**

```csharp
public class GlobalExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);        // Continue to next middleware
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);  // Return error response
        }
    }
}
```

**Purpose**: 
- **Centralized Error Handling**: Catches all unhandled exceptions
- **Consistent Error Responses**: Returns standardized error JSON
- **Logging**: Records errors for debugging
- **Security**: Prevents sensitive error details from leaking to clients

---

#### **API/Mapping/MappingProfile.cs**

```csharp
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Habit, HabitDto>();              // Entity → DTO
        CreateMap<CreateHabitRequest, Habit>();    // Request → Entity
        // ... other mappings
    }
}
```

**Purpose**: AutoMapper configuration for automatic object-to-object mapping. Reduces boilerplate code.

---

### ⚙️ Program.cs - Application Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Register services (Dependency Injection Container)
builder.Services.AddControllers();                    // Enable MVC controllers
builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlite("Data Source=habittracker.db"));// Configure SQLite database
builder.Services.AddAutoMapper(typeof(Program));      // Register AutoMapper
builder.Services.AddScoped<IHabitRepository, HabitRepository>();  // Register repositories

// Configure CORS (Cross-Origin Resource Sharing)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")   // Allow React dev server
              .AllowAnyMethod()                        // Allow GET, POST, PUT, DELETE
              .AllowAnyHeader()                        // Allow any HTTP headers
              .AllowCredentials();                     // Allow cookies/auth
    });
});

var app = builder.Build();

// Configure middleware pipeline (order matters!)
app.UseMiddleware<GlobalExceptionMiddleware>();       // 1. Catch exceptions first
app.UseCors("AllowFrontend");                         // 2. Enable CORS
app.UseHttpsRedirection();                            // 3. Redirect HTTP → HTTPS
app.UseAuthorization();                               // 4. Check permissions
app.MapControllers();                                 // 5. Route to controllers

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DataContext>();
    context.Database.EnsureCreated();                 // Create DB if it doesn't exist
}

app.Run();                                            // Start the server
```

**Key Concepts**:
- **Dependency Injection**: Services are registered and automatically provided where needed
- **Middleware Pipeline**: Request flows through middleware in order
- **Service Lifetimes**:
  - **Scoped**: New instance per HTTP request (repositories, DbContext)
  - **Singleton**: One instance for application lifetime
  - **Transient**: New instance every time

---

## Frontend Architecture (React + Vite)

### 📁 Frontend Structure (To Be Created)

```
frontend/
├── src/
│   ├── api/                # API communication layer
│   │   ├── axios.ts        # Axios instance with base URL
│   │   ├── habits.ts       # Habit API calls
│   │   └── logs.ts         # DailyLog API calls
│   ├── components/         # Reusable UI components
│   │   ├── HabitCard.tsx   # Display single habit
│   │   ├── HabitList.tsx   # Display list of habits
│   │   └── LogForm.tsx     # Form to log habit completion
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts        # Match .NET DTOs
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.ts          # Vite bundler configuration
```

### 🎨 Frontend Technologies

#### **React**
- **Component-Based**: UI is built from reusable components
- **Declarative**: Describe what UI should look like, React handles updates
- **Virtual DOM**: Efficient updates to actual DOM

#### **TypeScript**
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE autocomplete
- **Interfaces**: Define data shapes matching backend DTOs

#### **Vite**
- **Fast Dev Server**: Hot Module Replacement (HMR)
- **Optimized Builds**: Tree-shaking and code splitting
- **Modern Tooling**: Native ES modules

#### **TanStack Query (React Query)**
- **Server State Management**: Caching, refetching, synchronization
- **Automatic Refetching**: Keep data fresh
- **Optimistic Updates**: Update UI before server responds
- **Error Handling**: Built-in retry logic

#### **Axios**
- **HTTP Client**: Promise-based HTTP requests
- **Interceptors**: Modify requests/responses globally
- **Base URL**: Configure API endpoint once

#### **Tailwind CSS**
- **Utility-First**: Style with utility classes
- **Responsive**: Mobile-first responsive design
- **Customizable**: Configure theme and colors

#### **Lucide React**
- **Icon Library**: Beautiful, consistent icons
- **Tree-Shakeable**: Only bundle icons you use

---

### 📝 Frontend Files (To Be Created)

#### **src/types/index.ts**
```typescript
// TypeScript interfaces matching .NET DTOs
export interface HabitDto {
  id: number;
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  createdAt: string;
  userId: number;
}

export interface CreateHabitRequest {
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  userId: number;
}
```

**Purpose**: Type-safe data structures that match backend DTOs exactly.

---

#### **src/api/axios.ts**
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Purpose**: Configured Axios instance used throughout the app.

---

#### **src/api/habits.ts**
```typescript
import { api } from './axios';
import { HabitDto, CreateHabitRequest } from '../types';

export const habitsApi = {
  getAll: (userId: number) => 
    api.get<HabitDto[]>(`/habits?userId=${userId}`),
  
  getById: (id: number) => 
    api.get<HabitDto>(`/habits/${id}`),
  
  create: (data: CreateHabitRequest) => 
    api.post<HabitDto>('/habits', data),
  
  update: (id: number, data: Partial<HabitDto>) => 
    api.put<HabitDto>(`/habits/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/habits/${id}`),
};
```

**Purpose**: Encapsulates all habit-related API calls. Components call these functions instead of using axios directly.

---

#### **src/components/HabitCard.tsx**
```typescript
import { HabitDto } from '../types';
import { CheckCircle } from 'lucide-react';

interface Props {
  habit: HabitDto;
  onLog: (habitId: number) => void;
}

export const HabitCard = ({ habit, onLog }: Props) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-bold">{habit.name}</h3>
      <p className="text-gray-600">{habit.description}</p>
      <button onClick={() => onLog(habit.id)}>
        <CheckCircle className="w-6 h-6" />
      </button>
    </div>
  );
};
```

**Purpose**: Reusable component to display a single habit with log button.

---

## Integration & Deployment

### 🐳 docker-compose.yml (To Be Created)

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
```

**Purpose**: 
- **Containerization**: Package apps with dependencies
- **Orchestration**: Start both services together
- **Isolation**: Each service runs in its own container
- **Portability**: Run anywhere Docker is installed

---

## How Everything Works Together

### 🔄 Request Flow Example: Creating a Habit

1. **User Action**: User fills out form in React and clicks "Create Habit"

2. **Frontend**: 
   ```typescript
   const { mutate } = useMutation(habitsApi.create);
   mutate({ name: "Exercise", description: "30 min daily", ... });
   ```

3. **HTTP Request**: Axios sends POST request to `http://localhost:5000/api/habits`

4. **CORS Middleware**: Checks if request is from allowed origin (`http://localhost:5173`)

5. **Exception Middleware**: Wraps request in try-catch for error handling

6. **Routing**: ASP.NET Core routes request to `HabitsController.CreateHabit()`

7. **Controller**: 
   - Receives `CreateHabitRequest` DTO
   - Uses AutoMapper to convert to `Habit` entity
   - Calls `_habitRepository.CreateAsync(habit)`

8. **Repository**:
   - Adds habit to `_context.Habits`
   - Calls `_context.SaveChangesAsync()`

9. **Entity Framework**:
   - Generates SQL: `INSERT INTO Habits (Name, Description, ...) VALUES (...)`
   - Executes against SQLite database

10. **Response Flow**:
    - Repository returns created habit with ID
    - Controller maps to `HabitDto`
    - Returns `201 Created` with habit data

11. **Frontend**:
    - React Query receives response
    - Updates cache automatically
    - Triggers UI re-render
    - User sees new habit in list

---

### 🎯 Key Architecture Benefits

#### **Separation of Concerns**
- Each layer has a single responsibility
- Changes in one layer don't affect others
- Easy to understand and maintain

#### **Testability**
- Interfaces allow mocking
- Each layer can be tested independently
- Unit tests don't need database

#### **Scalability**
- Can replace SQLite with SQL Server/PostgreSQL
- Can add caching layer
- Can deploy frontend and backend separately

#### **Maintainability**
- Clear structure makes finding code easy
- New developers can understand quickly
- Consistent patterns throughout

---

## 📚 Learning Path Recommendations

### For Beginners:
1. **Start with Entities**: Understand your data models
2. **Learn DTOs**: Why we separate API models from database models
3. **Explore Controllers**: How HTTP requests become method calls
4. **Study Repositories**: Abstraction over data access
5. **Understand Program.cs**: How everything is wired together

### Next Steps:
1. Add authentication (JWT tokens)
2. Implement validation (FluentValidation)
3. Add logging (Serilog)
4. Write unit tests (xUnit)
5. Deploy to cloud (Azure/AWS)

---

## 🔗 Useful Resources

- **Clean Architecture**: Robert C. Martin's book
- **Entity Framework Core**: Microsoft documentation
- **ASP.NET Core**: Microsoft Learn
- **React**: Official React documentation
- **TypeScript**: TypeScript Handbook

---

**Remember**: This architecture might seem complex at first, but each piece serves a purpose. As you work with it, the benefits of separation and organization will become clear. Don't hesitate to experiment and break things - that's how you learn!
