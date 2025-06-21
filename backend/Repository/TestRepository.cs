using IELTS_System.Data;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.EntityFrameworkCore;

namespace IELTS_System.Repository;

public class TestRepository : ITestRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<TestRepository> _logger;
    private readonly IRedisCacheService _redisCacheService;
    // Cache keys and timeout constants
    private const string ALL_TESTS_CACHE_KEY = "tests_all_";
    private const string TEST_BY_ID_CACHE_KEY = "test_id_";
    private const string TEST_FULL_CACHE_KEY = "test_full_";
    private const string TEST_BY_TYPE_CACHE_KEY = "test_type_";
    private const int STANDARD_CACHE_TIMEOUT = 15; 

    public TestRepository(AppDbContext context, ILogger<TestRepository> logger, IRedisCacheService redisCacheService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _redisCacheService = redisCacheService ?? throw new ArgumentNullException(nameof(redisCacheService));
    }
    
    public async Task<Test> CreateAsync(Test test)
    {
        if(test == null) throw new ArgumentNullException(nameof(test));
        _context.Entry(test.TestType).State = EntityState.Unchanged;
        await _context.Tests.AddAsync(test);
        await _context.SaveChangesAsync();
        _logger.LogInformation($"Test with id {test.TestId} created successfully");
        
        // Cache clear
        await InvalidateTestByTypeCacheAsync(test.TestTypeId);
        await InvalidateAllTestsCacheAsync();
        return test;
    }

    
    public async Task<Test?> GetByIdAsync(Guid id)
    {
        string cacheKey = $"{TEST_BY_ID_CACHE_KEY}{id}";
        
        return await _redisCacheService.GetOrCreateAsync(
            cacheKey,
            async () => {
                _logger.LogInformation($"Cache miss for test ID {id}, fetching from database");
                return await _context.Tests
                    .Include(t => t.TestType)
                    .Include(t => t.TestParts.OrderBy(tp => tp.PartNumber))
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.TestId == id);
            },
            STANDARD_CACHE_TIMEOUT
        );

    }

    public async Task<Test?> GetFullTestByIdAsync(Guid id)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Test ID cannot be empty", nameof(id));
        }
        
        // Define a cache key for this specific test
        string cacheKey = $"test_full_{id}";
        
        try
        {
            // Check if the test is already in the cache
            var cachedTest = await _redisCacheService.GetDataAsync<Test>(cacheKey);
            if (cachedTest != null)
            {
                _logger.LogInformation("Retrieved full test ID {TestId} from cache", id);
                return cachedTest;
            }
            
            // Cache miss, load from the database
            _logger.LogInformation("Cache miss for full test ID {TestId}, fetching from database", id);
            
            // Your existing loading logic
            var test = await _context.Tests
                .AsNoTracking()
                .Include(t => t.TestType)
                .Include(t => t.TestParts)
                .FirstOrDefaultAsync(t => t.TestId == id);
            
            if (test == null)
                return null;
            
            // Then for each part, load its sections and questions
            foreach (var part in test.TestParts)
            {
                // Load sections for this part
                var sections = await _context.Sections
                    .AsNoTracking()
                    .Where(s => s.PartId == part.PartId)
                    .OrderBy(s => s.SectionNumber)
                    .ToListAsync();
                
                part.Sections = sections;
                _logger.LogInformation($"Loaded {sections.Count} sections for part {part.PartNumber}");
                
                // Load questions for each section
                foreach (var section in sections)
                {
                    var questions = await _context.Questions
                        .AsNoTracking()
                        .Where(q => q.SectionId == section.SectionId)
                        .OrderBy(q => q.QuestionNumber)
                        .Include(q => q.Answer)
                        .ToListAsync();
                    
                    // Important: Break circular references before caching
                    foreach (var question in questions)
                    {
                        // Set the parent section to null to avoid circular references
                        question.Section = null!;
                        
                        // If there's an answer, also break that circular reference
                        if (question.Answer != null)
                        {
                            question.Answer.Question = null!;
                        }
                    }
                    
                    section.Questions = questions;
                    
                    // Also break the parent reference
                    section.TestPart = null!;
                }
                
                // Break part to test circular reference
                part.Test = null!;
            }
            
            // Break test to test type circular reference
            test.TestType.Tests = null!;

            // Cache the test with the broken circular references
            await _redisCacheService.SetDataAsync(cacheKey, test, 30);
            
            return test;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading full test with ID {TestId}", id);
            
            // If caching fails for any reason, load directly from the database as fallback
            return await LoadFullTestFromDatabaseAsync(id);
        }
    }

    // Fallback method to load directly from the database if caching fails
    private async Task<Test?> LoadFullTestFromDatabaseAsync(Guid id)
    {
        // Your original loading logic without caching
        var test = await _context.Tests
            .AsNoTracking()
            .Include(t => t.TestType)
            .Include(t => t.TestParts)
            .FirstOrDefaultAsync(t => t.TestId == id);
        
        if (test == null)
            return null;
        
        // Then for each part, load its sections and questions
        foreach (var part in test.TestParts)
        {
            // Load sections for this part
            var sections = await _context.Sections
                .AsNoTracking()
                .Where(s => s.PartId == part.PartId)
                .OrderBy(s => s.SectionNumber)
                .ToListAsync();
            
            part.Sections = sections;
            
            // Load questions for each section
            foreach (var section in sections)
            {
                var questions = await _context.Questions
                    .AsNoTracking()
                    .Where(q => q.SectionId == section.SectionId)
                    .OrderBy(q => q.QuestionNumber)
                    .Include(q => q.Answer)
                    .ToListAsync();
                
                section.Questions = questions;
            }
        }
        
        return test;
    }

    public async Task<IEnumerable<Test>> GetByTestNamesAsync(string testName, int pageNumber = 1, int pageSize = 10)
    {
        if (string.IsNullOrEmpty(testName))
        {
            throw new ArgumentException("Test name cannot be null or empty", nameof(testName));
        }
        return await _context.Tests
            .Include(t => t.TestType)
            .Where(t => t.TestName.Contains(testName))
            .AsNoTracking()
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }


    public async Task<IEnumerable<Test>> GetByTestTypeAsync(Guid testTypeId, int pageNumber = 1, int pageSize = 10)
    {
        if (testTypeId == Guid.Empty)
        {
            throw new ArgumentException("Test name cannot be null or empty", nameof(testTypeId));
        }
        string cacheKey = $"{TEST_BY_TYPE_CACHE_KEY}{testTypeId}_page{pageNumber}_size{pageSize}";
        
        return await _redisCacheService.GetOrCreateAsync(
            cacheKey,
            async () => {
                _logger.LogInformation($"Cache miss for tests with type ID {testTypeId}, fetching from database");
                return await _context.Tests
                    .Include(t => t.TestType)
                    .Where(t => t.TestTypeId == testTypeId)
                    .AsNoTracking()
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            },
            STANDARD_CACHE_TIMEOUT
        );

    }

    public async Task<IEnumerable<Test>> GetAllAsync(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
        if (pageSize < 1) throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));
        
        string cacheKey = $"{ALL_TESTS_CACHE_KEY}page{pageNumber}_size{pageSize}";
        
        return await _redisCacheService.GetOrCreateAsync(
            cacheKey,
            async () => {
                _logger.LogInformation($"Cache miss for all tests page {pageNumber}, fetching from database");
                return await _context.Tests
                    .Include(t => t.TestType)
                    .OrderBy(t => t.TestName)  // Add explicit ordering
                    .AsNoTracking()
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            },
            STANDARD_CACHE_TIMEOUT
        );
    }




    public async Task<Test> UpdateAsync(Test test)
    {
        if (test == null) throw new ArgumentNullException(nameof(test));

        var existingTest = await _context.Tests.FindAsync(test.TestId);
        if (existingTest == null)
            throw new KeyNotFoundException($"Test with ID {test.TestId} not found");

        test.LastUpdatedDate = DateTime.UtcNow;
        _context.Entry(existingTest).CurrentValues.SetValues(test);
        await _context.SaveChangesAsync();
        
        // Cache clear
        await InvalidateTestCacheAsync(test.TestId);
        await InvalidateTestByTypeCacheAsync(test.TestTypeId);
        await InvalidateAllTestsCacheAsync();
        return test;

    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var test = await _context.Tests.FindAsync(id);
        if(test == null) return false;
        
        _context.Tests.Remove(test);
        await _context.SaveChangesAsync();
        _logger.LogInformation($"Test with id {id} deleted successfully");
        
        // Cache clear
        await InvalidateTestCacheAsync(test.TestId);
        await InvalidateTestByTypeCacheAsync(test.TestTypeId);
        await InvalidateAllTestsCacheAsync();
        return true;
    }
    
    // Helper methods for cache invalidation
    private async Task InvalidateAllTestsCacheAsync()
    {
        try
        {
            // Use pattern-based cache clearing to remove all test-related caches
            await _redisCacheService.ClearByPatternAsync("tests_all_");
            
            _logger.LogInformation("All test-related cache entries successfully invalidated");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating all test caches");
        }
    }

    private async Task InvalidateTestCacheAsync(Guid testId)
    {
        try
        {
            await _redisCacheService.RemoveDataAsync($"{TEST_BY_ID_CACHE_KEY}{testId}");
            await _redisCacheService.RemoveDataAsync($"{TEST_FULL_CACHE_KEY}{testId}");
            
            _logger.LogInformation("Cache for test ID {TestId} invalidated", testId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating cache for test ID {TestId}", testId);
        }
    }
    
    private async Task InvalidateTestByTypeCacheAsync(Guid typeId)
    {
        try
        {
            if (typeId == Guid.Empty)
            {
                return;
            }
            // Clear all entries for this test type with any pagination
            await _redisCacheService.ClearByPatternAsync($"{TEST_BY_TYPE_CACHE_KEY}{typeId}");
            
            _logger.LogInformation("Cache for tests with type ID {TypeId} invalidated", typeId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error invalidating cache for tests with type ID {TypeId}", typeId);
        }
    }


}