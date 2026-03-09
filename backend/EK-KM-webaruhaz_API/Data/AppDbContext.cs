using Microsoft.EntityFrameworkCore;
using EK_KM_webaruhaz_API.Model;

namespace EK_KM_webaruhaz_API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Termek> Termekek { get; set; }
    }
}
