namespace IELTS_System.Interfaces;

/// <summary>
/// Interface defining Redis cache operations for storing and retrieving data.
/// Provides both asynchronous and synchronous methods for cache operations.
/// </summary>
public interface IRedisCacheService
{
    // Async methods
    
    /// <summary>
    /// Asynchronously retrieves data of type T from the cache using the specified key.
    /// </summary>
    /// <typeparam name="T">Type of data to retrieve.</typeparam>
    /// <param name="key">Unique cache key.</param>
    /// <returns>Cached data or default(T) if not found.</returns>
    Task<T?> GetDataAsync<T>(string key);
    
    /// <summary>
    /// Asynchronously stores data in the cache with the specified key and expiration time.
    /// </summary>
    /// <typeparam name="T">Type of data to store.</typeparam>
    /// <param name="key">Unique cache key.</param>
    /// <param name="data">Data to cache.</param>
    /// <param name="timeOut">Cache expiration time in minutes (default: 10).</param>
    Task SetDataAsync<T>(string key, T data, int timeOut = 10);
    
    /// <summary>
    /// Asynchronously removes data from the cache using the specified key.
    /// </summary>
    /// <param name="key">Unique cache key to remove.</param>
    Task RemoveDataAsync(string key);
    
    /// <summary>
    /// Asynchronously gets data from cache if it exists, or creates and caches new data using the factory function.
    /// This provides an atomic get-or-create operation to prevent cache stampede.
    /// </summary>
    /// <typeparam name="T">Type of data to retrieve or create.</typeparam>
    /// <param name="key">Unique cache key.</param>
    /// <param name="factory">Function to create data if not in cache.</param>
    /// <param name="timeOut">Cache expiration time in minutes (default: 10).</param>
    /// <returns>Data from cache or newly created data.</returns>
    Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, int timeOut = 10);
    
    /// <summary>
    /// Asynchronously clears all data from the cache.
    /// Use with caution as this affects all cache entries.
    /// </summary>
    Task ClearAllAsync();
    
    /// <summary>
    /// Asynchronously clears cache entries matching the specified pattern.
    /// Useful for invalidating groups of related cache entries.
    /// </summary>
    /// <param name="pattern">Pattern to match cache keys (e.g., "user_*").</param>
    Task ClearByPatternAsync(string pattern);

    // Sync methods 
    
    /// <summary>
    /// Synchronously retrieves data of type T from the cache using the specified key.
    /// Consider using the async version for better performance in web applications.
    /// </summary>
    /// <typeparam name="T">Type of data to retrieve.</typeparam>
    /// <param name="key">Unique cache key.</param>
    /// <returns>Cached data or default(T) if not found.</returns>
    T? GetData<T>(string key);
    
    /// <summary>
    /// Synchronously stores data in the cache with the specified key and expiration time.
    /// Consider using the async version for better performance in web applications.
    /// </summary>
    /// <typeparam name="T">Type of data to store.</typeparam>
    /// <param name="key">Unique cache key.</param>
    /// <param name="data">Data to cache.</param>
    /// <param name="timeOut">Cache expiration time in minutes (default: 10).</param>
    void SetData<T>(string key, T data, int timeOut = 10);
    
    /// <summary>
    /// Synchronously removes data from the cache using the specified key.
    /// Consider using the async version for better performance in web applications.
    /// </summary>
    /// <param name="key">Unique cache key to remove.</param>
    void RemoveData(string key);
    
    /// <summary>
    /// Synchronously clears all data from the cache.
    /// Use with caution as this affects all cache entries.
    /// Consider using the async version for better performance in web applications.
    /// </summary>
    void ClearAll();
}