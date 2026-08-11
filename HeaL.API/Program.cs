using HeaL.API.Data;
using HeaL.API.Repositories;
using HeaL.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ THÊM CORS - Cho phép tất cả (chỉ dùng dev)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Đăng ký DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Đăng ký Repository và Service
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IComboService, ComboService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    const string adminEmail = "admin@heal.com";
    const string adminPassword = "123456";

    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new HeaL.API.Models.Entities.Category { Name = "Cà phê", Description = "Cà phê nóng và đá", Image = "", IsActive = true, DisplayOrder = 1 },
            new HeaL.API.Models.Entities.Category { Name = "Trà", Description = "Trà sữa và trà hoa quả", Image = "", IsActive = true, DisplayOrder = 2 },
            new HeaL.API.Models.Entities.Category { Name = "Đồ ăn nhẹ", Description = "Bánh, snack và món ăn nhanh", Image = "", IsActive = true, DisplayOrder = 3 }
        );
    }

    var adminUser = db.Users.FirstOrDefault(u => u.Email == adminEmail);

    if (adminUser == null)
    {
        db.Users.Add(new HeaL.API.Models.Entities.User
        {
            FullName = "Admin HeaL",
            Email = adminEmail,
            Phone = "0123456789",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }
    else if (!BCrypt.Net.BCrypt.Verify(adminPassword, adminUser.PasswordHash))
    {
        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
        adminUser.Role = "Admin";
        adminUser.IsActive = true;
        db.SaveChanges();
    }

    db.SaveChanges();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ SỬ DỤNG CORS - PHẢI ĐẶT TRƯỚC UseAuthentication và UseAuthorization
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();