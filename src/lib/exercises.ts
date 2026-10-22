import type { Equipment, Workout } from "@/lib/balans";

export type Muscle = "bröst" | "rygg" | "ben" | "axlar" | "armar" | "bål" | "rumpa" | "helkropp" | "kondition";
export type TrackType = "vikt" | "reps" | "tid";

export const MUSCLES: { value: Muscle; label: string }[] = [
  { value: "bröst", label: "Bröst" },
  { value: "rygg", label: "Rygg" },
  { value: "ben", label: "Ben" },
  { value: "axlar", label: "Axlar" },
  { value: "armar", label: "Armar" },
  { value: "bål", label: "Bål" },
  { value: "rumpa", label: "Rumpa" },
  { value: "helkropp", label: "Helkropp" },
  { value: "kondition", label: "Kondition" },
];

export interface ExercisePreset {
  id: string;
  name: string;
  nameEn: string;
  muscle: Muscle;
  secondary?: Muscle | undefined;
  eq: Equipment[];
  track: TrackType;
  desc: string;
  tips: string[];
  restSec: number;
  custom?: boolean | undefined;
}

type Row = [string, string, Muscle, Equipment[], TrackType, string, string];
const r = (row: Row, restSec = 60): ExercisePreset => {
  const [name, nameEn, muscle, eq, track, desc, tip] = row;
  return { id: name.toLowerCase().replace(/[^a-zåäö0-9]+/g, "-"), name, nameEn, muscle, eq, track, desc, tips: [tip], restSec };
};

