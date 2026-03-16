using EK_KM_webaruhaz_API.Data;
using EK_KM_webaruhaz_API.Dtos;
using EK_KM_webaruhaz_API.Mappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace EK_KM_webaruhaz_API.Controllers
{
    [ApiController]
    [Route("api/termek")]
    public class TermekController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public TermekController(ApplicationDbContext dbContext) 
        {
            _dbContext = dbContext;
        }

        [HttpPost]
        public async Task<ActionResult> PostTermek([FromBody] CreateTermekDto termekdto) 
        {
            var termekModel = termekdto.ToTermekDto();
            _dbContext.Add(termekModel);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult> GetTermekek() 
        {
            var termekek = _dbContext.Termekek.ToList();

            return Ok(termekek);
        }
    }


}
