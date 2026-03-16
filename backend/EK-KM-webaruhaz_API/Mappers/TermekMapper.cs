using System.Runtime.CompilerServices;
using EK_KM_webaruhaz_API.Model;
using EK_KM_webaruhaz_API.Dtos;

namespace EK_KM_webaruhaz_API.Mappers
{
    public static class TermekMapper
    {
        public static Termek ToTermekDto(this CreateTermekDto termekModel) 
        {
            return new Termek
            {
                tipus = termekModel.tipus,
                gyarto = termekModel.gyarto,
                termek_neve = termekModel.termek_neve,
                termek_ara = termekModel.termek_ara,
                termek_leirasa = termekModel.termek_leirasa,
                tech_adat_1 = termekModel.tech_adat_1,
                tech_adat_2 = termekModel.tech_adat_2,
                tech_adat_3 = termekModel.tech_adat_3,
                mennyiseg = termekModel.mennyiseg,
            };
                
        }
    }
}