/* 100+ fördefinierade övningar. Beskrivningarna är generella teknikråd, inte medicinska råd. */
export const EXERCISES: ExercisePreset[] = [
  // Bröst
  r(["Bänkpress", "Bench press", "bröst", ["gym"], "vikt", "Ligg på bänken, sänk stången kontrollerat till bröstet och pressa upp.", "Håll handlederna raka och skulderbladen ihop."], 90),
  r(["Bänkpress med hantlar", "Dumbbell bench press", "bröst", ["hantlar", "gym"], "vikt", "Pressa hantlarna upp från brösthöjd med kontrollerad rörelse.", "Sänk långsamt och andas ut på vägen upp."], 90),
  r(["Lutande bänkpress", "Incline bench press", "bröst", ["gym"], "vikt", "Som bänkpress men på lutande bänk – träffar övre bröstet.", "Luta bänken cirka 30–45 grader."], 90),
  r(["Flyes med hantlar", "Dumbbell flyes", "bröst", ["hantlar", "gym"], "vikt", "Sänk hantlarna i en båge utåt och för samman dem över bröstet.", "Håll en lätt böj i armbågarna hela tiden."], 60),
  r(["Armhävningar", "Push-ups", "bröst", ["ingen"], "reps", "Sänk kroppen med rak rygg tills bröstet nästan nuddar golvet.", "Spänn bålen och håll nacken neutral."], 60),
  r(["Armhävningar på knä", "Knee push-ups", "bröst", ["ingen"], "reps", "Som vanliga armhävningar men med knäna i golvet.", "Bra start – öka gradvis till hela armhävningar."], 60),
  r(["Dips", "Dips", "bröst", ["gym"], "reps", "Sänk kroppen mellan barren och pressa upp.", "Luta dig lite framåt för mer bröst, upprätt för mer triceps."], 90),
  r(["Kabelpress", "Cable chest press", "bröst", ["gym"], "vikt", "Pressa handtagen framåt från brösthöjd i kabelkorset.", "Håll bröstet upp och armbågarna i linje med handlederna."], 60),
  r(["Bröstpress i maskin", "Chest press machine", "bröst", ["gym"], "vikt", "Pressa handtagen framåt tills armarna är nästan raka.", "Justera sätet så handtagen hamnar i brösthöjd."], 60),
  // Rygg
  r(["Marklyft", "Deadlift", "rygg", ["gym"], "vikt", "Lyft stången från golvet med rak rygg tills du står upprätt.", "Tryck ifrån med benen och håll stången nära kroppen."], 120),
  r(["Rumänsk marklyft", "Romanian deadlift", "rygg", ["hantlar", "gym", "kettlebell"], "vikt", "Sänk vikten längs benen med nästan raka knän tills du känner stretch i baksidan.", "Rörelsen sker i höfterna – ryggen hålls rak."], 90),
  r(["Skivstångsrodd", "Barbell row", "rygg", ["gym"], "vikt", "Luta framåt med rak rygg och ro stången mot magen.", "Dra med armbågarna, inte med armarna."], 90),
  r(["Hantelrodd", "Dumbbell row", "rygg", ["hantlar", "gym"], "vikt", "Stöd dig mot en bänk och ro hanteln upp mot höften.", "Håll bålen stilla och pressa ihop skulderbladen upptill."], 60),
  r(["Latsdrag", "Lat pulldown", "rygg", ["gym"], "vikt", "Dra stången ner mot övre bröstet med brett grepp.", "Luta dig minimalt bakåt och dra med ryggen."], 60),
  r(["Chins", "Pull-ups", "rygg", ["gym"], "reps", "Häng i en stång och dra upp kroppen tills hakan är över.", "Börja med gummiband som stöd om det är tungt."], 90),
  r(["Sittande kabelrodd", "Seated cable row", "rygg", ["gym"], "vikt", "Dra handtaget mot magen med upprätt rygg.", "Pressa ihop skulderbladen i slutläget."], 60),
  r(["Roddmaskin", "Rowing machine", "kondition", ["gym"], "tid", "Rodd med ben, bål och armar i en flytande rörelse.", "Driva med benen först, armarna sist."], 30),
  r(["Bandrodd", "Band row", "rygg", ["gummiband"], "reps", "Sitt med benen raka, ro bandet mot magen.", "Håll ryggen rak och axlarna nere."], 45),
  r(["Superman", "Superman hold", "rygg", ["ingen"], "tid", "Ligg på mage och lyft armar och ben samtidigt.", "Små lyft räcker – kvalitet före höjd."], 30),
  r(["Omvänd flyes", "Reverse flyes", "rygg", ["hantlar", "gym"], "vikt", "Luta framåt och lyft hantlarna utåt i en båge.", "Lätta vikter – känn kontakten mellan skulderbladen."], 60),
  // Ben
  r(["Knäböj", "Squat", "ben", ["ingen"], "reps", "Sänk höfterna bakåt och nedåt som om du sätter dig på en stol.", "Håll knäna i samma riktning som tårna."], 60),
  r(["Knäböj med skivstång", "Barbell back squat", "ben", ["gym"], "vikt", "Stången på övre ryggen, böj djupt med kontroll och pressa upp.", "Andas in på vägen ner, håll bålen spänd."], 120),
  r(["Goblet squat", "Goblet squat", "ben", ["hantlar", "kettlebell", "gym"], "vikt", "Håll en vikt framför bröstet och gör en djup knäböj.", "Bra för att lära sig tekniken i knäböj."], 60),
  r(["Benpress", "Leg press", "ben", ["gym"], "vikt", "Pressa plattformen upp med fötterna utan att låsa knäna.", "Sänk kontrollerat tills knäna är cirka 90 grader."], 90),
  r(["Utfallssteg", "Lunges", "ben", ["ingen"], "reps", "Ta ett stort steg framåt och sänk bakre knät mot golvet.", "Håll överkroppen upprätt och främre knät stabilt."], 60),
  r(["Utfallssteg med hantlar", "Dumbbell lunges", "ben", ["hantlar", "gym"], "vikt", "Utfallssteg med en hantel i varje hand.", "Korta steg tränar mer framsida, långa steg mer rumpa."], 60),
  r(["Bulgariska utfall", "Bulgarian split squat", "ben", ["hantlar", "gym"], "vikt", "Bakre foten på en bänk, sänk höfterna rakt ner.", "Tung övning – börja utan vikt."], 90),
  r(["Bencurl", "Leg curl", "ben", ["gym"], "vikt", "Curla vikten upp mot rumpan med baksida lår.", "Sänk långsamt för bäst effekt."], 60),
  r(["Bensträck", "Leg extension", "ben", ["gym"], "vikt", "Sträck ut benen mot motstånd från sittande.", "Kontrollera rörelsen hela vägen ner."], 60),
  r(["Tåhävningar", "Calf raises", "ben", ["ingen", "hantlar", "gym"], "reps", "Res dig på tårna och sänk långsamt.", "Gör full rörelse – upp högt, ner djupt."], 45),
  r(["Wall sit", "Wall sit", "ben", ["ingen"], "tid", "Sitt mot en vägg med knäna i 90 grader.", "Andas lugnt och håll ryggen mot väggen."], 30),
  r(["Sidoutfall", "Side lunges", "ben", ["ingen"], "reps", "Steg ut åt sidan och sänk dig över det böjda benet.", "Håll det raka benet sträckt och bröstet upp."], 45),
  // Axlar
  r(["Axelpress med hantlar", "Dumbbell shoulder press", "axlar", ["hantlar", "gym"], "vikt", "Pressa hantlarna upp över huvudet från axelhöjd.", "Håll bålen spänd och undvik att svanka."], 90),
  r(["Militärpress", "Overhead press", "axlar", ["gym"], "vikt", "Pressa stången från bröstet rakt upp över huvudet.", "Spänn rumpa och bål för en stabil bas."], 90),
  r(["Sidolyft", "Lateral raises", "axlar", ["hantlar", "gummiband", "gym"], "vikt", "Lyft hantlarna utåt till axelhöjd.", "Lätta vikter och mjuk armbåge – sänk långsamt."], 45),
  r(["Framåtlyft", "Front raises", "axlar", ["hantlar", "gym"], "vikt", "Lyft hanteln rakt framåt till axelhöjd.", "Växla arm eller kör båda samtidigt."], 45),
  r(["Face pulls", "Face pulls", "axlar", ["gym", "gummiband"], "vikt", "Dra repet eller bandet mot ansiktet med armbågarna högt.", "Bra för hållningen och friska axlar."], 45),
  r(["Shrugs", "Shrugs", "axlar", ["hantlar", "gym"], "vikt", "Lyft axlarna rakt upp mot öronen med vikter i händerna.", "Håll uppe en sekund innan du sänker."], 45),
  r(["Axelpress i maskin", "Shoulder press machine", "axlar", ["gym"], "vikt", "Pressa handtagen uppåt från axelhöjd i maskin.", "Justera sätet så handtagen startar vid axlarna."], 60),
  // Armar
  r(["Bicepscurls", "Bicep curls", "armar", ["hantlar", "gym"], "vikt", "Curla hantlarna upp mot axlarna med stilla överarmar.", "Sänk långsamt – där händer halva magin."], 45),
  r(["Hantelcurls med hammersgrepp", "Hammer curls", "armar", ["hantlar", "gym"], "vikt", "Curla med handflatorna vända mot varandra.", "Tränar även underarmarna."], 45),
  r(["Skivstångscurl", "Barbell curl", "armar", ["gym"], "vikt", "Curla stången med axelbrett grepp.", "Håll armbågarna stilla vid sidan av kroppen."], 60),
  r(["Triceps pushdown", "Triceps pushdown", "armar", ["gym"], "vikt", "Pressa handtaget rakt ner tills armarna är raka.", "Håll armbågarna tätt intill kroppen."], 45),
  r(["Tricepsdips på bänk", "Bench dips", "armar", ["ingen"], "reps", "Händerna på en bänk bakom dig, sänk höfterna mot golvet.", "Ju längre ut fötterna, desto tyngre."], 45),
  r(["Fransk press", "Skullcrushers", "armar", ["hantlar", "gym"], "vikt", "Liggande, sänk vikten mot pannan och sträck ut armarna.", "Håll överarmarna stilla och pekande uppåt."], 60),
  r(["Armhävningar med smalt grepp", "Close-grip push-ups", "armar", ["ingen"], "reps", "Armhävningar med händerna nära varandra – mer triceps.", "Håll armbågarna längs kroppen."], 45),
  r(["Kabelcurl", "Cable curl", "armar", ["gym"], "vikt", "Curla handtaget i kabelstationen.", "Jämnt motstånd hela rörelsen."], 45),
  // Bål
  r(["Planka", "Plank", "bål", ["ingen"], "tid", "Stöd på underarmar och tår med rak kropp.", "Spänn rumpan och dra in naveln lätt."], 30),
  r(["Sidoplanka", "Side plank", "bål", ["ingen"], "tid", "Stöd på en underarm med kroppen rak i sidled.", "Höfterna uppe – håll eller sänk långsamt."], 30),
  r(["Crunches", "Crunches", "bål", ["ingen"], "reps", "Rulla upp överkroppen från ryggläge.", "Dra inte i nacken – blicken mot taket."], 30),
  r(["Benlyft liggande", "Leg raises", "bål", ["ingen"], "reps", "Ligg på rygg och lyft raka ben mot taket.", "Sänk långsamt utan att svanka."], 45),
  r(["Ryska twist", "Russian twists", "bål", ["ingen", "hantlar", "kettlebell"], "reps", "Sitt med lätt bakåtlut och rotera överkroppen sida till sida.", "Följ med blicken och andas lugnt."], 30),
  r(["Mountain climbers", "Mountain climbers", "bål", ["ingen"], "tid", "Plankposition, dra knäna mot bröstet i raskt tempo.", "Håll höfterna lågt och jämnt."], 30),
  r(["Dead bug", "Dead bug", "bål", ["ingen"], "reps", "Ligg på rygg och sträck ut motsatt arm och ben långsamt.", "Tryck nedre ryggen mot golvet hela tiden."], 30),
  r(["Bird dog", "Bird dog", "bål", ["ingen"], "reps", "På alla fyra, sträck ut motsatt arm och ben.", "Röra dig långsamt och håll balansen."], 30),
  r(["Bålrotation med band", "Pallof press", "bål", ["gummiband", "gym"], "reps", "Pressa bandet rakt fram och motstå rotationen.", "Stark övning för stabilitet i vardagen."], 45),
  // Rumpa
  r(["Glute bridge", "Glute bridge", "rumpa", ["ingen"], "reps", "Ligg på rygg och lyft höfterna tills kroppen är rak.", "Kläm rumpan upptill en sekund."], 45),
  r(["Höftlyft med skivstång", "Hip thrust", "rumpa", ["gym"], "vikt", "Ryggen mot en bänk, lyft höfterna med stång över höften.", "Full höftsträckning upptill utan att svanka."], 90),
  r(["Höftlyft med hantel", "Dumbbell hip thrust", "rumpa", ["hantlar"], "vikt", "Som hip thrust men med en hantel på höfterna.", "Bra hemmavariant av hip thrust."], 60),
  r(["Kickbacks med band", "Band kickbacks", "rumpa", ["gummiband"], "reps", "På alla fyra, pressa benet bakåt och uppåt mot bandets motstånd.", "Håll bålen stilla – rörelsen kommer från höften."], 45),
  r(["Sumoknäböj", "Sumo squat", "rumpa", ["hantlar", "kettlebell", "gym"], "vikt", "Bred knäböj med tårna utåt och vikt mellan benen.", "Tryck knäna utåt i linje med tårna."], 60),
  r(["Sidosteg med band", "Band lateral walks", "rumpa", ["gummiband"], "reps", "Band runt benen, gå i sidled med spänstiga steg.", "Håll konstant spänning i bandet."], 30),
  r(["Ettbens glute bridge", "Single-leg glute bridge", "rumpa", ["ingen"], "reps", "Glute bridge på ett ben i taget.", "Håll höfterna i nivå hela rörelsen."], 45),
  // Helkropp
  r(["Burpees", "Burpees", "helkropp", ["ingen"], "reps", "Ner i plank, upp och hoppa – en helkroppsklassiker.", "Ta det i ditt tempo, formen först."], 60),
  r(["Kettlebellsving", "Kettlebell swing", "helkropp", ["kettlebell"], "vikt", "Svinga kettlebellen till brösthöjd med kraft från höfterna.", "Det är en höftrörelse, inte en armlyft."], 60),
  r(["Thrusters", "Thrusters", "helkropp", ["hantlar", "gym"], "vikt", "Knäböj direkt upp i en axelpress i en flytande rörelse.", "Andas i toppen och håll jämnt tempo."], 90),
  r(["Rensa och pressa", "Clean and press", "helkropp", ["gym"], "vikt", "Rens stången till axlarna och pressa upp över huvudet.", "Tekniktungt – börja lätt eller fråga på gymmet."], 120),
  r(["Farmers walk", "Farmer's carry", "helkropp", ["hantlar", "kettlebell", "gym"], "tid", "Gå med tunga vikter i händerna med rak hållning.", "Korta, stolta steg och starka grepp."], 60),
  r(["Turkish get-up", "Turkish get-up", "helkropp", ["kettlebell", "hantlar"], "reps", "Res dig från ryggläge till stående med en vikt ovanför huvudet.", "Lär dig utan vikt först."], 90),
  r(["Bänksteg", "Step-ups", "helkropp", ["ingen", "hantlar"], "reps", "Kliv upp på en bänk och pressa upp hela kroppen.", "Driv genom hela foten på bänken."], 45),
  // Kondition
  r(["Jumping jacks", "Jumping jacks", "kondition", ["ingen"], "tid", "Hoppa med armar och ben utåt och tillbaka.", "Mjuka landningar på framfoten."], 30),
  r(["Höga knän", "High knees", "kondition", ["ingen"], "tid", "Spring på stället med knäna upp i höfthöjd.", "Håll ett studsande, lätt tempo."], 30),
  r(["Skridskohopp", "Skater jumps", "kondition", ["ingen"], "tid", "Hoppa sida till sida som en skridskoåkare.", "Landa mjukt på ett ben i taget."], 30),
  r(["Intervalljoggning", "Interval running", "kondition", ["ingen"], "tid", "Växla raskt tempo med lugn jogg.", "Börja kort: 30 sek raskt, 90 sek lugnt."], 60),
  r(["Cykling", "Cycling", "kondition", ["gym"], "tid", "Trampa i jämnt tempo på motionscykel.", "Justera motståndet så du kan prata korta meningar."], 30),
  r(["Crosstrainer", "Elliptical", "kondition", ["gym"], "tid", "Mjuk helkroppscardio utan stötar.", "Håll upprätt hållning och använd armarna."], 30),
  r(["Boxjumps", "Box jumps", "kondition", ["gym"], "reps", "Hoppa upp på en låda och kliv ner kontrollerat.", "Landa mjukt med böjda knän."], 60),
  r(["Battling ropes", "Battle ropes", "kondition", ["gym"], "tid", "Slå vågor i tunga rep med armarna.", "Korta intervaller med full intensitet."], 45),
  r(["Roddintervaller", "Rowing intervals", "kondition", ["gym"], "tid", "Korta, intensiva drag på roddmaskinen.", "Teknik före fart – ben, bål, armar."], 60),
  r(["Trappsteg", "Stair climbs", "kondition", ["ingen"], "tid", "Gå eller jogga i trappor i intervaller.", "Använd räcket vid behov och andas lugnt."], 45),
  // Fler ben/rygg/bröst för att nå 100+
  r(["Front squat", "Front squat", "ben", ["gym"], "vikt", "Knäböj med stången vilande framtill på axlarna.", "Håll armbågarna högt och bröstet upp."], 120),
  r(["Hack squat", "Hack squat", "ben", ["gym"], "vikt", "Knäböj i maskin med stöd för ryggen.", "Placera fötterna lite framåt för knävänlig vinkel."], 90),
  r(["Good mornings", "Good mornings", "rygg", ["gym"], "vikt", "Stång på ryggen, luta framåt med rak rygg från höfterna.", "Lätt vikt – känn stretch i baksida lår."], 90),
  r(["Dragkedja", "Upright row", "axlar", ["hantlar", "gym"], "vikt", "Dra vikten upp längs kroppen till brösthöjd.", "Armbågarna leder rörelsen."], 60),
  r(["Push press", "Push press", "axlar", ["gym"], "vikt", "Använd benen för att skjutsa upp stången över huvudet.", "Explosivt upp, kontrollerat ner."], 90),
  r(["Pec deck", "Pec deck", "bröst", ["gym"], "vikt", "För samman armarna framför bröstet i maskin.", "Kläm bröstmusklerna i slutläget."], 60),
  r(["Sving med hantel", "Dumbbell swing", "helkropp", ["hantlar"], "vikt", "Som kettlebellsving men med en hantel.", "Kraften kommer från höfterna."], 60),
  r(["Bear crawl", "Bear crawl", "helkropp", ["ingen"], "tid", "Kryp framåt på händer och fötter med knäna strax över golvet.", "Håll ryggen rak och rör dig kontrollerat."], 30),
  r(["Planka med axeltryck", "Plank shoulder taps", "bål", ["ingen"], "reps", "I planka, tryck motsatt axel utan att vicka höfterna.", "Breda ben gör det lättare."], 30),
  r(["V-ups", "V-ups", "bål", ["ingen"], "reps", "Lyft samtidigt ben och överkropp så kroppen bildar ett V.", "Andas ut upptill."], 45),
  r(["Hollow hold", "Hollow hold", "bål", ["ingen"], "tid", "Ligg på rygg med armar och ben strax över golvet.", "Tryck nedre ryggen i golvet."], 30),
  r(["Kneeling press", "Half-kneeling press", "axlar", ["hantlar", "kettlebell"], "vikt", "Axelpress stående på knä – tränar stabilitet.", "Spänn rumpan på det främre benet."], 60),
  r(["Ringrodd", "Inverted row", "rygg", ["gym"], "reps", "Häng under en stång och dra bröstet upp mot den.", "Ju mer vågrätt du ligger, desto tyngre."], 60),
  r(["Pullovers", "Dumbbell pullover", "rygg", ["hantlar", "gym"], "vikt", "Ligg tvärs över en bänk och för hanteln i en båge bakom huvudet.", "Känn stretchen i sidryggen."], 60),
  r(["Knäböjshopp", "Squat jumps", "ben", ["ingen"], "reps", "Knäböj upp i ett explosivt hopp.", "Landa mjukt och gå direkt ner i nästa."], 45),
  r(["Bulgarian med kroppsvikt", "Bodyweight split squat", "ben", ["ingen"], "reps", "Bulgariska utfall utan vikt.", "Perfekt för att lära sig balansen."], 45),
  r(["Glute kickback i maskin", "Cable kickback", "rumpa", ["gym"], "vikt", "Pressa benet bakåt mot kabelns motstånd.", "Håll ryggen neutral."], 45),
  r(["Adduktormaskin", "Hip adduction", "ben", ["gym"], "vikt", "Pressa ihop benen mot motstånd.", "Insida lår – kontrollerade rörelser."], 45),
  r(["Abduktormaskin", "Hip abduction", "rumpa", ["gym"], "vikt", "Pressa isär benen mot motstånd.", "Yttre höft och rumpa."], 45),
  r(["Wrist curls", "Wrist curls", "armar", ["hantlar", "gym"], "vikt", "Curla handlederna med underarmarna vilande på låren.", "Små rörelser, lätt vikt."], 30),
  r(["Hängande knälyft", "Hanging knee raises", "bål", ["gym"], "reps", "Häng i en stång och lyft knäna mot bröstet.", "Undvik gunga – styr med bålen."], 60),
  r(["L-sittning", "L-sit", "bål", ["ingen", "gym"], "tid", "Håll kroppen i L-form med stöd på händerna.", "Börja med böjda knän."], 30),
  r(["Nordic curl (assisterad)", "Nordic hamstring curl", "ben", ["ingen"], "reps", "Knästående, sänk överkroppen mot golvet långsamt.", "Mycket tung – fånga upp med händerna."], 90),
  r(["Landmine press", "Landmine press", "axlar", ["gym"], "vikt", "Pressa stångens ände snett uppåt från bröstet.", "Axelvänlig vinkel."], 60),
  r(["Landmine rodd", "Landmine row", "rygg", ["gym"], "vikt", "Ro stångens ände mot magen.", "Stabilt fotfäste, rak rygg."], 60),
  r(["Sissy squat", "Sissy squat", "ben", ["ingen"], "reps", "Luta bakåt med knäna framåt – intensiv framsida lår.", "Håll i något för balans."], 45),
  r(["Hip raises på bänk", "Elevated glute bridge", "rumpa", ["ingen"], "reps", "Glute bridge med fötterna på en upphöjning.", "Större rörelseomfång."], 45),
  r(["Plankjack", "Plank jacks", "bål", ["ingen"], "tid", "Planka med hopp ut och in med benen.", "Håll höfterna stabila."], 30),
  r(["Side bends", "Standing side bends", "bål", ["hantlar"], "vikt", "Luta i sidled med en hantel i handen.", "Snåla med vikten – kontroll först."], 30),
  r(["Kettlebell goblet march", "Goblet march", "bål", ["kettlebell", "hantlar"], "tid", "Marschera på stället med vikt framför bröstet.", "Bålstabilitet under rörelse."], 30),
  r(["Assisterade chins", "Assisted pull-ups", "rygg", ["gym"], "reps", "Chins med motvikt eller band som hjälper upp.", "Minska hjälpen allt eftersom du blir starkare."], 90),
  r(["Smithmaskin bänkpress", "Smith machine bench press", "bröst", ["gym"], "vikt", "Bänkpress i smithmaskin med fast bana.", "Bra för att träna tungt utan passningskamrat."], 90),
  r(["Smithmaskin knäböj", "Smith machine squat", "ben", ["gym"], "vikt", "Knäböj i smithmaskin.", "Ställ fötterna lite framåt."], 90),
  r(["Seated dumbbell press", "Seated dumbbell press", "axlar", ["hantlar", "gym"], "vikt", "Axelpress sittande med ryggstöd.", "Stöd ger stabilitet för tyngre lyft."], 90),
  r(["Cable flyes", "Cable flyes", "bröst", ["gym"], "vikt", "Flyes i kabelkors med jämnt motstånd.", "Håll lätt böjda armbågar."], 60),
  r(["Preacher curls", "Preacher curls", "armar", ["gym"], "vikt", "Curls med armarna vilande på lutande stöd.", "Isolerar biceps effektivt."], 60),
  r(["Overhead triceps", "Overhead triceps extension", "armar", ["hantlar", "gym", "gummiband"], "vikt", "Sträck armarna ovanför huvudet mot motstånd.", "Håll armbågarna nära huvudet."], 45),
  r(["Powerwalk med lutning", "Incline walking", "kondition", ["gym"], "tid", "Rask promenad på löpband med lutning.", "Skonsam men effektiv kondition."], 30),
  r(["Stairmaster", "Stair climber", "kondition", ["gym"], "tid", "Trappmaskin i jämnt tempo.", "Luta dig inte tungt på handtagen."], 30),
  r(["Hoppa hopprep", "Jump rope", "kondition", ["ingen"], "tid", "Klassisk hopprepscardio.", "Små hopp, landa mjukt."], 30),
  // Fler gym- och maskinövningar
  r(["Lutande hantelpress", "Incline dumbbell press", "bröst", ["hantlar", "gym"], "vikt", "Hantelpress på lutande bänk för övre bröstet.", "Sänk hantlarna djupt utan att tappa kontrollen."], 90),
  r(["Smithmaskin lutande press", "Smith incline press", "bröst", ["gym"], "vikt", "Lutande press i smithmaskin med fast bana.", "Tryggt när du tränar tungt själv."], 90),
  r(["Lutande flyes med hantlar", "Incline dumbbell flyes", "bröst", ["hantlar", "gym"], "vikt", "Flyes på lutande bänk för övre bröstet.", "Vidga rörelsen utan att översträcka axlarna."], 60),
  r(["Kryssdrag i kabel", "Cable crossover", "bröst", ["gym"], "vikt", "Dra handtagen i en båge framför kroppen från högt läge.", "Kläm bröstet en sekund i slutläget."], 60),
  r(["Dips i maskin", "Assisted dips", "bröst", ["gym"], "vikt", "Dips med motvikt som hjälper dig upp.", "Minska motvikten allt eftersom du blir starkare."], 90),
  r(["T-bar rodd", "T-bar row", "rygg", ["gym"], "vikt", "Rodd med bröstet stöttat eller stående mot T-stång.", "Dra mot magen och pressa ihop skulderbladen."], 90),
  r(["Bröststöttad rodd i maskin", "Chest supported row", "rygg", ["gym"], "vikt", "Rodd i maskin med bröstet mot stöd – skonsam för ryggen.", "Låt ryggen jobba, inte armarna."], 60),
  r(["Latsdrag med smalt grepp", "Close-grip pulldown", "rygg", ["gym"], "vikt", "Latsdrag med smalt eller neutralt grepp.", "Dra ner till övre bröstet med rak rygg."], 60),
  r(["Raka armars pulldown", "Straight-arm pulldown", "rygg", ["gym"], "vikt", "Svep stången ner mot låren med nästan raka armar.", "Isolerar sidryggen – känn stretchen upptill."], 45),
  r(["Ryggres i maskin", "Back extension machine", "rygg", ["gym"], "vikt", "Res överkroppen mot motstånd från framåtlutat läge.", "Kontrollerad rörelse utan ryck."], 60),
  r(["Hyperextension", "Back extension", "rygg", ["gym"], "reps", "Res överkroppen i 45-gradersbänk tills kroppen är rak.", "Stanna i nivå – översträck inte."], 45),
  r(["Seal row", "Seal row", "rygg", ["hantlar", "gym"], "vikt", "Liggande rodd på hög bänk med hantlar.", "Bröstet mot bänken hela setet."], 60),
  r(["Frontpress i maskin", "Machine front press", "axlar", ["gym"], "vikt", "Axelpress i maskin med styrda handtag.", "Stabilt alternativ till fria vikter."], 60),
  r(["Omvänd pec deck", "Reverse pec deck", "axlar", ["gym"], "vikt", "För armarna bakåt i pec deck-maskinen – bakre axeln.", "Lätta vikter, känn kontakten mellan skulderbladen."], 45),
  r(["Sidolyft i kabel", "Cable lateral raise", "axlar", ["gym"], "vikt", "Sidolyft med kabel för jämnt motstånd hela rörelsen.", "Lyft till axelhöjd, inte högre."], 45),
  r(["Arnoldpress", "Arnold press", "axlar", ["hantlar", "gym"], "vikt", "Axelpress där du roterar handflatorna under pressen.", "Rotera mjukt och håll bålen spänd."], 90),
  r(["Bencurl liggande", "Lying leg curl", "ben", ["gym"], "vikt", "Liggande bencurl för baksida lår.", "Håll höfterna stilla mot dynan."], 60),
  r(["Sittande bencurl", "Seated leg curl", "ben", ["gym"], "vikt", "Bencurl sittande – annan vinkel på baksidan.", "Sänk långsamt och kontrollerat."], 60),
  r(["Benspark i maskin", "Glute kickback machine", "rumpa", ["gym"], "vikt", "Pressa benet bakåt mot maskinens motstånd.", "Rörelsen kommer från höften, inte ryggen."], 45),
  r(["Tåhävning i maskin", "Seated calf raise", "ben", ["gym"], "vikt", "Tåhävningar sittande i maskin.", "Full rörelse – sträck djupt i botten."], 45),
  r(["Stående tåhävning i maskin", "Standing calf raise", "ben", ["gym"], "vikt", "Tåhävningar stående med viktpaket på axlarna.", "Pressa upp högt och sänk långsamt."], 45),
  r(["Bältesknäböj", "Belt squat", "ben", ["gym"], "vikt", "Knäböj med vikten hängande i ett bälte – avlastar ryggen.", "Bra när ryggen behöver vila."], 90),
  r(["Vänd benpress", "Pendulum squat", "ben", ["gym"], "vikt", "Knäböjmaskin som följer en naturlig båge.", "Ställ fötterna så knäna rör sig fritt."], 90),
  r(["Lårcurl stående", "Standing leg curl", "ben", ["gym"], "vikt", "Curla ett ben i taget stående i maskin.", "Håll höften stilla."], 45),
  r(["Bicepscurl i maskin", "Machine bicep curl", "armar", ["gym"], "vikt", "Curls i maskin med styrda armstöd.", "Sänk hela vägen utan att låsa ut hårt."], 45),
  r(["Tricepspress i maskin", "Machine triceps extension", "armar", ["gym"], "vikt", "Tricepspress sittande i maskin.", "Håll axlarna nere."], 45),
  r(["Bicepscurl i kabel med stång", "Cable bar curl", "armar", ["gym"], "vikt", "Curla den raka stången i nedre kabelfästet.", "Jämnt motstånd från start till mål."], 45),
  r(["Triceps pushdown med rep", "Rope pushdown", "armar", ["gym"], "vikt", "Pushdown med rephandtag – sprid ändarna i botten.", "Armbågarna stilla vid sidorna."], 45),
  r(["Koncentrationscurl", "Concentration curl", "armar", ["hantlar", "gym"], "vikt", "Sittande curl med armbågen stöttad mot låret.", "Långsamt och kontrollerat."], 45),
  r(["Magmaskin", "Ab crunch machine", "bål", ["gym"], "vikt", "Rulla ihop överkroppen mot maskinens motstånd.", "Andas ut när du kröker ihop."], 45),
  r(["Rotationsmaskin", "Torso rotation machine", "bål", ["gym"], "vikt", "Rotera överkroppen sida till sida mot motstånd.", "Små, kontrollerade rörelser."], 45),
  r(["Hängande benlyft", "Hanging leg raises", "bål", ["gym"], "reps", "Häng i stången och lyft raka ben till höfthöjd.", "Rulla upp bäckenet, inte bara benen."], 60),
  r(["Captain's chair", "Captain's chair knee raises", "bål", ["gym"], "reps", "Knälyft med ryggstöd och armstöd i stativ.", "Undvik att gunga."], 45),
  r(["Höftlyft i maskin", "Hip thrust machine", "rumpa", ["gym"], "vikt", "Hip thrust i maskin med vadderad bältesplatta.", "Full höftsträckning upptill."], 90),
  r(["Höftlyft i smithmaskin", "Smith machine hip thrust", "rumpa", ["gym"], "vikt", "Hip thrust med stången i smithmaskinens fasta bana.", "Lätt att belasta tungt och säkert."], 90),
  r(["Assault bike", "Air bike", "kondition", ["gym"], "tid", "Cykla med armar och ben samtidigt mot luftmotstånd.", "Korta intervaller ger mycket effekt."], 45),
  r(["Skidmaskin", "SkiErg", "kondition", ["gym"], "tid", "Dra handtagen nedåt som i längdskidåkning.", "Böj i höfterna och använd bålen."], 45),
  r(["Löpband intervaller", "Treadmill intervals", "kondition", ["gym"], "tid", "Växla snabba och lugna pass på löpbandet.", "Börja med korta intervaller."], 60),
  r(["Spinningpass", "Spinning", "kondition", ["gym"], "tid", "Intervallcykling i grupp eller solo.", "Justera sadeln i höfthöjd."], 30),
  r(["Jacob's ladder", "Jacob's ladder", "kondition", ["gym"], "tid", "Klättra på den rullande stegmaskinen.", "Håll ett jämnt, kontrollerat tempo."], 45),
  r(["Viking press", "Viking press", "axlar", ["gym"], "vikt", "Pressa handtagen uppåt i viking press-stativet.", "Axelvänlig press med neutralt grepp."], 90),
  r(["Multihip", "Multi hip machine", "rumpa", ["gym"], "vikt", "Arbeta benet i alla riktningar mot motstånd.", "Bra för höft och rumpa runt om."], 45),
];

