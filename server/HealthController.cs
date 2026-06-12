using Microsoft.AspNetCore.Http;

// Ei controller health check route manage kore.
public static class HealthController
{
    // Ei route diye server alive kina quick check kora jay.
    public static void MapHealthRoutes(this WebApplication app)
    {
        app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
    }
}
