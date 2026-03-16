using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EK_KM_webaruhaz_API.Model
{
    [Table("Termek")]
    public class Termek
    {
        [Key]
        public int id { get; set; }
        [Column(TypeName = "varchar(100)")]
        public string tipus { get; set; }
        [Column(TypeName = "varchar(100)")]
        public string gyarto { get; set; }
        [Column(TypeName = "varchar(100)")]
        public string termek_neve { get; set; }
        [Column(TypeName = "int")]
        public int termek_ara { get; set; }
        [Column(TypeName = "varchar(300)")]
        public string termek_leirasa { get; set; }
        [Column(TypeName = "varchar(100)")]
        public string tech_adat_1 { get; set; }
        [Column(TypeName = "varchar(100)")]
        public string tech_adat_2 { get; set; }
        [Column(TypeName = "varchar(100)")]
        public string tech_adat_3 { get; set; }
        [Column(TypeName = "int")]
        public int mennyiseg { get; set; }
    }
}