/** Sök och filtrera övningsbiblioteket (presets + egna övningar). */
export function searchExercises(all: ExercisePreset[], query: string, muscle?: Muscle, eq?: Equipment[]): ExercisePreset[] {
  const q = query.trim().toLowerCase();
  const eqSet = eq && eq.length ? new Set<Equipment>(["ingen", ...eq]) : null;
  return all.filter((e) =>
    (!q || e.name.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q)) &&
    (!muscle || e.muscle === muscle) &&
    (!eqSet || e.eq.some((x) => eqSet.has(x))),
  );
}

/** Dagar sedan en muskelgrupp senast tränades (baserat på klara pass). undefined = aldrig. */
export function muscleRecovery(workouts: Workout[], today: string): Record<Muscle, number | undefined> {
  const byId = new Map(EXERCISES.map((e) => [e.name.toLowerCase(), e.muscle]));
  const out = {} as Record<Muscle, number | undefined>;
  for (const m of MUSCLES) out[m.value] = undefined;
  const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  for (const w of workouts) {
    if (w.status !== "klart" || w.date > today) continue;
    for (const ex of w.exercises) {
      const muscle = byId.get(ex.name.toLowerCase());
      if (!muscle) continue;
      const d = daysBetween(w.date, today);
      if (out[muscle] === undefined || d < out[muscle]) out[muscle] = d;
    }
  }
  return out;
}

