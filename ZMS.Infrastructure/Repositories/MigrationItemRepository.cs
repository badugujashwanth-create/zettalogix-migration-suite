using Microsoft.EntityFrameworkCore;
using ZMS.Core.Enums;
using ZMS.Core.Interfaces;
using ZMS.Core.Models;
using ZMS.Infrastructure.Persistence;

namespace ZMS.Infrastructure.Repositories;

public class MigrationItemRepository : IMigrationItemRepository
{
    private readonly ZmsDbContext _dbContext;

    public MigrationItemRepository(ZmsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<MigrationItem>> GetByJobIdAsync(Guid jobId, CancellationToken cancellationToken)
    {
        return await _dbContext.MigrationItems
            .AsNoTracking()
            .Where(item => item.JobId == jobId)
            .OrderBy(item => item.CreatedUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<MigrationItem>> GetNextBatchAsync(
        Guid jobId,
        int batchSize,
        CancellationToken cancellationToken)
    {
        return await _dbContext.MigrationItems
            .AsNoTracking()
            .Where(item => item.JobId == jobId
                && (item.Status == MigrationItemStatus.Pending || item.Status == MigrationItemStatus.RetryQueued))
            .OrderBy(item => item.CreatedUtc)
            .Take(batchSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountByStatusAsync(MigrationItemStatus status, CancellationToken cancellationToken)
    {
        return _dbContext.MigrationItems.CountAsync(item => item.Status == status, cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<MigrationItem> items, CancellationToken cancellationToken)
    {
        _dbContext.MigrationItems.AddRange(items);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(MigrationItem item, CancellationToken cancellationToken)
    {
        _dbContext.MigrationItems.Update(item);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
