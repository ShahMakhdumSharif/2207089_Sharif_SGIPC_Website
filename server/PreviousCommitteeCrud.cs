using MySqlConnector;
using static MySqlCrudHelpers;

// Ei CRUD class previous_committee_members archive table manage kore.
public sealed class PreviousCommitteeCrud
{
    private readonly MySqlDatabase _database;

    public PreviousCommitteeCrud(MySqlDatabase database)
    {
        _database = database;
    }

    // Ei method sob archived year newest first order e ane.
    public async Task<List<string>> GetPreviousCommitteeYearsAsync()
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            "SELECT DISTINCT archive_year FROM previous_committee_members ORDER BY archive_year DESC",
            conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        var years = new List<string>();
        while (await reader.ReadAsync())
        {
            years.Add(reader.GetString("archive_year"));
        }
        return years;
    }

    // Ei method given year er archived committee member list ane.
    public async Task<List<CommitteeMember>?> GetPreviousCommitteeAsync(string year)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var existsCmd = new MySqlCommand(
            "SELECT COUNT(*) FROM previous_committee_members WHERE archive_year = @year",
            conn);
        Add(existsCmd, "@year", year);
        var count = Convert.ToInt32(await existsCmd.ExecuteScalarAsync());
        if (count == 0) return null;

        await using var cmd = new MySqlCommand(
            @"SELECT id, name, roll, department, batch, role, picture
              FROM previous_committee_members
              WHERE archive_year = @year
              ORDER BY sort_order, id",
            conn);
        Add(cmd, "@year", year);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await ReadCommitteeMembersAsync(reader);
    }

    // Ei method given year er complete archive delete kore.
    public async Task<bool> DeletePreviousCommitteeAsync(string year)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            "DELETE FROM previous_committee_members WHERE archive_year = @year",
            conn);
        Add(cmd, "@year", year);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    // Ei method current committee ke archive kore tarpor current table clear kore.
    public async Task<ArchiveResult> ArchiveCurrentCommitteeAsync(string year)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var tx = await conn.BeginTransactionAsync();

        await using (var existsCmd = new MySqlCommand(
            "SELECT COUNT(*) FROM previous_committee_members WHERE archive_year = @year",
            conn,
            tx))
        {
            Add(existsCmd, "@year", year);
            var existing = Convert.ToInt32(await existsCmd.ExecuteScalarAsync());
            if (existing > 0)
            {
                await tx.RollbackAsync();
                return new ArchiveResult(year, new List<CommitteeMember>(), true);
            }
        }

        List<CommitteeMember> members;
        await using (var loadCmd = new MySqlCommand(
            @"SELECT id, name, roll, department, batch, role, picture
              FROM committee_members
              ORDER BY created_at_utc, id",
            conn,
            tx))
        await using (var reader = await loadCmd.ExecuteReaderAsync())
        {
            members = await ReadCommitteeMembersAsync(reader);
        }

        var now = DateTime.UtcNow;
        for (var i = 0; i < members.Count; i++)
        {
            await using var insertCmd = new MySqlCommand(
                @"INSERT INTO previous_committee_members
                  (archive_year, id, name, roll, department, batch, role, picture, sort_order, archived_at_utc)
                  VALUES (@year, @id, @name, @roll, @department, @batch, @role, @picture, @sortOrder, @archivedAtUtc)",
                conn,
                tx);
            Add(insertCmd, "@year", year);
            AddCommitteeParameters(insertCmd, members[i]);
            Add(insertCmd, "@sortOrder", i);
            Add(insertCmd, "@archivedAtUtc", now);
            await insertCmd.ExecuteNonQueryAsync();
        }

        await using (var deleteCmd = new MySqlCommand("DELETE FROM committee_members", conn, tx))
        {
            await deleteCmd.ExecuteNonQueryAsync();
        }

        // Sob insert/delete successful hole transaction commit hoy.
        await tx.CommitAsync();
        return new ArchiveResult(year, members, false);
    }
}
