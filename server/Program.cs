using Microsoft.Extensions.FileProviders;

// Ei block e ASP.NET app create kore CORS allow kora hocche.
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("AllowAll");

// Ei block e MySQL connection string environment/config theke neya hocche.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection") ??
    builder.Configuration.GetConnectionString("Default") ??
    Environment.GetEnvironmentVariable("MYSQL_CONNECTION_STRING") ??
    "Server=localhost;Port=3306;Database=sgipc;User ID=root;Password=;";

var database = new MySqlDatabase(connectionString);
await database.InitializeAsync();

// Ei block e controller gular jonno dependency object create kora hocche.
var adminSessions = new AdminSessionService();
var eventsCrud = new EventsCrud(database);
var committeeCrud = new CommitteeCrud(database);
var previousCommitteeCrud = new PreviousCommitteeCrud(database);
var joinRequestsCrud = new JoinRequestsCrud(database);
var iupcResultsCrud = new IupcResultsCrud(database);
var icpcResultsCrud = new IcpcResultsCrud(database);

// Ei block e alada controller file theke API route register kora hocche.
app.MapHealthRoutes();
app.MapEventRoutes(eventsCrud, adminSessions);
app.MapCommitteeRoutes(committeeCrud, adminSessions);
app.MapPreviousCommitteeRoutes(previousCommitteeCrud, adminSessions);
app.MapJoinRequestRoutes(joinRequestsCrud, adminSessions);
app.MapIupcResultRoutes(iupcResultsCrud, adminSessions);
app.MapIcpcResultRoutes(icpcResultsCrud, adminSessions);
app.MapAdminRoutes(adminSessions);

// Ei block e server folder er parent/root theke HTML, CSS, JS static file serve kora hocche.
var workspaceRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
if (Directory.Exists(workspaceRoot))
{
    var provider = new PhysicalFileProvider(workspaceRoot);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = provider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = provider });
}

// Ei line e web server start hoy.
app.Run();
