export interface MeteorShower {
  id: string; name: string; peakMonth: number; peakDay: number;
  activeStart: string; activeEnd: string;
  ratePerHour: number; speed: string; parentBody: string;
  radiantConstellation: string; bestViewing: string;
  description: string;
}

export const meteorShowers: MeteorShower[] = [
  { id:"quadrantids",name:"Quadrantids",peakMonth:1,peakDay:4,activeStart:"Dec 28",activeEnd:"Jan 12",ratePerHour:120,speed:"41 km/s",parentBody:"Asteroid 2003 EH1",radiantConstellation:"Boötes",bestViewing:"Pre-dawn, face northeast. Very short peak (6 hours).",description:"One of the strongest annual showers but often missed due to its extremely short peak window and January weather." },
  { id:"lyrids",name:"Lyrids",peakMonth:4,peakDay:22,activeStart:"Apr 16",activeEnd:"Apr 25",ratePerHour:18,speed:"49 km/s",parentBody:"Comet C/1861 G1 Thatcher",radiantConstellation:"Lyra",bestViewing:"After midnight, look overhead toward Vega.",description:"One of the oldest known meteor showers — Chinese records describe it in 687 BC. Occasionally produces surprise outbursts of 100+ per hour." },
  { id:"eta_aquariids",name:"Eta Aquariids",peakMonth:5,peakDay:6,activeStart:"Apr 19",activeEnd:"May 28",ratePerHour:50,speed:"66 km/s",parentBody:"Comet 1P/Halley",radiantConstellation:"Aquarius",bestViewing:"Best from the Southern Hemisphere. Pre-dawn, low in the east.",description:"Debris from Halley's Comet. Fast meteors that often leave persistent glowing trains." },
  { id:"delta_aquariids",name:"Delta Aquariids",peakMonth:7,peakDay:30,activeStart:"Jul 12",activeEnd:"Aug 23",ratePerHour:25,speed:"41 km/s",parentBody:"Comet 96P/Machholz",radiantConstellation:"Aquarius",bestViewing:"After midnight, face south. Best from southern latitudes.",description:"A reliable warm-weather shower that overlaps with the early Perseids." },
  { id:"perseids",name:"Perseids",peakMonth:8,peakDay:12,activeStart:"Jul 17",activeEnd:"Aug 24",ratePerHour:100,speed:"59 km/s",parentBody:"Comet 109P/Swift-Tuttle",radiantConstellation:"Perseus",bestViewing:"After midnight, face northeast. Warm summer nights make this the most popular shower.",description:"The most popular meteor shower. Consistently produces bright, fast meteors with frequent fireballs. Active during warm August nights with the Milky Way overhead." },
  { id:"draconids",name:"Draconids",peakMonth:10,peakDay:8,activeStart:"Oct 6",activeEnd:"Oct 10",ratePerHour:10,speed:"20 km/s",parentBody:"Comet 21P/Giacobini-Zinner",radiantConstellation:"Draco",bestViewing:"Evening hours, face northwest. Unlike most showers, best before midnight.",description:"Usually modest, but capable of spectacular storms — over 10,000 per hour in 1933 and 1946." },
  { id:"orionids",name:"Orionids",peakMonth:10,peakDay:21,activeStart:"Oct 2",activeEnd:"Nov 7",ratePerHour:20,speed:"66 km/s",parentBody:"Comet 1P/Halley",radiantConstellation:"Orion",bestViewing:"After midnight, face southeast. Fast meteors near Betelgeuse.",description:"The second shower from Halley's Comet debris. Known for fast, bright meteors with persistent trains." },
  { id:"leonids",name:"Leonids",peakMonth:11,peakDay:17,activeStart:"Nov 6",activeEnd:"Nov 30",ratePerHour:15,speed:"71 km/s",parentBody:"Comet 55P/Tempel-Tuttle",radiantConstellation:"Leo",bestViewing:"After midnight, face east. The fastest common meteors.",description:"Famous for producing meteor storms — thousands per hour in 1833, 1866, 1966, and 2001. The fastest common shower at 71 km/s." },
  { id:"geminids",name:"Geminids",peakMonth:12,peakDay:14,activeStart:"Dec 4",activeEnd:"Dec 17",ratePerHour:150,speed:"35 km/s",parentBody:"Asteroid 3200 Phaethon",radiantConstellation:"Gemini",bestViewing:"All night, best around 2 AM. Face overhead.",description:"The strongest and most reliable annual shower. Produces bright, colorful, medium-speed meteors. Unusually, its parent body is an asteroid (or dead comet) rather than an active comet." },
  { id:"ursids",name:"Ursids",peakMonth:12,peakDay:22,activeStart:"Dec 17",activeEnd:"Dec 26",ratePerHour:10,speed:"33 km/s",parentBody:"Comet 8P/Tuttle",radiantConstellation:"Ursa Minor",bestViewing:"Pre-dawn, face north toward Polaris.",description:"A modest shower near the winter solstice. Occasionally surprises with rates of 50+ per hour." }
];

export function getUpcomingShowers(withinDays: number = 60): MeteorShower[] {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return meteorShowers.filter(s => {
    const diff = (s.peakMonth - m) * 30 + (s.peakDay - d);
    return diff >= -3 && diff <= withinDays;
  });
}
