using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller admin login/logout/session route manage kore.
public static class AdminController
{
    // Ei block e admin authentication related route register kora hoy.
    public static void MapAdminRoutes(this WebApplication app, AdminSessionService adminSessions)
    {
        // Ei route credential check kore admin login cookie set kore.
        app.MapPost("/api/admin/login", async (HttpRequest req) =>
        {
            try
            {
                var input = await JsonSerializer.DeserializeAsync<AdminLogin>(req.Body);
                if (input == null) return Results.BadRequest();
                if (!adminSessions.Login(input, req.HttpContext.Response)) return Results.Unauthorized();
                return Results.Ok(new { authenticated = true });
            }
            catch
            {
                return Results.BadRequest();
            }
        });

        // Ei route admin session clear kore logout kore.
        app.MapPost("/api/admin/logout", (HttpRequest req) =>
        {
            adminSessions.Logout(req, req.HttpContext.Response);
            return Results.Ok(new { loggedOut = true });
        });

        // Ei route current browser admin authenticated kina return kore.
        app.MapGet("/api/admin/session", (HttpRequest req) =>
        {
            return Results.Ok(new { authenticated = adminSessions.IsAdminSession(req) });
        });
    }
}
