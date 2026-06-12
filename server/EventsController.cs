using System.Text.Json;
using Microsoft.AspNetCore.Http;

// Ei controller event related API route manage kore.
public static class EventsController
{
    // Ei block e event read, add, delete route register kora hoy.
    public static void MapEventRoutes(this WebApplication app, EventsCrud eventsCrud, AdminSessionService adminSessions)
    {
        // Ei route upcoming ebong past event alada kore return kore.
        app.MapGet("/api/events", async () =>
        {
            var events = await eventsCrud.GetEventsAsync();
            var now = DateTime.UtcNow;
            var upcoming = events.Where(e => e.DateTimeUtc > now).OrderBy(e => e.DateTimeUtc).ToList();
            var past = events.Where(e => e.DateTimeUtc <= now).OrderByDescending(e => e.DateTimeUtc).ToList();
            return Results.Ok(new { upcoming, past });
        });

        // Ei route admin login thakle notun event add kore.
        app.MapPost("/api/events", async (HttpRequest req) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();

                var input = await JsonSerializer.DeserializeAsync<EventInput>(req.Body);
                if (input == null || string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.DateTime))
                    return Results.BadRequest(new { error = "title and dateTime required" });

                if (!DateTimeOffset.TryParse(input.DateTime, out var dto))
                    return Results.BadRequest(new { error = "invalid date format" });

                var item = new EventItem
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Title = input.Title.Trim(),
                    Description = (input.Description ?? string.Empty).Trim(),
                    Location = (input.Location ?? string.Empty).Trim(),
                    DateTimeUtc = dto.UtcDateTime
                };

                await eventsCrud.AddEventAsync(item);
                return Results.Created($"/api/events/{item.Id}", item);
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        // Ei route admin login thakle specific event delete kore.
        app.MapDelete("/api/events/{id}", async (HttpRequest req, string id) =>
        {
            try
            {
                if (!adminSessions.IsAdminSession(req)) return Results.Unauthorized();
                var deleted = await eventsCrud.DeleteEventAsync(id);
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
