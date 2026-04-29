namespace ZMS.Core.Options;

public class MigrationEngineOptions
{
    public const string SectionName = "MigrationEngine";

    public int DefaultBatchSize { get; set; } = 20;
    public int DefaultMaxRetryCount { get; set; } = 3;
    public int BatchDelayMilliseconds { get; set; } = 250;
}
