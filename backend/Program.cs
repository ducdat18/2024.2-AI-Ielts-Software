// ========================================
// FIXED: Program.cs (Remove WithOpenApi)
// ========================================

using System.Text;
using IELTS_System.Data;
using IELTS_System.Extension;
using IELTS_System.Interfaces;
using IELTS_System.Repository;
using IELTS_System.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "IELTS Online Test", Version = "v1" });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {token}' (without quotes) in the text input below."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ✅ FIXED CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", corsPolicyBuilder =>
    {
        corsPolicyBuilder
            .WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000",  // Create React App
                "http://localhost:8080",  // Vue/Other
                "https://localhost:5173", // HTTPS versions
                "https://localhost:3000"
            )
            .AllowAnyMethod()     // Allow any HTTP method
            .AllowAnyHeader()     // Allow any HTTP headers
            .AllowCredentials();  // Allow credentials (cookies, authorization headers)
    });
});

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
    // Extract JWT from cookies
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["auth_token"];
            return Task.CompletedTask;
        }
    };
});

// Add Memory Cache
builder.Services.AddMemoryCache();
// Add Serilog
builder.Host.SerilogConfiguration();
// Add HttpContextAccessor to the service collection
builder.Services.AddHttpContextAccessor();

// Add IRepository to the DI container
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITestTypeRepository, TestTypeRepository>();
builder.Services.AddScoped<ITestRepository, TestRepository>();
builder.Services.AddScoped<ITestPartRepository, TestPartRepository>();
builder.Services.AddScoped<ISectionRepository, SectionRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IAnswerRepository, AnswerRepository>();
builder.Services.AddScoped<ITestUpdateService, TestUpdateService>();
builder.Services.AddScoped<IUserTestRepository, UserTestRepository>();
builder.Services.AddScoped<IUserResponseRepository, UserResponseRepository>();

// Add IServices to the DI container
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddTransient<IJwtService, JwtService>();
builder.Services.AddScoped<IRedisCacheService, RedisCacheService>();

// Add connection to the PostgresSQL database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Redis connection
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!));
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "IELTS_System_";
});

// Add authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("admin"));
    options.AddPolicy("RequireUserRole", policy => policy.RequireRole("user", "admin"));
});

var app = builder.Build();

// ✅ FIXED Middleware Pipeline Order
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "IELTS Online Test API V1");
        c.RoutePrefix = "swagger"; // Set Swagger UI at /swagger
    });
}

// ✅ IMPORTANT: CORS must be before Authentication/Authorization
app.UseCors("CorsPolicy");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ✅ FIXED: Health check endpoint without WithOpenApi
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0.0",
    service = "IELTS Online Test API"
}));

app.Run();

builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
