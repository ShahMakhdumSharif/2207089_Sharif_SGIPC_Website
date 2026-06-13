using MySqlConnector;
using static MySqlCrudHelpers;

// Ei CRUD class icpc_results table er database operation manage kore.
public sealed class IcpcResultsCrud
{
    private readonly MySqlDatabase _database;

    public IcpcResultsCrud(MySqlDatabase database)
    {
        _database = database;
    }

    // Ei method ICPC result list year/created order e ane.
    public async Task<List<IcpcResult>> GetIcpcResultsAsync()
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"SELECT id, contest_name, contest_year, team_name, member_one,
                     member_two, member_three, rank_text, created_at_utc
              FROM icpc_results
              ORDER BY contest_year DESC, created_at_utc DESC",
            conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<IcpcResult>();
        while (await reader.ReadAsync())
        {
            results.Add(ReadIcpcResult(reader));
        }
        return results;
    }

    // Ei method notun ICPC result insert kore.
    public async Task AddIcpcResultAsync(IcpcResult item)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"INSERT INTO icpc_results
              (id, contest_name, contest_year, team_name, member_one,
               member_two, member_three, rank_text, created_at_utc)
              VALUES
              (@id, @contestName, @contestYear, @teamName, @memberOne,
               @memberTwo, @memberThree, @rankText, @createdAtUtc)",
            conn);
        Add(cmd, "@id", item.Id);
        Add(cmd, "@contestName", item.ContestName);
        Add(cmd, "@contestYear", item.ContestYear);
        Add(cmd, "@teamName", item.TeamName);
        Add(cmd, "@memberOne", item.MemberOne);
        Add(cmd, "@memberTwo", item.MemberTwo);
        Add(cmd, "@memberThree", item.MemberThree);
        Add(cmd, "@rankText", item.RankText);
        Add(cmd, "@createdAtUtc", item.CreatedAtUtc);
        await cmd.ExecuteNonQueryAsync();
    }

    // Ei method id diye ICPC result delete kore.
    public async Task<bool> DeleteIcpcResultAsync(string id)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand("DELETE FROM icpc_results WHERE id = @id", conn);
        Add(cmd, "@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}
