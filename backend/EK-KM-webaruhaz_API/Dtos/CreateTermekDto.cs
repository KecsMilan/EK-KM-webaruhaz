using System.ComponentModel.DataAnnotations.Schema;

namespace EK_KM_webaruhaz_API.Dtos
{
    public class CreateTermekDto
    {
        public string tipus { get; set; }
        public string gyarto { get; set; }
        public string termek_neve { get; set; }
        public int termek_ara { get; set; }
        public string termek_leirasa { get; set; }
        public string tech_adat_1 { get; set; }
        public string tech_adat_2 { get; set; }
        public string tech_adat_3 { get; set; }
        public int mennyiseg { get; set; }
    }
}
