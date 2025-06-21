using Serilog;

namespace IELTS_System.Extension;

public static class SerilogExtension
{
    public static void SerilogConfiguration(this IHostBuilder host)
    {
        host.UseSerilog((context, loggerConfig) =>
        {
            loggerConfig.WriteTo.Console();
            /*
             loggerConfig.WriteTo.File(
                path: "Logs/log_.log",
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}",
                rollingInterval: RollingInterval.Day); 
            */
        });
    }
}