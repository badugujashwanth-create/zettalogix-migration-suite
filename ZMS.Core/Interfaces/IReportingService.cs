using ZMS.Core.Models;

namespace ZMS.Core.Interfaces;

public interface IReportingService
{
    Task<JobReport?> GetJobReportAsync(Guid jobId, CancellationToken cancellationToken);
}
