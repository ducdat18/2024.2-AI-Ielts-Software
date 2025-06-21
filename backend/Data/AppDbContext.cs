using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Test - TestType -> Many - One
        modelBuilder.Entity<Test>()
            .HasOne(t => t.TestType)
            .WithMany(tt => tt.Tests)
            .HasForeignKey(t => t.TestTypeId);
        // TestPart - Test -> Many - One
        modelBuilder.Entity<TestPart>()
            .HasOne(tp => tp.Test)
            .WithMany(t => t.TestParts)
            .HasForeignKey(tp => tp.TestId);
        // Section - TestPart -> Many - One
        modelBuilder.Entity<Section>()
            .HasOne(sec => sec.TestPart)
            .WithMany(tp => tp.Sections)
            .HasForeignKey(sec => sec.PartId);
        // Question - Section -> Many - One
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Section)
            .WithMany(sec => sec.Questions)
            .HasForeignKey(q => q.SectionId);
        modelBuilder.Entity<Answer>()
            .HasOne(a => a.Question)
            .WithOne(q => q.Answer)
            .HasForeignKey<Answer>(a => a.QuestionId)
            .IsRequired();
        modelBuilder.Entity<UserTest>(entity =>
        {
            entity.HasOne(ut => ut.User)
                .WithMany(u => u.UserTests)
                .HasForeignKey(ut => ut.UserId);

            entity.HasOne(ut => ut.Test)
                .WithMany(t => t.UserTests)
                .HasForeignKey(ut => ut.TestId);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Tests)
                .WithMany(t => t.Users)
                .UsingEntity<UserTest>();
        });
        modelBuilder.Entity<UserResponse>( entity =>
        {
            entity.HasOne(ur => ur.UserTest)
                .WithMany(ut => ut.UserResponses)
                .HasForeignKey(ur => ur.UserTestId);
            entity.HasOne(ur => ur.Question)
                .WithMany(q => q.UserResponses)
                .HasForeignKey(ur => ur.QuestionId);
        });
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Test> Tests { get; set; }
    public DbSet<TestType> TestTypes { get; set; }
    public DbSet<TestPart> TestParts { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<UserTest> UserTests { get; set; }
    public DbSet<UserResponse> UserResponses { get; set; }
    
}