using System.Text.Json;
using System.Text.Json.Serialization;
using IELTS_System.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using StackExchange.Redis;

namespace IELTS_System.Services;

public class RedisCacheService : IRedisCacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly IConnectionMultiplexer _redisConnection;


    public RedisCacheService(IDistributedCache cache, ILogger<RedisCacheService> logger, IConnectionMultiplexer connectionMultiplexer)
    {
        _cache = cache;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = ReferenceHandler.Preserve,
            MaxDepth = 128,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
        _redisConnection = connectionMultiplexer;
    }
    
    // Asynchronous methods
    public async Task<T?> GetDataAsync<T>(string key)
    {
        var data = await _cache.GetStringAsync(key);
        if (data == null)
        {
            _logger.LogDebug("Cache miss for key: {Key}", key);
            return default(T);
        }

        _logger.LogDebug("Cache hit for key: {Key}", key);
        return JsonSerializer.Deserialize<T>(data, _jsonOptions);
    }

    public async Task SetDataAsync<T>(string key, T data, int timeOut = 10)
    {
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(timeOut)
        };
        
        await _cache.SetStringAsync(
            key, 
            JsonSerializer.Serialize(data, _jsonOptions), 
            options
        );
        
        _logger.LogDebug("Cache set for key: {Key} with timeout: {Timeout} minutes", key, timeOut);
    }
    
    public async Task RemoveDataAsync(string key)
    {
        await _cache.RemoveAsync(key);
        _logger.LogDebug("Cache removed for key: {Key}", key);
    }
    
    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, int timeOut = 10)
    {
        var cachedValue = await GetDataAsync<T>(key);
        
        if (cachedValue != null)
        {
            return cachedValue;
        }
        
        // Cache misses, execute factory to get data
        var result = await factory();
        
        // Only cache if the result is not null (guard against caching null values)
        if (result != null)
        {
            await SetDataAsync(key, result, timeOut);
        }
        
        return result;
    }

    public async Task ClearAllAsync()
    {
        try
        {
            var server = _redisConnection.GetServer(_redisConnection.GetEndPoints().First());
            var keys = server.Keys(pattern: "IELTS_System_*").ToArray();
            
            foreach (var key in keys)
            {
                await _redisConnection.GetDatabase().KeyDeleteAsync(key);
            }
            
            _logger.LogInformation("Successfully cleared all cache data. Removed {Count} keys.", keys.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing all cache data");
            throw;
        }
    }


    public async Task ClearByPatternAsync(string pattern)
    {
        try
        {
            var server = _redisConnection.GetServer(_redisConnection.GetEndPoints().First());
            var keys = server.Keys(pattern: $"IELTS_System_{pattern}*").ToArray();
            
            foreach (var key in keys)
            {
                await _redisConnection.GetDatabase().KeyDeleteAsync(key);
            }
            
            _logger.LogInformation("Successfully cleared cache for pattern '{Pattern}'. Removed {Count} keys.", 
                pattern, keys.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cache by pattern: {Pattern}", pattern);
            throw;
        }
    }


    // Synchronous methods 
    public T? GetData<T>(string key)
    {
        var data = _cache.GetString(key);
        if (data == null)
        {
            return default(T);
        }
        return JsonSerializer.Deserialize<T>(data, _jsonOptions);
    }

    public void SetData<T>(string key, T data, int timeOut = 10)
    {
        var options = new DistributedCacheEntryOptions()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(timeOut)
        };
        _cache.SetString(key, JsonSerializer.Serialize(data, _jsonOptions), options);
    }
    
    public void RemoveData(string key)
    {
        _cache.Remove(key);
    }
    
    public void ClearAll()
    {
        try
        {
            var server = _redisConnection.GetServer(_redisConnection.GetEndPoints().First());
            var keys = server.Keys(pattern: "IELTS_System_*").ToArray();
            
            foreach (var key in keys)
            {
                _redisConnection.GetDatabase().KeyDelete(key);
            }
            
            _logger.LogInformation("Successfully cleared all cache data. Removed {Count} keys.", keys.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing all cache data");
            throw;
        }
    }

}