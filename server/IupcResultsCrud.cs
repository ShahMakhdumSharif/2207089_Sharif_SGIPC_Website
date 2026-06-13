using MySqlConnector;
using static MySqlCrudHelpers;

// Ei CRUD class iupc_results table er database operation manage kore.
public sealed class IupcResultsCrud
{
    private readonly MySqlDatabase _database;

    public IupcResultsCrud(MySqlDatabase database)
    {
        _database = database;
    }

    // Ei method IUPC result list year/created order e ane.
    public async Task<List<IupcResult>> GetIupcResultsAsync()
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"SELECT id, contest_name, contest_year, team_name, team_members, rank_text,
                     remarks, created_at_utc, updated_at_utc
              FROM iupc_results
              ORDER BY contest_year DESC, created_at_utc DESC",
            conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<IupcResult>();
        while (await reader.ReadAsync())
        {
            results.Add(ReadIupcResult(reader));
        }
        return results;
    }

    // Ei method notun IUPC result insert kore.
    public async Task AddIupcResultAsync(IupcResult item)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"INSERT INTO iupc_results
              (id, contest_name, contest_year, team_name, team_members, rank_text,
               remarks, created_at_utc, updated_at_utc)
              VALUES
              (@id, @contestName, @contestYear, @teamName, @teamMembers, @rankText,
               @remarks, @createdAtUtc, @updatedAtUtc)",
            conn);
        Add(cmd, "@id", item.Id);
        Add(cmd, "@contestName", item.ContestName);
        Add(cmd, "@contestYear", item.ContestYear);
        Add(cmd, "@teamName", item.TeamName);
        Add(cmd, "@teamMembers", item.TeamMembers);
        Add(cmd, "@rankText", item.RankText);
        Add(cmd, "@remarks", item.Remarks);
        Add(cmd, "@createdAtUtc", item.CreatedAtUtc);
        Add(cmd, "@updatedAtUtc", item.UpdatedAtUtc);
        await cmd.ExecuteNonQueryAsync();
    }

    // Ei method id diye existing IUPC result update kore.
    public async Task<bool> UpdateIupcResultAsync(string id, IupcResultInput input)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"UPDATE iupc_results
              SET contest_name = @contestName,
                  contest_year = @contestYear,
                  team_name = @teamName,
                  team_members = @teamMembers,
                  rank_text = @rankText,
                  remarks = @remarks,
                  updated_at_utc = @updatedAtUtc
              WHERE id = @id",
            conn);
        Add(cmd, "@id", id);
        Add(cmd, "@contestName", input.ContestName?.Trim() ?? string.Empty);
        Add(cmd, "@contestYear", input.ContestYear?.Trim() ?? string.Empty);
        Add(cmd, "@teamName", input.TeamName?.Trim() ?? string.Empty);
        Add(cmd, "@teamMembers", input.TeamMembers?.Trim() ?? string.Empty);
        Add(cmd, "@rankText", input.RankText?.Trim() ?? string.Empty);
        Add(cmd, "@remarks", input.Remarks?.Trim() ?? string.Empty);
        Add(cmd, "@updatedAtUtc", DateTime.UtcNow);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // Ei method id diye IUPC result delete kore.
    public async Task<bool> DeleteIupcResultAsync(string id)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand("DELETE FROM iupc_results WHERE id = @id", conn);
        Add(cmd, "@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}
