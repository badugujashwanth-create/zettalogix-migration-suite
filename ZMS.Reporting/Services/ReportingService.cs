using ZMS.Core.Enums;
using ZMS.Core.Interfaces;
using ZMS.Core.Models;

namespace ZMS.Reporting.Services;

public class ReportingService : IReportingService
{
    private readonly IMigrationJobRepository _jobRepository;
    private readonly IMigrationItemRepository _itemRepository;
    private readonly ILogRepository _logRepository;

    public ReportingService(
        IMigrationJobRepository jobRepository,
        IMigrationItemRepository itemRepository,
        ILogRepository logRepository)
    {
        _jobRepository = jobRepository;
        _itemRepository = itemRepository;
        _logRepository = logRepository;
    }

    public async Task<JobReport?> GetJobReportAsync(Guid jobId, CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByIdAsync(jobId, cancellationToken);
        if (job is null)
        {
            return null;
        }

        var items = await _itemRepository.GetByJobIdAsync(jobId, cancellationToken);
        var logs = await _logRepository.ListByJobIdAsync(jobId, 100, cancellationToken);
        var totalItems = Math.Max(1, job.TotalItems);

        return new JobReport
        {
            JobId = job.Id,
            JobName = job.Name,
            Status = job.Status,
            TotalItems = job.TotalItems,
            CompletedItems = job.CompletedItems,
            FailedItems = job.FailedItems,
            RetryQueuedItems = items.Count(item => item.Status == MigrationItemStatus.RetryQueued),
            ProgressPercentage = Math.Round((double)job.CompletedItems / totalItems * 100, 2),
            FailedItemsList = items.Where(item => item.Status == MigrationItemStatus.Failed).ToArray(),
            RecentLogs = logs
        };
    }
}
