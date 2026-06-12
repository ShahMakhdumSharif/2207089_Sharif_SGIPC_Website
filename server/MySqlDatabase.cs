using MySqlConnector;

// Ei class MySQL connection open kore ebong required table schema ensure kore.
public sealed class MySqlDatabase
{
    private readonly string _connectionString;

    public MySqlDatabase(string connectionString)
    {
        _connectionString = connectionString;
    }

    // Ei method database/table na thakle create kore ready kore.
    public async Task InitializeAsync()
    {
        await EnsureDatabaseAsync();
        await using var conn = await OpenConnectionAsync();
        var schemaStatements = new[]
        {
            @"CREATE TABLE IF NOT EXISTS events (
                id VARCHAR(32) NOT NULL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                location VARCHAR(255) NOT NULL,
                date_time_utc DATETIME(6) NOT NULL,
                created_at_utc DATETIME(6) NOT NULL,
                INDEX idx_events_date_time_utc (date_time_utc)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
            @"CREATE TABLE IF NOT EXISTS committee_members (
                id VARCHAR(32) NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                roll VARCHAR(64) NOT NULL,
                department VARCHAR(128) NOT NULL,
                batch VARCHAR(64) NOT NULL,
                role VARCHAR(128) NOT NULL,
                picture VARCHAR(512) NOT NULL,
                created_at_utc DATETIME(6) NOT NULL,
                INDEX idx_committee_created_at_utc (created_at_utc)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
            @"CREATE TABLE IF NOT EXISTS previous_committee_members (
                archive_year VARCHAR(16) NOT NULL,
                id VARCHAR(32) NOT NULL,
                name VARCHAR(255) NOT NULL,
                roll VARCHAR(64) NOT NULL,
                department VARCHAR(128) NOT NULL,
                batch VARCHAR(64) NOT NULL,
                role VARCHAR(128) NOT NULL,
                picture VARCHAR(512) NOT NULL,
                sort_order INT NOT NULL,
                archived_at_utc DATETIME(6) NOT NULL,
                PRIMARY KEY (archive_year, id),
                INDEX idx_previous_committee_year (archive_year)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
            @"CREATE TABLE IF NOT EXISTS join_requests (
                id VARCHAR(32) NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                roll VARCHAR(64) NOT NULL,
                batch VARCHAR(64) NOT NULL,
                department VARCHAR(128) NOT NULL,
                email VARCHAR(255) NOT NULL,
                codeforces_handle VARCHAR(128) NOT NULL,
                atcoder_handle VARCHAR(128) NOT NULL,
                why_you_want_to_join TEXT NOT NULL,
                answer TEXT NOT NULL,
                created_at_utc DATETIME(6) NOT NULL,
                INDEX idx_join_requests_created_at_utc (created_at_utc)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
            @"CREATE TABLE IF NOT EXISTS iupc_results (
                id VARCHAR(32) NOT NULL PRIMARY KEY,
                contest_name VARCHAR(255) NOT NULL,
                contest_year VARCHAR(16) NOT NULL,
                team_name VARCHAR(255) NOT NULL,
                team_members TEXT NOT NULL,
                rank_text VARCHAR(128) NOT NULL,
                remarks TEXT NOT NULL,
                created_at_utc DATETIME(6) NOT NULL,
                updated_at_utc DATETIME(6) NOT NULL,
                INDEX idx_iupc_results_year (contest_year),
                INDEX idx_iupc_results_created_at_utc (created_at_utc)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
            @"CREATE TABLE IF NOT EXISTS icpc_results (
                id VARCHAR(32) NOT NULL PRIMARY KEY,
                contest_name VARCHAR(255) NOT NULL,
                contest_year VARCHAR(16) NOT NULL,
                team_name VARCHAR(255) NOT NULL,
                member_one VARCHAR(255) NOT NULL,
                member_two VARCHAR(255) NOT NULL,
                member_three VARCHAR(255) NOT NULL,
                rank_text VARCHAR(128) NOT NULL,
                created_at_utc DATETIME(6) NOT NULL,
                INDEX idx_icpc_results_year (contest_year),
                INDEX idx_icpc_results_created_at_utc (created_at_utc)
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        };

        foreach (var sql in schemaStatements)
        {
            await using var cmd = new MySqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync();
        }
    }

    // Ei method CRUD class gular jonno open MySQL connection return kore.
    public async Task<MySqlConnection> OpenConnectionAsync()
    {
        var conn = new MySqlConnection(_connectionString);
        await conn.OpenAsync();
        return conn;
    }

    // Ei method connection string er database name diye database create kore.
    private async Task EnsureDatabaseAsync()
    {
        var builder = new MySqlConnectionStringBuilder(_connectionString);
        if (string.IsNullOrWhiteSpace(builder.Database))
        {
            throw new InvalidOperationException("The MySQL connection string must include a Database value.");
        }

        var database = builder.Database;
        var serverBuilder = new MySqlConnectionStringBuilder(_connectionString) { Database = string.Empty };
        await using var conn = new MySqlConnection(serverBuilder.ConnectionString);
        await conn.OpenAsync();
        await using var cmd = new MySqlCommand(
            $"CREATE DATABASE IF NOT EXISTS {QuoteIdentifier(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
            conn);
        await cmd.ExecuteNonQueryAsync();
    }

    // Ei helper database/table name ke safe MySQL identifier banay.
    private static string QuoteIdentifier(string identifier)
    {
        return "`" + identifier.Replace("`", "``") + "`";
    }
}
