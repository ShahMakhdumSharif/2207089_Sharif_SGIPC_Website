using MySqlConnector;
using static MySqlCrudHelpers;

// Ei CRUD class events table er database operation manage kore.
public sealed class EventsCrud
{
    private readonly MySqlDatabase _database;

    public EventsCrud(MySqlDatabase database)
    {
        _database = database;
    }

    // Ei method sob event database theke date order e ane.
    public async Task<List<EventItem>> GetEventsAsync()
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            "SELECT id, title, description, location, date_time_utc FROM events ORDER BY date_time_utc",
            conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        var events = new List<EventItem>();
        while (await reader.ReadAsync())
        {
            events.Add(new EventItem
            {
                Id = reader.GetString("id"),
                Title = reader.GetString("title"),
                Description = reader.GetString("description"),
                Location = reader.GetString("location"),
                DateTimeUtc = AsUtc(reader.GetDateTime("date_time_utc"))
            });
        }
        return events;
    }

    // Ei method events table e notun event insert kore.
    public async Task AddEventAsync(EventItem item)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"INSERT INTO events (id, title, description, location, date_time_utc, created_at_utc)
              VALUES (@id, @title, @description, @location, @dateTimeUtc, @createdAtUtc)",
            conn);
        Add(cmd, "@id", item.Id);
        Add(cmd, "@title", item.Title);
        Add(cmd, "@description", item.Description);
        Add(cmd, "@location", item.Location);
        Add(cmd, "@dateTimeUtc", item.DateTimeUtc);
        Add(cmd, "@createdAtUtc", DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    // Ei method id diye event delete kore ebong success status return kore.
    public async Task<bool> DeleteEventAsync(string id)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand("DELETE FROM events WHERE id = @id", conn);
        Add(cmd, "@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}
