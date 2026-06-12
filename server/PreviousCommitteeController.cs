using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller previous committee archive er API route manage kore.
public static class PreviousCommitteeController
{
    // Ei block e archive year list, year-wise member, delete, archive route register kora hoy.
    public static void MapPreviousCommitteeRoutes(
        this WebApplication app,
        PreviousCommitteeCrud previousCommitteeCrud,
        AdminSessionService adminSessions)
    {
        // Ei route archived year list return kore.
        app.MapGet("/api/previous-committee", async () =>
        {
            var years = await previousCommitteeCrud.GetPreviousCommitteeYearsAsync();
            return Results.Ok(years);
        });

        // Ei route specific year er archived committee member return kore.
        app.MapGet("/api/previous-committee/{year}", async (string year) =>
        {
            var members = await previousCommitteeCrud.GetPreviousCommitteeAsync(year);
            if (members == null) return Results.NotFound();
            return Results.Ok(members);
        });

        // Ei fallback route query parameter diye same year archive load kore.
        app.MapGet("/api/previous-committee-by-year", async (HttpRequest req) =>
        {
            var year = req.Query["year"].ToString();
            if (string.IsNullOrWhiteSpace(year)) return Results.BadRequest(new { error = "year required" });
            var members = await previousCommitteeCrud.GetPreviousCommitteeAsync(year);
            if (members == null) return Results.NotFound();
            return Results.Ok(members);
        });

        // Ei route admin login thakle specific archived year delete kore.
        app.MapDelete("/api/previous-committee/{year}", async (HttpRequest req, string year) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();
                var deleted = await previousCommitteeCrud.DeletePreviousCommitteeAsync(year);
                if (!deleted) return Results.NotFound();
                return Results.Ok(new { deleted = true, year });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Ei route current committee ke given year diye previous archive e move kore.
        app.MapPost("/api/previous-committee/archive", async (HttpRequest req) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();

                string? year = null;
                try
                {
                    var payload = await JsonSerializer.DeserializeAsync<Dictionary<string, string>>(req.Body);
                    if (payload != null && payload.TryGetValue("year", out var y)) year = y;
                }
                catch
                {
                    // Invalid body hole niche validation same error response dibe.
                }

                if (string.IsNullOrWhiteSpace(year)) return Results.BadRequest(new { error = "year required in request body" });

                var result = await previousCommitteeCrud.ArchiveCurrentCommitteeAsync(year.Trim());
                if (result.YearAlreadyExists) return Results.Conflict(new { error = "year already exists in previous committee" });

                return Results.Ok(new
                {
                    archived = true,
                    year = result.Year,
                    count = result.Members.Count,
                    members = result.Members
                });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
    }
}