/** Rekommendation: redo efter 2+ dagars vila, tränad idag/igår = vila. */
export function recoveryStatus(days: number | undefined): { label: string; tone: "redo" | "snart" | "vila" } {
  if (days === undefined) return { label: "Ej tränad än", tone: "redo" };
  if (days === 0) return { label: "Tränad idag", tone: "vila" };
  if (days === 1) return { label: "Vilat 1 dag", tone: "snart" };
  return { label: `Vilat ${days} dagar`, tone: "redo" };
}

/* ---------------- Ditt fokus: smarta rekommendationer ---------------- */

export type TrainingFocus = "muskler" | "forma" | "flas" | "energi";
export const FOCUSES: { value: TrainingFocus; label: string; desc: string }[] = [
  { value: "muskler", label: "Bygga muskler & styrka", desc: "Tyngre basövningar med vikt" },
  { value: "forma", label: "Forma kroppen i lugn takt", desc: "Helkropp och puls, hållbart" },
  { value: "flas", label: "Bättre flås & uthållighet", desc: "Kondition och tempo" },
  { value: "energi", label: "Mer energi & rörelseglädje", desc: "Skonsamt och roligt" },
];

const WISH_MUSCLES: [RegExp, Muscle][] = [
  [/bröst/, "bröst"], [/rygg/, "rygg"], [/ben|lår/, "ben"], [/axl/, "axlar"],
  [/arm|biceps|triceps/, "armar"], [/bål|mage|core/, "bål"], [/rump|säte/, "rumpa"],
  [/kondition|flås|puls/, "kondition"],
];
const JOINT_HEAVY = /hopp|jump|burpee|utfall|sprint|box/i;

