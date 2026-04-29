using Microsoft.AspNetCore.Mvc;

namespace ZMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            Status = "Healthy",
            UtcNow = DateTimeOffset.UtcNow
        });
    }
}
