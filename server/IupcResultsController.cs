using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller IUPC achievement result API route manage kore.
public static class IupcResultsController
{
    // Ei block e IUPC result read, add, update, delete route register kora hoy.
    public static void MapIupcResultRoutes(
        this WebApplication app,
        IupcResultsCrud iupcResultsCrud,
        AdminSessionService adminSessions)
    {
        // Ei route sob visitor ke IUPC result list dekhay.
        app.MapGet("/api/iupc-results", async () =>
        {
            var results = await iupcResultsCrud.GetIupcResultsAsync();
            return Results.Ok(results);
        });

        // Ei route admin login thakle notun IUPC result add kore.
        app.MapPost("/api/iupc-results", async (HttpRequest req) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();

                var input = await JsonSerializer.DeserializeAsync<IupcResultInput>(req.Body);
                if (input == null ||
                    string.IsNullOrWhiteSpace(input.ContestName) ||
                    string.IsNullOrWhiteSpace(input.ContestYear) ||
                    string.IsNullOrWhiteSpace(input.TeamName) ||
                    string.IsNullOrWhiteSpace(input.TeamMembers) ||
                    string.IsNullOrWhiteSpace(input.RankText))
                {
                    return Results.BadRequest(new { error = "contest name, year, team name, members, and rank are required" });
                }

                var now = DateTime.UtcNow;
                var item = new IupcResult
                {
                    Id = Guid.NewGuid().ToString("N"),
                    ContestName = input.ContestName.Trim(),
                    ContestYear = input.ContestYear.Trim(),
                    TeamName = input.TeamName.Trim(),
                    TeamMembers = input.TeamMembers.Trim(),
                    RankText = input.RankText.Trim(),
                    Remarks = (input.Remarks ?? string.Empty).Trim(),
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now
                };

                await iupcResultsCrud.AddIupcResultAsync(item);
                return Results.Created($"/api/iupc-results/{item.Id}", item);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Ei route admin login thakle existing IUPC result update kore.
        app.MapPut("/api/iupc-results/{id}", async (HttpRequest req, string id) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();

                var input = await JsonSerializer.DeserializeAsync<IupcResultInput>(req.Body);
                if (input == null ||
                    string.IsNullOrWhiteSpace(input.ContestName) ||
                    string.IsNullOrWhiteSpace(input.ContestYear) ||
                    string.IsNullOrWhiteSpace(input.TeamName) ||
                    string.IsNullOrWhiteSpace(input.TeamMembers) ||
                    string.IsNullOrWhiteSpace(input.RankText))
                {
                    return Results.BadRequest(new { error = "contest name, year, team name, members, and rank are required" });
                }

                var updated = await iupcResultsCrud.UpdateIupcResultAsync(id, input);
                if (!updated) return Results.NotFound();
                return Results.Ok(new { updated = true });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Ei route admin login thakle specific IUPC result delete kore.
        app.MapDelete("/api/iupc-results/{id}", async (HttpRequest req, string id) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();
                var deleted = await iupcResultsCrud.DeleteIupcResultAsync(id);
                if (!deleted) return Results.NotFound();
                return Results.Ok(new { deleted = true });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
    }
}
