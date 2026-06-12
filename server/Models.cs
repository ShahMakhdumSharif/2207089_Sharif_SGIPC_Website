using System.Text.Json.Serialization;

// Ei model frontend e event data pathanor jonno use hoy.
public class EventItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
    [JsonPropertyName("location")]
    public string Location { get; set; } = string.Empty;
    [JsonPropertyName("dateTimeUtc")]
    public DateTime DateTimeUtc { get; set; }
}

// Ei input model frontend theke event form data receive kore.
public class EventInput
{
    [JsonPropertyName("title")] public string? Title { get; set; }
    [JsonPropertyName("description")] public string? Description { get; set; }
    [JsonPropertyName("location")] public string? Location { get; set; }
    [JsonPropertyName("dateTime")] public string? DateTime { get; set; }
}

// Ei model admin login request er username/password dhore.
public class AdminLogin
{
    [JsonPropertyName("username")] public string? Username { get; set; }
    [JsonPropertyName("password")] public string? Password { get; set; }
}

// Ei model current/previous committee member er common data dhore.
public class CommitteeMember
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("roll")] public string Roll { get; set; } = string.Empty;
    [JsonPropertyName("department")] public string Department { get; set; } = string.Empty;
    [JsonPropertyName("batch")] public string Batch { get; set; } = string.Empty;
    [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
    [JsonPropertyName("picture")] public string Picture { get; set; } = string.Empty;
}

// Ei input model admin panel theke committee member form data receive kore.
public class CommitteeInput
{
    [JsonPropertyName("name")] public string? Name { get; set; }
    [JsonPropertyName("roll")] public string? Roll { get; set; }
    [JsonPropertyName("department")] public string? Department { get; set; }
    [JsonPropertyName("batch")] public string? Batch { get; set; }
    [JsonPropertyName("role")] public string? Role { get; set; }
    [JsonPropertyName("picture")] public string? Picture { get; set; }
}

// Ei model join request table er complete data represent kore.
public class JoinRequest
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
    [JsonPropertyName("roll")] public string Roll { get; set; } = string.Empty;
    [JsonPropertyName("batch")] public string Batch { get; set; } = string.Empty;
    [JsonPropertyName("department")] public string Department { get; set; } = string.Empty;
    [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("codeforcesHandle")] public string CodeforcesHandle { get; set; } = string.Empty;
    [JsonPropertyName("atCoderHandle")] public string AtCoderHandle { get; set; } = string.Empty;
    [JsonPropertyName("whyYouWantToJoin")] public string WhyYouWantToJoin { get; set; } = string.Empty;
    [JsonPropertyName("answer")] public string Answer { get; set; } = string.Empty;
    [JsonPropertyName("createdAtUtc")] public DateTime CreatedAtUtc { get; set; }
}

// Ei input model public join form theke data receive kore.
public class JoinRequestInput
{
    [JsonPropertyName("name")] public string? Name { get; set; }
    [JsonPropertyName("roll")] public string? Roll { get; set; }
    [JsonPropertyName("batch")] public string? Batch { get; set; }
    [JsonPropertyName("department")] public string? Department { get; set; }
    [JsonPropertyName("email")] public string? Email { get; set; }
    [JsonPropertyName("codeforcesHandle")] public string? CodeforcesHandle { get; set; }
    [JsonPropertyName("atCoderHandle")] public string? AtCoderHandle { get; set; }
    [JsonPropertyName("whyYouWantToJoin")] public string? WhyYouWantToJoin { get; set; }
}

// Ei model IUPC result row er data frontend e pathay.
public class IupcResult
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("contestName")] public string ContestName { get; set; } = string.Empty;
    [JsonPropertyName("contestYear")] public string ContestYear { get; set; } = string.Empty;
    [JsonPropertyName("teamName")] public string TeamName { get; set; } = string.Empty;
    [JsonPropertyName("teamMembers")] public string TeamMembers { get; set; } = string.Empty;
    [JsonPropertyName("rankText")] public string RankText { get; set; } = string.Empty;
    [JsonPropertyName("remarks")] public string Remarks { get; set; } = string.Empty;
    [JsonPropertyName("createdAtUtc")] public DateTime CreatedAtUtc { get; set; }
    [JsonPropertyName("updatedAtUtc")] public DateTime UpdatedAtUtc { get; set; }
}

// Ei input model admin panel theke IUPC result data receive kore.
public class IupcResultInput
{
    [JsonPropertyName("contestName")] public string? ContestName { get; set; }
    [JsonPropertyName("contestYear")] public string? ContestYear { get; set; }
    [JsonPropertyName("teamName")] public string? TeamName { get; set; }
    [JsonPropertyName("teamMembers")] public string? TeamMembers { get; set; }
    [JsonPropertyName("rankText")] public string? RankText { get; set; }
    [JsonPropertyName("remarks")] public string? Remarks { get; set; }
}

// Ei model ICPC result row er data frontend e pathay.
public class IcpcResult
{
    [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
    [JsonPropertyName("contestName")] public string ContestName { get; set; } = string.Empty;
    [JsonPropertyName("contestYear")] public string ContestYear { get; set; } = string.Empty;
    [JsonPropertyName("teamName")] public string TeamName { get; set; } = string.Empty;
    [JsonPropertyName("memberOne")] public string MemberOne { get; set; } = string.Empty;
    [JsonPropertyName("memberTwo")] public string MemberTwo { get; set; } = string.Empty;
    [JsonPropertyName("memberThree")] public string MemberThree { get; set; } = string.Empty;
    [JsonPropertyName("rankText")] public string RankText { get; set; } = string.Empty;
    [JsonPropertyName("createdAtUtc")] public DateTime CreatedAtUtc { get; set; }
}

// Ei input model admin panel theke ICPC result data receive kore.
public class IcpcResultInput
{
    [JsonPropertyName("contestName")] public string? ContestName { get; set; }
    [JsonPropertyName("contestYear")] public string? ContestYear { get; set; }
    [JsonPropertyName("teamName")] public string? TeamName { get; set; }
    [JsonPropertyName("memberOne")] public string? MemberOne { get; set; }
    [JsonPropertyName("memberTwo")] public string? MemberTwo { get; set; }
    [JsonPropertyName("memberThree")] public string? MemberThree { get; set; }
    [JsonPropertyName("rankText")] public string? RankText { get; set; }
}

// Ei result archive operation er response data dhore.
public sealed record ArchiveResult(string Year, List<CommitteeMember> Members, bool YearAlreadyExists);
