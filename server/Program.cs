using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("AllowAll");

// Simple in-memory admin session store (token => expiry).
var adminSessions = new ConcurrentDictionary<string, DateTime>();
var adminUser = Environment.GetEnvironmentVariable("ADMIN_USER") ?? "Shah_Makhdum";
var adminPass = Environment.GetEnvironmentVariable("ADMIN_PASS") ?? "sharif89";

bool IsAdminSession(HttpRequest req)
{
    if (!req.Cookies.TryGetValue("sgipc_admin", out var token)) return false;
    if (string.IsNullOrEmpty(token)) return false;
    if (!adminSessions.TryGetValue(token, out var expiry)) return false;
    if (expiry < DateTime.UtcNow) { adminSessions.TryRemove(token, out _); return false; }
    // refresh expiry
    adminSessions[token] = DateTime.UtcNow.AddHours(4);
    return true;
}

// data file path (server/data/events.json)
var dataDir = Path.Combine(AppContext.BaseDirectory, "data");
Directory.CreateDirectory(dataDir);
var dataFile = Path.Combine(dataDir, "events.json");
var committeeFile = Path.Combine(dataDir, "current-committee.json");
var alumniFile = Path.Combine(dataDir, "alumni.json");

static List<EventItem> LoadEvents(string path)
{
    try
    {
        if (!File.Exists(path)) return new List<EventItem>();
        var txt = File.ReadAllText(path);
        return JsonSerializer.Deserialize<List<EventItem>>(txt) ?? new List<EventItem>();
    }
    catch
    {
        return new List<EventItem>();
    }
}

static void SaveEvents(string path, List<EventItem> list)
{
    var opts = new JsonSerializerOptions { WriteIndented = true };
    var txt = JsonSerializer.Serialize(list, opts);
    File.WriteAllText(path, txt);
}

static List<CommitteeMember> LoadCommittee(string path)
{
    try
    {
        if (!File.Exists(path)) return new List<CommitteeMember>();
        var txt = File.ReadAllText(path);
        return JsonSerializer.Deserialize<List<CommitteeMember>>(txt) ?? new List<CommitteeMember>();
    }
    catch
    {
        return new List<CommitteeMember>();
    }
}

static void SaveCommittee(string path, List<CommitteeMember> list)
{
    var opts = new JsonSerializerOptions { WriteIndented = true };
    var txt = JsonSerializer.Serialize(list, opts);
    File.WriteAllText(path, txt);
}

static Dictionary<string, List<CommitteeMember>> LoadAlumni(string path)
{
    try
    {
        if (!File.Exists(path)) return new Dictionary<string, List<CommitteeMember>>();
        var txt = File.ReadAllText(path);
        return JsonSerializer.Deserialize<Dictionary<string, List<CommitteeMember>>>(txt) ?? new Dictionary<string, List<CommitteeMember>>();
    }
    catch
    {
        return new Dictionary<string, List<CommitteeMember>>();
    }
}

static void SaveAlumni(string path, Dictionary<string, List<CommitteeMember>> dict)
{
    var opts = new JsonSerializerOptions { WriteIndented = true };
    var txt = JsonSerializer.Serialize(dict, opts);
    File.WriteAllText(path, txt);
}

// Serve a simple health endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/events", () => {
    var events = LoadEvents(dataFile);
    var now = DateTime.UtcNow;
    var upcoming = events.Where(e => e.DateTimeUtc > now).OrderBy(e => e.DateTimeUtc).ToList();
    var past = events.Where(e => e.DateTimeUtc <= now).OrderByDescending(e => e.DateTimeUtc).ToList();
    return Results.Ok(new { upcoming, past });
});

app.MapGet("/api/committee", () => {
    var members = LoadCommittee(committeeFile);
    return Results.Ok(members);
});

// Alumni endpoints
app.MapGet("/api/alumni", (HttpRequest req) => {
    var dict = LoadAlumni(alumniFile);
    var years = dict.Keys.OrderByDescending(y => y).ToList();
    return Results.Ok(years);
});