/** Poängsätt en övning efter fokus, egna önskemål och muskelåterhämtning. Högre = bättre match. */
export function focusScore(e: ExercisePreset, focus: TrainingFocus | undefined, wishes: string, rec: Record<Muscle, number | undefined>): number {
  let s = 0;
  if (focus === "muskler") s += (e.track === "vikt" ? 3 : 0) + (e.muscle === "kondition" ? -2 : 0);
  if (focus === "forma") s += (e.muscle === "helkropp" || e.muscle === "kondition" ? 3 : 1);
  if (focus === "flas") s += (e.muscle === "kondition" ? 4 : e.track === "tid" ? 2 : 0);
  if (focus === "energi") s += (e.track !== "vikt" ? 2 : 0) + (JOINT_HEAVY.test(e.name + e.nameEn) ? -1 : 1);
  const w = wishes.toLowerCase();
  for (const [re, m] of WISH_MUSCLES) if (re.test(w) && (e.muscle === m || e.secondary === m)) s += 4;
  if (/knä|skonsam|lugn|led/.test(w) && JOINT_HEAVY.test(e.name + e.nameEn)) s -= 5;
  const st = recoveryStatus(rec[e.muscle]).tone;
  s += st === "vila" ? -3 : st === "snart" ? -1 : 1;
  return s;
}

export function recommendExercises(all: ExercisePreset[], focus: TrainingFocus | undefined, wishes: string, rec: Record<Muscle, number | undefined>): ExercisePreset[] {
  return all
    .map((e, i) => ({ e, i, s: focusScore(e, focus, wishes, rec) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.e);
}
