using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;

// Ei service admin login token memory te rakhe ebong session validate kore.
public sealed class AdminSessionService
{
    private const string CookieName = "sgipc_admin";

    // Ei block e active session list ebong default admin credential set kora hocche.
    private readonly ConcurrentDictionary<string, DateTime> _sessions = new();
    private readonly string _adminUser = Environment.GetEnvironmentVariable("ADMIN_USER") ?? "Shah_Makhdum";
    private readonly string _adminPass = Environment.GetEnvironmentVariable("ADMIN_PASS") ?? "sharif89";

    // Ei method cookie token check kore admin ekhono logged in kina bole.
    public bool IsAdminSession(HttpRequest req)
    {
        if (!req.Cookies.TryGetValue(CookieName, out var token)) return false;
        if (string.IsNullOrEmpty(token)) return false;
        if (!_sessions.TryGetValue(token, out var expiry)) return false;
        if (expiry < DateTime.UtcNow)
        {
            _sessions.TryRemove(token, out _);
            return false;
        }

        _sessions[token] = DateTime.UtcNow.AddHours(4);
        return true;
    }

    // Ei method credential match hole notun admin session cookie create kore.
    public bool Login(AdminLogin input, HttpResponse response)
    {
        if (input.Username != _adminUser || input.Password != _adminPass) return false;

        var token = Guid.NewGuid().ToString("N");
        _sessions[token] = DateTime.UtcNow.AddHours(4);
        response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddHours(4)
        });
        return true;
    }

    // Ei method admin session remove kore logout complete kore.
    public void Logout(HttpRequest req, HttpResponse response)
    {
        if (req.Cookies.TryGetValue(CookieName, out var token))
        {
            _sessions.TryRemove(token, out _);
            response.Cookies.Delete(CookieName);
        }
    }
}
