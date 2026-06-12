using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller current committee API route manage kore.
public static class CommitteeController
{
    // Ei block e committee read, add, delete route register kora hoy.
    public static void MapCommitteeRoutes(this WebApplication app, CommitteeCrud committeeCrud, AdminSessionService adminSessions)
    {
        // Ei route current committee member list return kore.
        app.MapGet("/api/committee", async () =>
        {
            var members = await committeeCrud.GetCommitteeAsync();
            return Results.Ok(members);
        });

        // Ei route admin login thakle notun committee member add kore.
        app.MapPost("/api/committee", async (HttpRequest req) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();

                var input = await JsonSerializer.DeserializeAsync<CommitteeInput>(req.Body);
                if (input == null || string.IsNullOrWhiteSpace(input.Name) || string.IsNullOrWhiteSpace(input.Role))
                    return Results.BadRequest(new { error = "name and role required" });

                var item = new CommitteeMember
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = input.Name.Trim(),
                    Roll = (input.Roll ?? string.Empty).Trim(),
                    Department = (input.Department ?? string.Empty).Trim(),
                    Batch = (input.Batch ?? string.Empty).Trim(),
                    Role = input.Role.Trim(),
                    Picture = (input.Picture ?? string.Empty).Trim()
                };

                await committeeCrud.AddCommitteeMemberAsync(item);
                return Results.Created($"/api/committee/{item.Id}", item);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Ei route admin login thakle specific committee member delete kore.
        app.MapDelete("/api/committee/{id}", async (HttpRequest req, string id) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();
                var deleted = await committeeCrud.DeleteCommitteeMemberAsync(id);
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
