using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller join request API route manage kore.
public static class JoinRequestsController
{
    // Ei block e join request list dekha ebong application submit route register kora hoy.
    public static void MapJoinRequestRoutes(
        this WebApplication app,
        JoinRequestsCrud joinRequestsCrud,
        AdminSessionService adminSessions)
    {
        // Ei route shudhu admin ke join request list dekhay.
        app.MapGet("/api/join-requests", async (HttpRequest req) =>
        {
            if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();
            var requests = await joinRequestsCrud.GetJoinRequestsAsync();
            return Results.Ok(requests);
        });

        // Ei route public user er join form submission save kore.
        app.MapPost("/api/join-requests", async (HttpRequest req) =>
        {
            try
            {
                var input = await JsonSerializer.DeserializeAsync<JoinRequestInput>(req.Body);
                if (input == null ||
                    string.IsNullOrWhiteSpace(input.Name) ||
                    string.IsNullOrWhiteSpace(input.Roll) ||
                    string.IsNullOrWhiteSpace(input.Batch) ||
                    string.IsNullOrWhiteSpace(input.Department) ||
                    string.IsNullOrWhiteSpace(input.Email) ||
                    string.IsNullOrWhiteSpace(input.CodeforcesHandle) ||
                    string.IsNullOrWhiteSpace(input.AtCoderHandle) ||
                    string.IsNullOrWhiteSpace(input.WhyYouWantToJoin))
                {
                    return Results.BadRequest(new { error = "all join fields are required" });
                }

                var item = new JoinRequest
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = input.Name.Trim(),
                    Roll = input.Roll.Trim(),
                    Batch = input.Batch.Trim(),
                    Department = input.Department.Trim(),
                    Email = input.Email.Trim(),
                    CodeforcesHandle = input.CodeforcesHandle.Trim(),
                    AtCoderHandle = input.AtCoderHandle.Trim(),
                    WhyYouWantToJoin = input.WhyYouWantToJoin.Trim(),
                    Answer = input.WhyYouWantToJoin.Trim(),
                    CreatedAtUtc = DateTime.UtcNow
                };

                await joinRequestsCrud.AddJoinRequestAsync(item);
                return Results.Created($"/api/join-requests/{item.Id}", item);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
    }
}
