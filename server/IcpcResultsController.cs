using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller ICPC achievement result API route manage kore.
public static class IcpcResultsController
{
    // Ei block e ICPC result read, add, delete route register kora hoy.
    public static void MapIcpcResultRoutes(
        this WebApplication app,
        IcpcResultsCrud icpcResultsCrud,
        AdminSessionService adminSessions)
    {
        // Ei route sob visitor ke ICPC result list dekhay.
        app.MapGet("/api/icpc-results", async () =>
        {
            var results = await icpcResultsCrud.GetIcpcResultsAsync();
            return Results.Ok(results);
        });

        // Ei route admin login thakle notun ICPC result add kore.
        app.MapPost("/api/icpc-results", async (HttpRequest req) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();

                var input = await JsonSerializer.DeserializeAsync<IcpcResultInput>(req.Body);
                if (input == null ||
                    string.IsNullOrWhiteSpace(input.ContestName) ||
                    string.IsNullOrWhiteSpace(input.ContestYear) ||
                    string.IsNullOrWhiteSpace(input.TeamName) ||
                    string.IsNullOrWhiteSpace(input.MemberOne) ||
                    string.IsNullOrWhiteSpace(input.MemberTwo) ||
                    string.IsNullOrWhiteSpace(input.MemberThree) ||
                    string.IsNullOrWhiteSpace(input.RankText))
                {
                    return Results.BadRequest(new { error = "contest name, year, team name, three member names, and rank are required" });
                }

                var item = new IcpcResult
                {
                    Id = Guid.NewGuid().ToString("N"),
                    ContestName = input.ContestName.Trim(),
                    ContestYear = input.ContestYear.Trim(),
                    TeamName = input.TeamName.Trim(),
                    MemberOne = input.MemberOne.Trim(),
                    MemberTwo = input.MemberTwo.Trim(),
                    MemberThree = input.MemberThree.Trim(),
                    RankText = input.RankText.Trim(),
                    CreatedAtUtc = DateTime.UtcNow
                };

                await icpcResultsCrud.AddIcpcResultAsync(item);
                return Results.Created($"/api/icpc-results/{item.Id}", item);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Ei route admin login thakle specific ICPC result delete kore.
        app.MapDelete("/api/icpc-results/{id}", async (HttpRequest req, string id) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();
                var deleted = await icpcResultsCrud.DeleteIcpcResultAsync(id);
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
