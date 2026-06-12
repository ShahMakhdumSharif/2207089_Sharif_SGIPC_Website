using MySqlConnector;

// Ei helper class e common MySQL read/parameter utility rakha hoyeche.
public static class MySqlCrudHelpers
{
    // Ei method reader theke committee member list banay.
    public static async Task<List<CommitteeMember>> ReadCommitteeMembersAsync(MySqlDataReader reader)
    {
        var members = new List<CommitteeMember>();
        while (await reader.ReadAsync())
        {
            members.Add(new CommitteeMember
            {
                Id = reader.GetString("id"),
                Name = reader.GetString("name"),
                Roll = reader.GetString("roll"),
                Department = reader.GetString("department"),
                Batch = reader.GetString("batch"),
                Role = reader.GetString("role"),
                Picture = reader.GetString("picture")
            });
        }
        return members;
    }

    // Ei method committee insert/archive query te common parameter add kore.
    public static void AddCommitteeParameters(MySqlCommand cmd, CommitteeMember item)
    {
        Add(cmd, "@id", item.Id);
        Add(cmd, "@name", item.Name);
        Add(cmd, "@roll", item.Roll);
        Add(cmd, "@department", item.Department);
        Add(cmd, "@batch", item.Batch);
        Add(cmd, "@role", item.Role);
        Add(cmd, "@picture", item.Picture);
    }

    // Ei method iupc_results row ke C# model e convert kore.
    public static IupcResult ReadIupcResult(MySqlDataReader reader)
    {
        return new IupcResult
        {
            Id = reader.GetString("id"),
            ContestName = reader.GetString("contest_name"),
            ContestYear = reader.GetString("contest_year"),
            TeamName = reader.GetString("team_name"),
            TeamMembers = reader.GetString("team_members"),
            RankText = reader.GetString("rank_text"),
            Remarks = reader.GetString("remarks"),
            CreatedAtUtc = AsUtc(reader.GetDateTime("created_at_utc")),
            UpdatedAtUtc = AsUtc(reader.GetDateTime("updated_at_utc"))
        };
    }

    // Ei method icpc_results row ke C# model e convert kore.
    public static IcpcResult ReadIcpcResult(MySqlDataReader reader)
    {
        return new IcpcResult
        {
            Id = reader.GetString("id"),
            ContestName = reader.GetString("contest_name"),
            ContestYear = reader.GetString("contest_year"),
            TeamName = reader.GetString("team_name"),
            MemberOne = reader.GetString("member_one"),
            MemberTwo = reader.GetString("member_two"),
            MemberThree = reader.GetString("member_three"),
            RankText = reader.GetString("rank_text"),
            CreatedAtUtc = AsUtc(reader.GetDateTime("created_at_utc"))
        };
    }

    // Ei helper nullable value ke SQL parameter hisebe add kore.
    public static void Add(MySqlCommand cmd, string name, object? value)
    {
        cmd.Parameters.AddWithValue(name, value ?? DBNull.Value);
    }

    // Ei helper database theke asha time ke UTC hisebe mark kore.
    public static DateTime AsUtc(DateTime value)
    {
        return value.Kind == DateTimeKind.Utc
            ? value
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }
}
