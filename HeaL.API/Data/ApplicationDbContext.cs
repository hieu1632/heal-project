using HeaL.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeaL.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductSize> ProductSizes { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Combo> Combos { get; set; }
        public DbSet<ComboItem> ComboItems { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ---- Cấu hình Decimal Precision cho toàn bộ ----
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                    {
                        property.SetPrecision(18);
                        property.SetScale(2);
                    }
                }
            }

            // ---- Cấu hình riêng cho DiscountPercent (5,2) ----
            modelBuilder.Entity<Combo>(entity =>
            {
                entity.Property(c => c.DiscountPercent).HasPrecision(5, 2);
            });

            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.Property(v => v.DiscountPercent).HasPrecision(5, 2);
            });

            // ---- Cấu hình Cart ----
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.HasIndex(c => new { c.UserId, c.ProductSizeId })
                      .IsUnique()
                      .HasFilter("[ProductSizeId] IS NOT NULL");

                entity.HasIndex(c => new { c.UserId, c.ComboId })
                      .IsUnique()
                      .HasFilter("[ComboId] IS NOT NULL");

                entity.HasOne(c => c.User)
                      .WithMany(u => u.Carts)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.ProductSize)
                      .WithMany()
                      .HasForeignKey(c => c.ProductSizeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Combo)
                      .WithMany()
                      .HasForeignKey(c => c.ComboId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Cấu hình User ----
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.FullName).HasMaxLength(100);
                entity.Property(u => u.Email).HasMaxLength(100);
                entity.Property(u => u.Phone).HasMaxLength(20);
                entity.Property(u => u.Role).HasMaxLength(20);
            });

            // ---- Cấu hình Category ----
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Name).IsUnique();
                entity.Property(c => c.Name).HasMaxLength(100);
            });

            // ---- Cấu hình Product ----
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Name).HasMaxLength(200);
                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Cấu hình ProductSize ----
            modelBuilder.Entity<ProductSize>(entity =>
            {
                entity.HasIndex(ps => new { ps.ProductId, ps.SizeName }).IsUnique();
                entity.Property(ps => ps.SizeName).HasMaxLength(20);
                entity.HasOne(ps => ps.Product)
                      .WithMany(p => p.ProductSizes)
                      .HasForeignKey(ps => ps.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Cấu hình Order ----
            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.Status).HasMaxLength(20);
                entity.Property(o => o.PaymentMethod).HasMaxLength(50);
                entity.Property(o => o.Address).HasMaxLength(500);
                entity.Property(o => o.Phone).HasMaxLength(20);
                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(o => o.Voucher)
                      .WithMany(v => v.Orders)
                      .HasForeignKey(o => o.VoucherId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ---- Cấu hình OrderDetail ----
            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.Property(od => od.ProductName).HasMaxLength(200);
                entity.Property(od => od.SizeName).HasMaxLength(20);
                entity.HasOne(od => od.Order)
                      .WithMany(o => o.OrderDetails)
                      .HasForeignKey(od => od.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(od => od.ProductSize)
                      .WithMany(ps => ps.OrderDetails)
                      .HasForeignKey(od => od.ProductSizeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ---- Cấu hình Voucher ----
            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.HasIndex(v => v.Code).IsUnique();
                entity.Property(v => v.Code).HasMaxLength(50);
                entity.Property(v => v.Description).HasMaxLength(500);
            });

            // ---- Cấu hình UserVoucher ----
            modelBuilder.Entity<UserVoucher>(entity =>
            {
                entity.HasIndex(uv => new { uv.UserId, uv.VoucherId }).IsUnique();
                entity.HasOne(uv => uv.User)
                      .WithMany(u => u.UserVouchers)
                      .HasForeignKey(uv => uv.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(uv => uv.Voucher)
                      .WithMany(v => v.UserVouchers)
                      .HasForeignKey(uv => uv.VoucherId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Cấu hình Favorite ----
            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasIndex(f => new { f.UserId, f.ProductId }).IsUnique();
                entity.HasOne(f => f.User)
                      .WithMany(u => u.Favorites)
                      .HasForeignKey(f => f.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(f => f.Product)
                      .WithMany(p => p.Favorites)
                      .HasForeignKey(f => f.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Cấu hình Review ----
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();
                entity.Property(r => r.Comment).HasMaxLength(1000);
                entity.HasOne(r => r.User)
                      .WithMany(u => u.Reviews)
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(r => r.Product)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(r => r.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Cấu hình Banner ----
            modelBuilder.Entity<Banner>(entity =>
            {
                entity.Property(b => b.Title).HasMaxLength(200);
                entity.Property(b => b.Link).HasMaxLength(500);
            });

            // ---- Cấu hình Combo ----
            modelBuilder.Entity<Combo>(entity =>
            {
                entity.Property(c => c.Name).HasMaxLength(200);
                entity.Property(c => c.Description).HasMaxLength(500);
                entity.Property(c => c.Type).HasMaxLength(20);
                entity.HasMany(c => c.ComboItems)
                      .WithOne(ci => ci.Combo)
                      .HasForeignKey(ci => ci.ComboId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ---- Cấu hình ComboItem ----
            modelBuilder.Entity<ComboItem>(entity =>
            {
                entity.HasOne(ci => ci.Product)
                      .WithMany()
                      .HasForeignKey(ci => ci.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ci => ci.ProductSize)
                      .WithMany()
                      .HasForeignKey(ci => ci.ProductSizeId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}