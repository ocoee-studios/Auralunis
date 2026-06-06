// Genuinely rare celestial events — things that happen once in a lifetime or less.
export interface RareEvent {
  id: string;
  name: string;
  date: string;
  yearsUntil: number;
  lastOccurred: string;
  frequency: string;
  description: string;
  rarity: "once_per_decade" | "once_per_generation" | "once_per_century" | "once_per_millennium";
}

export const rareEvents: RareEvent[] = [
  { id:"venus_transit",name:"Transit of Venus",date:"2117-12-11",yearsUntil:91,lastOccurred:"2012-06-05",frequency:"Pairs separated by 8 years, then 105-122 year gaps",description:"Venus passes directly between Earth and the Sun, visible as a tiny black dot crossing the solar disk. The next pair won't occur until 2117 and 2125.",rarity:"once_per_century" },
  { id:"mercury_transit",name:"Transit of Mercury",date:"2032-11-13",yearsUntil:6,lastOccurred:"2019-11-11",frequency:"About 13 times per century",description:"Mercury passes across the face of the Sun. Requires a telescope with solar filter to observe.",rarity:"once_per_decade" },
  { id:"great_conjunction",name:"Great Conjunction (Jupiter-Saturn)",date:"2040-10-31",yearsUntil:14,lastOccurred:"2020-12-21",frequency:"Every ~20 years, but extremely close ones are rare",description:"Jupiter and Saturn appear to nearly merge in the sky. The 2020 event was the closest since 1623.",rarity:"once_per_generation" },
  { id:"total_solar_us",name:"Total Solar Eclipse (Contiguous US)",date:"2044-08-23",yearsUntil:18,lastOccurred:"2024-04-08",frequency:"Any given location: ~375 years between totalities",description:"The Moon completely blocks the Sun. Totality is visible only from a narrow path. The next one crossing the US is 2044 (Montana) and 2045 (coast to coast).",rarity:"once_per_generation" },
  { id:"halley",name:"Halley's Comet Return",date:"2061-07-28",yearsUntil:35,lastOccurred:"1986-02-09",frequency:"Every ~75-79 years",description:"The most famous periodic comet, visible to the naked eye. Mark Twain was born and died during Halley's appearances (1835 and 1910).",rarity:"once_per_century" },
  { id:"betelgeuse_supernova",name:"Betelgeuse Supernova (predicted)",date:"unknown",yearsUntil:-1,lastOccurred:"Never observed",frequency:"Within the next 100,000 years",description:"When Betelgeuse explodes, it will be visible in daylight for weeks and at night for months. It would briefly rival the full Moon in brightness.",rarity:"once_per_millennium" },
  { id:"pole_star_shift",name:"Vega Becomes Pole Star",date:"13700",yearsUntil:11674,lastOccurred:"~12000 BC",frequency:"~26,000 year precession cycle",description:"Earth's axial precession will eventually make Vega the North Star, as it was ~14,000 years ago. Currently Polaris holds the title.",rarity:"once_per_millennium" },
  { id:"andromeda_merger",name:"Andromeda-Milky Way Merger Begins",date:"~4500002026",yearsUntil:4500000000,lastOccurred:"Never",frequency:"Once",description:"The Andromeda Galaxy is approaching at 110 km/s. In ~4.5 billion years, the two galaxies will merge into 'Milkomeda.' The night sky will be utterly transformed.",rarity:"once_per_millennium" }
];

export function getUpcomingRareEvents(): RareEvent[] {
  return rareEvents.filter(e => e.yearsUntil > 0).sort((a, b) => a.yearsUntil - b.yearsUntil);
}
