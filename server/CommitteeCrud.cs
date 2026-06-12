using MySqlConnector;
using static MySqlCrudHelpers;

// Ei CRUD class committee_members table er database operation manage kore.
public sealed class CommitteeCrud
{
    private readonly MySqlDatabase _database;

    public CommitteeCrud(MySqlDatabase database)
    {
        _database = database;
    }

    // Ei method current committee member list database theke ane.
    public async Task<List<CommitteeMember>> GetCommitteeAsync()
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"SELECT id, name, roll, department, batch, role, picture
              FROM committee_members
              ORDER BY created_at_utc, id",
            conn);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await ReadCommitteeMembersAsync(reader);
    }

    // Ei method current committee table e notun member insert kore.
    public async Task AddCommitteeMemberAsync(CommitteeMember item)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand(
            @"INSERT INTO committee_members (id, name, roll, department, batch, role, picture, created_at_utc)
              VALUES (@id, @name, @roll, @department, @batch, @role, @picture, @createdAtUtc)",
            conn);
        AddCommitteeParameters(cmd, item);
        Add(cmd, "@createdAtUtc", DateTime.UtcNow);
        await cmd.ExecuteNonQueryAsync();
    }

    // Ei method id diye current committee member delete kore.
    public async Task<bool> DeleteCommitteeMemberAsync(string id)
    {
        await using var conn = await _database.OpenConnectionAsync();
        await using var cmd = new MySqlCommand("DELETE FROM committee_members WHERE id = @id", conn);
        Add(cmd, "@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }
}