app.MapGet("/api/alumni/{year}", (string year) => {
    var dict = LoadAlumni(alumniFile);
    if (!dict.ContainsKey(year)) return Results.NotFound();
    return Results.Ok(dict[year]);
});

// Fallback endpoint (query param) in case path-based route has issues on some hosts
app.MapGet("/api/alumniByYear", (HttpRequest req) => {
    var year = req.Query["year"].ToString();
    if (string.IsNullOrWhiteSpace(year)) return Results.BadRequest(new { error = "year required" });
    var dict = LoadAlumni(alumniFile);
    if (!dict.ContainsKey(year)) return Results.NotFound();
    return Results.Ok(dict[year]);
});

app.MapDelete("/api/alumni/{year}", (HttpRequest req, string year) => {
    try
    {
        if (!IsAdminSession(req)) return Results.Unauthorized();
        var dict = LoadAlumni(alumniFile);
        if (!dict.ContainsKey(year)) return Results.NotFound();
        dict.Remove(year);
        SaveAlumni(alumniFile, dict);
        return Results.Ok(new { deleted = true, year = year });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapPost("/api/alumni/archive", async (HttpRequest req) => {
    try
    {
        if (!IsAdminSession(req)) return Results.Unauthorized();

        // Accept JSON body { "year": "2025" } for reliability across hosts
        string? year = null;
        try
        {
            var payload = await JsonSerializer.DeserializeAsync<Dictionary<string,string>>(req.Body);
            if (payload != null && payload.TryGetValue("year", out var y)) year = y;
        }
        catch
        {
            // ignore - will validate below
        }

        if (string.IsNullOrWhiteSpace(year)) return Results.BadRequest(new { error = "year required in request body" });

        var members = LoadCommittee(committeeFile);
        var dict = LoadAlumni(alumniFile);
        if (dict.ContainsKey(year)) return Results.Conflict(new { error = "year already exists in alumni" });

        dict[year] = members;
        SaveAlumni(alumniFile, dict);

        // clear current committee
        SaveCommittee(committeeFile, new List<CommitteeMember>());

        return Results.Ok(new { archived = true, year = year, count = members.Count, members = members });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapPost("/api/committee", async (HttpRequest req) => {
    try
    {
        if (!IsAdminSession(req)) return Results.Unauthorized();

        var input = await JsonSerializer.DeserializeAsync<CommitteeInput>(req.Body);
        if (input == null || string.IsNullOrWhiteSpace(input.Name) || string.IsNullOrWhiteSpace(input.Role))
            return Results.BadRequest(new { error = "name and role required" });

        var members = LoadCommittee(committeeFile);
        var id = Guid.NewGuid().ToString("N");
        var item = new CommitteeMember {
            Id = id,
            Name = input.Name.Trim(),
            Roll = (input.Roll ?? string.Empty).Trim(),
            Department = (input.Department ?? string.Empty).Trim(),
            Batch = (input.Batch ?? string.Empty).Trim(),
            Role = input.Role.Trim(),
            Picture = (input.Picture ?? string.Empty).Trim()
        };
        members.Add(item);
        SaveCommittee(committeeFile, members);
        return Results.Created($"/api/committee/{id}", item);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapDelete("/api/committee/{id}", async (HttpRequest req, string id) => {
    try
    {
        if (!IsAdminSession(req)) return Results.Unauthorized();

        var members = LoadCommittee(committeeFile);
        var member = members.FirstOrDefault(m => m.Id == id);
        if (member == null) return Results.NotFound();

        members.Remove(member);
        SaveCommittee(committeeFile, members);
        return Results.Ok(new { deleted = true });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapPost("/api/events", async (HttpRequest req) => {
    try
    {
        // require admin session
        if (!IsAdminSession(req)) return Results.Unauthorized();

        var input = await JsonSerializer.DeserializeAsync<EventInput>(req.Body);
        if (input == null || string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.DateTime))
            return Results.BadRequest(new { error = "title and dateTime required" });

        DateTimeOffset dto;
        if (!DateTimeOffset.TryParse(input.DateTime, out dto))
            return Results.BadRequest(new { error = "invalid date format" });

        var events = LoadEvents(dataFile);
        var id = Guid.NewGuid().ToString("N");
        var item = new EventItem {
            Id = id,
            Title = input.Title.Trim(),
            Description = (input.Description ?? string.Empty).Trim(),
            Location = (input.Location ?? string.Empty).Trim(),
            DateTimeUtc = dto.UtcDateTime
        };
        events.Add(item);
        SaveEvents(dataFile, events);
        return Results.Created($"/api/events/{id}", item);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.MapDelete("/api/events/{id}", async (HttpRequest req, string id) => {
    try
    {
        // require admin session
        if (!IsAdminSession(req)) return Results.Unauthorized();

        var events = LoadEvents(dataFile);
        var evt = events.FirstOrDefault(e => e.Id == id);
        if (evt == null) return Results.NotFound();

        events.Remove(evt);
        SaveEvents(dataFile, events);
        return Results.Ok(new { deleted = true });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// Admin login
app.MapPost("/api/admin/login", async (HttpRequest req) => {
    try
    {
        var inpt = await JsonSerializer.DeserializeAsync<AdminLogin>(req.Body);
        if (inpt == null) return Results.BadRequest();
        if (inpt.Username == adminUser && inpt.Password == adminPass)
        {
            var token = Guid.NewGuid().ToString("N");
            adminSessions[token] = DateTime.UtcNow.AddHours(4);
            var cookieOptions = new CookieOptions {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddHours(4)
            };
            req.HttpContext.Response.Cookies.Append("sgipc_admin", token, cookieOptions);
            return Results.Ok(new { authenticated = true });
        }
        return Results.Unauthorized();
    }
    catch { return Results.BadRequest(); }
});

app.MapPost("/api/admin/logout", (HttpRequest req) => {
    if (req.Cookies.TryGetValue("sgipc_admin", out var token))
    {
        adminSessions.TryRemove(token, out _);
        req.HttpContext.Response.Cookies.Delete("sgipc_admin");
    }
    return Results.Ok(new { loggedOut = true });
});

app.MapGet("/api/admin/session", (HttpRequest req) => {
    return Results.Ok(new { authenticated = IsAdminSession(req) });
});

// Allow serving static files from the workspace root (parent of the `server` folder).
// AppContext.BaseDirectory points into bin/.../net*/ so walk up four levels to reach the repository root.
var workspaceRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
if (Directory.Exists(workspaceRoot))
{
    var provider = new PhysicalFileProvider(workspaceRoot);
    // Serve index.html for root and enable static files from workspace
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = provider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = provider });
}

app.Run();

public class EventItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;
    [JsonPropertyName("dateTimeUtc")]
    public DateTime DateTimeUtc { get; set; }
}

public class EventInput
{
    [JsonPropertyName("title")] public string? Title { get; set; }
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("location")] public string? Location { get; set; }
    [JsonPropertyName("dateTime")] public string? DateTime { get; set; }
}

public class AdminLogin
{
    [JsonPropertyName("username")] public string? Username { get; set; }
    [JsonPropertyName("password")] public string? Password { get; set; }
}

public class CommitteeMember
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("roll")] public string Roll { get; set; } = string.Empty;
    [JsonPropertyName("department")] public string Department { get; set; } = string.Empty;
    [JsonPropertyName("batch")] public string Batch { get; set; } = string.Empty;
    [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
    [JsonPropertyName("picture")] public string Picture { get; set; } = string.Empty;
}

public class CommitteeInput
{
    [JsonPropertyName("name")] public string? Name { get; set; }
    [JsonPropertyName("roll")] public string? Roll { get; set; }
    [JsonPropertyName("department")] public string? Department { get; set; }
    [JsonPropertyName("batch")] public string? Batch { get; set; }
    [JsonPropertyName("role")] public string? Role { get; set; }
    [JsonPropertyName("picture")] public string? Picture { get; set; }
}
