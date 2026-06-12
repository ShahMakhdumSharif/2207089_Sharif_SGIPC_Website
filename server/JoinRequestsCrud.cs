using MySqlConnector;
using static MySqlCrudHelpers;

// Ei CRUD class join_requests table er database operation manage kore.
public sealed class JoinRequestsCrud
{
    private readonly MySqlDatabase _database;

    public JoinRequestsCrud(MySqlDatabase database)
    {
        _database = database;
    }

    // Ei method latest join request first order e list ane.
    public async Task<List<JoinRequest>> GetJoinRequestsAsync()
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"SELECT id, name, roll, batch, department, email, codeforces_handle, atcoder_handle,
                     why_you_want_to_join, answer, created_at_utc
              FROM join_requests
              ORDER BY created_at_utc DESC",
            conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        var requests = new List<JoinRequest>();
        while (await reader.ReadAsync())
        {
            requests.Add(new JoinRequest
            {
                Id = reader.GetString("id"),
                Name = reader.GetString("name"),
                Roll = reader.GetString("roll"),
                Batch = reader.GetString("batch"),
                Department = reader.GetString("department"),
                Email = reader.GetString("email"),
                CodeforcesHandle = reader.GetString("codeforces_handle"),
                AtCoderHandle = reader.GetString("atcoder_handle"),
                WhyYouWantToJoin = reader.GetString("why_you_want_to_join"),
                Answer = reader.GetString("answer"),
                CreatedAtUtc = AsUtc(reader.GetDateTime("created_at_utc"))
            });
        }
        return requests;
    }

    // Ei method notun join request database e insert kore.
    public async Task AddJoinRequestAsync(JoinRequest item)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"INSERT INTO join_requests
              (id, name, roll, batch, department, email, codeforces_handle, atcoder_handle,
               why_you_want_to_join, answer, created_at_utc)
              VALUES
              (@id, @name, @roll, @batch, @department, @email, @codeforcesHandle, @atCoderHandle,
               @whyYouWantToJoin, @answer, @createdAtUtc)",
            conn);
        Add(cmd, "@id", item.Id);
        Add(cmd, "@name", item.Name);
        Add(cmd, "@roll", item.Roll);
        Add(cmd, "@batch", item.Batch);
        Add(cmd, "@department", item.Department);
        Add(cmd, "@email", item.Email);
        Add(cmd, "@codeforcesHandle", item.CodeforcesHandle);
        Add(cmd, "@atCoderHandle", item.AtCoderHandle);
        Add(cmd, "@whyYouWantToJoin", item.WhyYouWantToJoin);
        Add(cmd, "@answer", item.Answer);
        Add(cmd, "@createdAtUtc", item.CreatedAtUtc);
        await cmd.ExecuteNonQueryAsync();
    }
}
