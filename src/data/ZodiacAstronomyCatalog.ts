// The REAL astronomical zodiac vs astrological zodiac.
// The Sun's actual position differs from astrological signs by ~1 month
// due to precession, and passes through 13 constellations (including Ophiuchus).

export interface ZodiacEntry {
  constellation: string;
  astronomicalDates: string; // When the Sun is actually in this constellation
  astrologicalDates: string; // Traditional astrological dates
  daysInConstellation: number;
  description: string;
}

export const astronomicalZodiac: ZodiacEntry[] = [
  { constellation:"Capricornus",astronomicalDates:"Jan 20 – Feb 16",astrologicalDates:"Dec 22 – Jan 19",daysInConstellation:28,description:"The Sun spends 28 days in Capricornus. Precession has shifted the astronomical dates about one sign from traditional astrology." },
  { constellation:"Aquarius",astronomicalDates:"Feb 16 – Mar 12",astrologicalDates:"Jan 20 – Feb 18",daysInConstellation:24,description:"The Water Bearer. The Sun passes through for 24 days." },
  { constellation:"Pisces",astronomicalDates:"Mar 12 – Apr 18",astrologicalDates:"Feb 19 – Mar 20",daysInConstellation:37,description:"The largest zodiac constellation. The Sun spends 37 days here — the longest of any sign." },
  { constellation:"Aries",astronomicalDates:"Apr 18 – May 14",astrologicalDates:"Mar 21 – Apr 19",daysInConstellation:26,description:"Once contained the vernal equinox point. Precession has moved it into Pisces." },
  { constellation:"Taurus",astronomicalDates:"May 14 – Jun 21",astrologicalDates:"Apr 20 – May 20",daysInConstellation:38,description:"The Sun passes near the Pleiades and Hyades during this period." },
  { constellation:"Gemini",astronomicalDates:"Jun 21 – Jul 20",astrologicalDates:"May 21 – Jun 20",daysInConstellation:29,description:"Contains the summer solstice point. The Sun is near Castor and Pollux." },
  { constellation:"Cancer",astronomicalDates:"Jul 20 – Aug 10",astrologicalDates:"Jun 21 – Jul 22",daysInConstellation:21,description:"The smallest zodiac constellation. The Sun passes through in just 21 days." },
  { constellation:"Leo",astronomicalDates:"Aug 10 – Sep 16",astrologicalDates:"Jul 23 – Aug 22",daysInConstellation:37,description:"The Sun passes near Regulus, one of the brightest stars near the ecliptic." },
  { constellation:"Virgo",astronomicalDates:"Sep 16 – Oct 31",astrologicalDates:"Aug 23 – Sep 22",daysInConstellation:45,description:"The Sun spends 45 days in Virgo — more than any other zodiac constellation." },
  { constellation:"Libra",astronomicalDates:"Oct 31 – Nov 23",astrologicalDates:"Sep 23 – Oct 22",daysInConstellation:23,description:"Contains the autumnal equinox point. Once considered part of Scorpius." },
  { constellation:"Scorpius",astronomicalDates:"Nov 23 – Nov 30",astrologicalDates:"Oct 23 – Nov 21",daysInConstellation:7,description:"The Sun passes through Scorpius in only 7 days — by far the shortest zodiac transit." },
  { constellation:"Ophiuchus",astronomicalDates:"Nov 30 – Dec 18",astrologicalDates:"(not in traditional astrology)",daysInConstellation:18,description:"The 13th zodiac constellation! The Sun spends 18 days here, more than in Scorpius. Excluded from astrology by tradition, not astronomy." },
  { constellation:"Sagittarius",astronomicalDates:"Dec 18 – Jan 20",astrologicalDates:"Nov 22 – Dec 21",daysInConstellation:33,description:"The Sun passes through the direction of the galactic center during this period." }
];

export function getAstronomicalSign(date: Date): ZodiacEntry {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const md = month * 100 + day;
  if (md >= 120 && md < 216) return astronomicalZodiac[0];
  if (md >= 216 && md < 312) return astronomicalZodiac[1];
  if (md >= 312 && md < 418) return astronomicalZodiac[2];
  if (md >= 418 && md < 514) return astronomicalZodiac[3];
  if (md >= 514 && md < 621) return astronomicalZodiac[4];
  if (md >= 621 && md < 720) return astronomicalZodiac[5];
  if (md >= 720 && md < 810) return astronomicalZodiac[6];
  if (md >= 810 && md < 916) return astronomicalZodiac[7];
  if (md >= 916 && md < 1031) return astronomicalZodiac[8];
  if (md >= 1031 && md < 1123) return astronomicalZodiac[9];
  if (md >= 1123 && md < 1130) return astronomicalZodiac[10];
  if (md >= 1130 && md < 1218) return astronomicalZodiac[11];
  return astronomicalZodiac[12];
}
