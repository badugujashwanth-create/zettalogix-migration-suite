using Microsoft.EntityFrameworkCore;
using ZMS.Core.Interfaces;
using ZMS.Core.Models;
using ZMS.Infrastructure.Persistence;

namespace ZMS.Infrastructure.Repositories;

public class LogRepository : ILogRepository
{
    private readonly ZmsDbContext _dbContext;

    public LogRepository(ZmsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(LogEntry entry, CancellationToken cancellationToken)
    {
        _dbContext.Logs.Add(entry);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<LogEntry>> ListByJobIdAsync(Guid jobId, int take, CancellationToken cancellationToken)
    {
        return await _dbContext.Logs
            .AsNoTracking()
            .Where(log => log.JobId == jobId)
            .OrderByDescending(log => log.CreatedUtc)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<LogEntry>> ListRecentAsync(int take, CancellationToken cancellationToken)
    {
        return await _dbContext.Logs
            .AsNoTracking()
            .OrderByDescending(log => log.CreatedUtc)
            .Take(take)
            .ToListAsync(cancellationToken);
    }
}
