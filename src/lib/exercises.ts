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
  r(["Maghjul", "Ab rollout", "bål", ["ingen", "gym"], "reps", "Stå på knä, rulla hjulet framåt så långt du kontrollerar och dra tillbaka med magen.", "Svanka inte – håll rumpan spänd och ryggen rund lätt."], 45),
  r(["Trap bar marklyft", "Hex bar deadlift", "rygg", ["gym"], "vikt", "Stå inne i stången, fatta handtagen och res dig med rak rygg.", "Tryck golvet ifrån dig och lås höften i toppen."], 90),
  r(["Lutande hantelcurl", "Incline dumbbell curl", "armar", ["hantlar", "gym"], "vikt", "Sitt på lutad bänk med armarna hängande och curla upp hantlarna.", "Låt armarna hänga rakt ner – armbågarna still."], 45),
  r(["Gående utfall", "Walking lunges", "ben", ["ingen", "hantlar"], "reps", "Kliv framåt i utfall, sänk bakre knät och fortsätt med nästa ben.", "Rak överkropp och landa på hela foten."], 60),
  r(["Triceps kickbacks", "Dumbbell triceps kickback", "armar", ["hantlar"], "vikt", "Fäll fram överkroppen, överarmen längs kroppen, sträck armen bakåt.", "Bara underarmen rör sig."], 45),
  r(["Lutande sidolyft på bänk", "Incline lateral raise", "axlar", ["hantlar", "gym"], "vikt", "Ligg på sidan mot en lutad bänk och lyft hanteln ut till axelhöjd.", "Lätt vikt och långsamt ner."], 45),
  r(["Slädpress", "Sled push", "kondition", ["gym"], "tid", "Luta dig mot släden med raka armar och driv den framåt med korta kraftiga steg.", "Låg position och tryck från fotbladen."], 90),
  // Utökning: bröst
  r(["Nedåtlutande bänkpress", "Decline bench press", "bröst", ["gym"], "vikt", "Ligg på nedåtlutande bänk, sänk stången mot nedre bröstet och pressa upp.", "Fäst fötterna stadigt och sänk kontrollerat."], 90),
  r(["Nedåtlutande hantelpress", "Decline dumbbell press", "bröst", ["hantlar", "gym"], "vikt", "Pressa hantlarna upp från nedre bröstet på nedåtlutande bänk.", "Håll armbågarna cirka 45 grader från kroppen."], 90),
  r(["Bänkpress med smalt grepp", "Close-grip bench press", "armar", ["gym"], "vikt", "Bänkpress med axelbrett grepp som lägger mer fokus på triceps.", "Håll armbågarna nära kroppen."], 90),
  r(["Golvpress med hantlar", "Dumbbell floor press", "bröst", ["hantlar"], "vikt", "Ligg på golvet och pressa hantlarna upp tills armarna är raka.", "Låt överarmarna nudda golvet lätt innan du pressar."], 75),
  r(["Golvpress med skivstång", "Barbell floor press", "bröst", ["gym"], "vikt", "Ligg på golvet under stången och pressa från överarmarna mot golvet.", "Pausa kort när armbågarna nuddar golvet."], 90),
  r(["Hantelpress med neutralt grepp", "Neutral-grip dumbbell press", "bröst", ["hantlar", "gym"], "vikt", "Pressa hantlarna med handflatorna mot varandra.", "Skonsamt för axlarna – håll skulderbladen bakåt."], 75),
  r(["Enarms hantelpress", "Single-arm dumbbell press", "bröst", ["hantlar", "gym"], "vikt", "Pressa en hantel i taget medan bålen håller kroppen stabil.", "Spänn magen så du inte roterar."], 60),
  r(["Lutande armhävningar", "Incline push-ups", "bröst", ["ingen"], "reps", "Händerna på en bänk eller kant, sänk bröstet mot kanten och pressa upp.", "Bra steg mot vanliga armhävningar."], 60),
  r(["Nedåtlutande armhävningar", "Decline push-ups", "bröst", ["ingen"], "reps", "Fötterna på en bänk, sänk bröstet mot golvet och pressa upp.", "Håll höften i linje med kroppen."], 60),
  r(["Breda armhävningar", "Wide push-ups", "bröst", ["ingen"], "reps", "Armhävningar med händerna bredare än axlarna.", "Sänk kontrollerat och håll bålen spänd."], 60),
  r(["Diamantarmhävningar", "Diamond push-ups", "armar", ["ingen"], "reps", "Armhävningar med händerna ihop under bröstet så tummar och pekfingrar bildar en diamant.", "Håll armbågarna nära kroppen."], 60),
  r(["Archer-armhävningar", "Archer push-ups", "bröst", ["ingen"], "reps", "Sänk kroppen mot ena handen medan den andra armen hålls rak ut åt sidan.", "Växla sida varje repetition."], 60),
  r(["Armhävningar med klapp", "Clap push-ups", "bröst", ["ingen"], "reps", "Explosiva armhävningar där du trycker ifrån så händerna lämnar golvet.", "Landa mjukt med lätt böjda armar."], 75),
  r(["Armhävningar med band", "Banded push-ups", "bröst", ["gummiband"], "reps", "Bandet över ryggen och under händerna ger extra motstånd i armhävningen.", "Pressa hela vägen upp mot bandets motstånd."], 60),
  r(["Bröstpress med band", "Band chest press", "bröst", ["gummiband"], "reps", "Bandet fäst bakom dig, pressa handtagen rakt framåt.", "Ta ett litet steg fram för mer spänning."], 60),
  r(["Flyes med band", "Band flyes", "bröst", ["gummiband"], "reps", "För armarna i en båge framför bröstet mot bandets motstånd.", "Håll en lätt böj i armbågarna."], 60),
  r(["Kryssdrag nerifrån", "Low-to-high cable fly", "bröst", ["gym"], "vikt", "Dra handtagen från låga trissor uppåt och ihop framför bröstet.", "Träffar övre bröstet – tänk på att krama ett träd."], 60),
  r(["Kryssdrag uppifrån", "High-to-low cable fly", "bröst", ["gym"], "vikt", "Dra handtagen från höga trissor nedåt och ihop framför höften.", "Luta dig lätt framåt och håll bröstet uppe."], 60),
  r(["Svend press", "Svend press", "bröst", ["hantlar", "gym"], "vikt", "Kläm en viktskiva mellan händerna och pressa den rakt fram från bröstet.", "Kläm hårt hela rörelsen."], 60),
  r(["Lutande bröstpress i maskin", "Incline chest press machine", "bröst", ["gym"], "vikt", "Pressa handtagen snett uppåt i maskinen för övre bröstet.", "Ställ in sätet så handtagen är i brösthöjd."], 75),
  r(["Hantelflyes på golvet", "Floor dumbbell flyes", "bröst", ["hantlar"], "vikt", "Ligg på golvet och för hantlarna i en båge ner mot golvet och upp igen.", "Golvet stoppar rörelsen och skyddar axlarna."], 60),
  // Utökning: rygg
  r(["Pendlay-rodd", "Pendlay row", "rygg", ["gym"], "vikt", "Ro stången explosivt från golvet till nedre bröstet med överkroppen parallell med golvet.", "Låt stången vila på golvet mellan varje rep."], 90),
  r(["Skivstångsrodd med underhandsgrepp", "Underhand barbell row", "rygg", ["gym"], "vikt", "Ro stången mot magen med handflatorna uppåt.", "Dra armbågarna nära kroppen."], 90),
  r(["Kroksrodd med hantlar", "Chest-supported dumbbell row", "rygg", ["hantlar", "gym"], "vikt", "Ligg med bröstet mot en lutande bänk och ro hantlarna uppåt.", "Kläm ihop skulderbladen i toppen."], 75),
  r(["Kettlebellrodd", "Kettlebell row", "rygg", ["kettlebell"], "vikt", "Stöd en hand mot bänken och ro kettlebellen mot höften.", "Håll ryggen rak och nacken neutral."], 60),
  r(["Renegade-rodd", "Renegade row", "rygg", ["hantlar", "kettlebell"], "reps", "I plankposition på hantlarna, ro en hantel i taget mot höften.", "Bred fotställning gör det lättare att hålla höften still."], 60),
  r(["Enarms kabelrodd", "Single-arm cable row", "rygg", ["gym"], "vikt", "Ro ett handtag i taget mot höften med kontrollerad rotation.", "Sträck ut ordentligt i botten."], 60),
  r(["Latsdrag med brett grepp", "Wide-grip lat pulldown", "rygg", ["gym"], "vikt", "Dra den breda stången ner mot övre bröstet.", "Luta dig lätt bakåt och dra med armbågarna."], 75),
  r(["Latsdrag med underhandsgrepp", "Reverse-grip lat pulldown", "rygg", ["gym"], "vikt", "Dra stången ner med handflatorna mot dig.", "Låt inte axlarna åka upp mot öronen."], 75),
  r(["Enarms latsdrag", "Single-arm lat pulldown", "rygg", ["gym"], "vikt", "Dra ett handtag i taget ner mot axeln.", "Känn sträckningen i sidan i toppen."], 60),
  r(["Latsdrag med band", "Band lat pulldown", "rygg", ["gummiband"], "reps", "Bandet fäst högt, dra ner mot bröstet med armbågarna.", "Kläm ihop skulderbladen i botten."], 60),
  r(["Chins med underhandsgrepp", "Chin-ups", "rygg", ["gym"], "reps", "Häng med handflatorna mot dig och dra hakan över stången.", "Undvik att svinga – starta från stilla häng."], 90),
  r(["Chins med neutralt grepp", "Neutral-grip pull-ups", "rygg", ["gym"], "reps", "Dra upp kroppen med handflatorna mot varandra.", "Skonsamt grepp för armbågar och axlar."], 90),
  r(["Negativa chins", "Negative pull-ups", "rygg", ["gym"], "reps", "Hoppa upp till toppläget och sänk dig så långsamt du kan.", "Sikta på 3–5 sekunder ner."], 75),
  r(["Chins med band", "Band-assisted pull-ups", "rygg", ["gym", "gummiband"], "reps", "Ett band under knäna eller fötterna hjälper dig upp i chinsen.", "Byt till tunnare band när det blir lätt."], 75),
  r(["Döda häng", "Dead hang", "rygg", ["gym"], "tid", "Häng still i stången med raka armar.", "Bygger greppstyrka och avlastar ryggen."], 60),
  r(["Skulderbladsdrag i stång", "Scapular pull-ups", "rygg", ["gym"], "reps", "Häng i stången och dra ner skulderbladen utan att böja armarna.", "Liten rörelse – fokusera på kontrollen."], 60),
  r(["Ringrodd med fötterna upp", "Feet-elevated inverted row", "rygg", ["gym"], "reps", "Inverterad rodd med fötterna på en bänk för mer belastning.", "Håll kroppen rak som en planka."], 60),
  r(["Sumomarklyft", "Sumo deadlift", "rygg", ["gym"], "vikt", "Marklyft med bred fotställning och greppet innanför knäna.", "Tryck isär knäna och håll bröstet uppe."], 120),
  r(["Marklyft med hantlar", "Dumbbell deadlift", "rygg", ["hantlar"], "vikt", "Lyft hantlarna från golvet med rak rygg genom att sträcka höft och knän.", "Håll hantlarna nära benen."], 90),
  r(["Raka bens marklyft", "Stiff-leg deadlift", "ben", ["gym", "hantlar"], "vikt", "Fäll i höften med nästan raka ben tills du känner sträckning i baksida lår.", "Rak rygg hela vägen."], 90),
  r(["Ettbens marklyft", "Single-leg Romanian deadlift", "ben", ["hantlar", "kettlebell", "ingen"], "reps", "Stå på ett ben och fäll framåt medan det andra benet sträcks bakåt.", "Håll höften rak mot golvet."], 60),
  r(["Rackmarklyft", "Rack pull", "rygg", ["gym"], "vikt", "Marklyft från knähöjd i en rack för att träna toppläget.", "Pressa höften fram och kläm rumpan i toppen."], 120),
  r(["Superman med armlyft", "Superman pulls", "rygg", ["ingen"], "reps", "Ligg på mage, lyft bröstet och dra armbågarna bakåt mot sidorna.", "Kläm ihop skulderbladen i varje drag."], 45),
  r(["Ryggresning på golvet", "Floor back extension", "rygg", ["ingen"], "reps", "Ligg på mage med händerna vid tinningarna och lyft överkroppen.", "Lyft lugnt och håll nacken neutral."], 45),
  r(["Omvänd flyes med band", "Band pull-aparts", "axlar", ["gummiband"], "reps", "Håll bandet framför dig och dra isär det till bröstet.", "Raka armar och kläm skulderbladen."], 45),
  r(["Raka armars pulldown med band", "Band straight-arm pulldown", "rygg", ["gummiband"], "reps", "Bandet fäst högt, pressa ner raka armar mot låren.", "Tänk att du drar med armbågarna."], 45),
  // Utökning: ben
  r(["Pausknäböj", "Pause squat", "ben", ["gym"], "vikt", "Knäböj med 2 sekunders paus i bottenläget innan du reser dig.", "Behåll spänningen i pausen."], 120),
  r(["Boxknäböj", "Box squat", "ben", ["gym", "ingen"], "vikt", "Sitt ner kontrollerat på en låda och res dig upp igen.", "Sätt dig – släpp inte ner dig."], 90),
  r(["Zercherknäböj", "Zercher squat", "ben", ["gym"], "vikt", "Knäböj med stången i armvecken framför kroppen.", "Håll överkroppen upprätt och bröstet uppe."], 120),
  r(["Knäböj med hantlar", "Dumbbell squat", "ben", ["hantlar"], "vikt", "Knäböj med en hantel i varje hand längs sidorna.", "Tyngden på hela foten."], 75),
  r(["Knäböj med band", "Band squat", "ben", ["gummiband"], "reps", "Stå på bandet och håll det vid axlarna medan du gör knäböj.", "Pressa upp kraftfullt mot bandets motstånd."], 60),
  r(["Kosackknäböj", "Cossack squat", "ben", ["ingen", "kettlebell"], "reps", "Bred fotställning, sjunk ner mot ena sidan med det andra benet rakt.", "Håll hälen i golvet på det böjda benet."], 60),
  r(["Pistolknäböj (assisterad)", "Assisted pistol squat", "ben", ["ingen"], "reps", "Knäböj på ett ben medan du håller i något stadigt för balans.", "Sänk så djupt du kan med kontroll."], 60),
  r(["Hälhöjd goblet squat", "Heel-elevated goblet squat", "ben", ["hantlar", "kettlebell"], "vikt", "Goblet squat med hälarna på en viktskiva för mer framsida lår.", "Låt knäna gå fram över tårna."], 75),
  r(["Smithmaskin utfall", "Smith machine lunge", "ben", ["gym"], "vikt", "Utfall i smithmaskinen med stången på ryggen.", "Sänk bakre knät rakt ner."], 75),
  r(["Bakåtutfall", "Reverse lunges", "ben", ["ingen", "hantlar"], "reps", "Kliv bakåt och sänk bakre knät mot golvet.", "Skonsammare för knäna än framåtutfall."], 60),
  r(["Utfallshopp", "Jump lunges", "ben", ["ingen"], "reps", "Hoppa i utfallsposition och byt ben i luften.", "Landa mjukt och håll överkroppen upprätt."], 60),
  r(["Curtsy-utfall", "Curtsy lunges", "rumpa", ["ingen", "hantlar"], "reps", "Kliv snett bakom det andra benet och sänk dig.", "Håll höften riktad framåt."], 60),
  r(["Bulgariska utfall med skivstång", "Barbell Bulgarian split squat", "ben", ["gym"], "vikt", "Bakre foten på bänk och stången på ryggen, sänk dig rakt ner.", "Börja lätt – balansen är krävande."], 90),
  r(["Step-ups med skivstång", "Barbell step-ups", "ben", ["gym"], "vikt", "Kliv upp på en låda med stången på ryggen.", "Tryck genom hela foten på lådan."], 75),
  r(["Laterala step-ups", "Lateral step-ups", "ben", ["ingen", "hantlar"], "reps", "Stå bredvid lådan och kliv upp åt sidan.", "Låt knät följa tårnas riktning."], 60),
  r(["Benpress med smal fotställning", "Narrow-stance leg press", "ben", ["gym"], "vikt", "Benpress med fötterna nära varandra för mer framsida lår.", "Lås inte knäna i toppen."], 90),
  r(["Enbens benpress", "Single-leg leg press", "ben", ["gym"], "vikt", "Pressa plattformen med ett ben i taget.", "Jämnar ut skillnader mellan benen."], 75),
  r(["Enbens bensträck", "Single-leg extension", "ben", ["gym"], "vikt", "Sträck ut ett ben i taget i maskinen.", "Pausa kort i toppen."], 60),
  r(["Enbens bencurl", "Single-leg curl", "ben", ["gym"], "vikt", "Curla ett ben i taget i maskinen.", "Sänk långsamt tillbaka."], 60),
  r(["Bencurl med boll", "Stability ball leg curl", "ben", ["ingen"], "reps", "Ligg på rygg med hälarna på en boll, lyft höften och rulla bollen mot dig.", "Håll höften uppe hela tiden."], 60),
  r(["Glidande bencurl", "Sliding leg curl", "ben", ["ingen"], "reps", "Hälarna på en handduk på golvet, lyft höften och dra hälarna mot rumpan.", "Rör dig långsamt och kontrollerat."], 60),
  r(["Bencurl med band", "Band leg curl", "ben", ["gummiband"], "reps", "Ligg på mage med bandet runt hälen och curla mot rumpan.", "Fäst bandet stadigt framför dig."], 45),
  r(["Sittande tåhävningar", "Seated calf raises", "ben", ["gym", "hantlar"], "vikt", "Sitt med vikten på knäna och lyft hälarna.", "Träffar den djupare vadmuskeln."], 45),
  r(["Ettbens tåhävningar", "Single-leg calf raises", "ben", ["ingen", "hantlar"], "reps", "Res dig upp på tå på ett ben från en trappkant.", "Sänk hälen långsamt under kanten."], 45),
  r(["Tåhävningar i benpress", "Leg press calf raises", "ben", ["gym"], "vikt", "Pressa plattformen med tårna i benpressen.", "Full rörelse – sträck ut ordentligt."], 45),
  r(["Spanish squat", "Spanish squat", "ben", ["gummiband"], "reps", "Bandet bakom knäna fäst framför dig, luta bakåt och sjunk ner.", "Skonsam för knäna med mycket framsida lår."], 60),
  r(["Statisk utfallshållning", "Split squat hold", "ben", ["ingen"], "tid", "Håll utfallsposition med bakre knät strax ovanför golvet.", "Andas lugnt och håll höften stilla."], 45),
  // Utökning: axlar
  r(["Stående axelpress med hantlar", "Standing dumbbell press", "axlar", ["hantlar"], "vikt", "Stå och pressa hantlarna från axlarna rakt upp.", "Spänn rumpan och magen för stabilitet."], 75),
  r(["Enarms axelpress", "Single-arm shoulder press", "axlar", ["hantlar", "kettlebell"], "vikt", "Pressa en vikt i taget över huvudet.", "Undvik att luta åt sidan."], 60),
  r(["Kettlebellpress", "Kettlebell press", "axlar", ["kettlebell"], "vikt", "Pressa kettlebellen från rackposition rakt upp.", "Håll handleden rak."], 60),
  r(["Axelpress med band", "Band shoulder press", "axlar", ["gummiband"], "reps", "Stå på bandet och pressa handtagen över huvudet.", "Pressa rakt upp, inte framåt."], 60),
  r(["Pike-armhävningar", "Pike push-ups", "axlar", ["ingen"], "reps", "Höften högt i en upp-och-ner V-position, sänk huvudet mot golvet.", "Ju högre fötter, desto tyngre."], 60),
  r(["Handstående mot vägg", "Wall handstand hold", "axlar", ["ingen"], "tid", "Gå upp i handstående med fötterna mot väggen och håll.", "Pressa aktivt ifrån golvet."], 75),
  r(["Z-press", "Z press", "axlar", ["gym", "hantlar"], "vikt", "Sitt på golvet med raka ben och pressa vikten över huvudet.", "Kräver stark bål – börja lätt."], 90),
  r(["Bradfordpress", "Bradford press", "axlar", ["gym"], "vikt", "Pressa stången precis över huvudet fram och bak växelvis.", "Lätt vikt och jämnt tempo."], 75),
  r(["Sidolyft sittande", "Seated lateral raises", "axlar", ["hantlar", "gym"], "vikt", "Sitt och lyft hantlarna ut åt sidan till axelhöjd.", "Sittande hindrar dig från att fuska med kroppen."], 45),
  r(["Enarms sidolyft i kabel", "Single-arm cable lateral raise", "axlar", ["gym"], "vikt", "Lyft kabelhandtaget ut åt sidan med en arm i taget.", "Håll en stadig ställning."], 45),
  r(["Sidolyft i maskin", "Lateral raise machine", "axlar", ["gym"], "vikt", "Lyft dynorna ut åt sidan i maskinen.", "Pausa kort i toppen."], 45),
  r(["Framåtlyft med skivstång", "Barbell front raise", "axlar", ["gym"], "vikt", "Lyft stången med raka armar till axelhöjd framför dig.", "Undvik att svinga med ryggen."], 45),
  r(["Framåtlyft med viktskiva", "Plate front raise", "axlar", ["gym"], "vikt", "Håll en viktskiva med båda händerna och lyft den till ögonhöjd.", "Kontrollerat upp och ner."], 45),
  r(["Framåtlyft i kabel", "Cable front raise", "axlar", ["gym"], "vikt", "Lyft kabelhandtaget framåt till axelhöjd.", "Stå med ryggen mot trissan."], 45),
  r(["Omvänd flyes i kabel", "Cable reverse flyes", "axlar", ["gym"], "vikt", "Dra kablarna i kors bakåt i axelhöjd.", "Träffar baksida axlar – lätt vikt räcker."], 45),
  r(["Omvänd flyes på bänk", "Incline reverse flyes", "axlar", ["hantlar"], "vikt", "Ligg på mage på lutande bänk och lyft hantlarna ut åt sidan.", "Leda med armbågarna."], 45),
  r(["Y-lyft", "Y raises", "axlar", ["hantlar", "ingen"], "reps", "Luta framåt och lyft armarna i en Y-form framför huvudet.", "Tummarna pekar uppåt."], 45),
  r(["Utåtrotation med band", "Band external rotation", "axlar", ["gummiband"], "reps", "Armbågen mot sidan, rotera underarmen utåt mot bandet.", "Viktig för friska axlar."], 30),
  r(["Utåtrotation i kabel", "Cable external rotation", "axlar", ["gym"], "vikt", "Armbågen i 90 grader mot sidan, rotera underarmen utåt.", "Lätt vikt och långsamt tempo."], 30),
  r(["Shrugs med skivstång", "Barbell shrugs", "axlar", ["gym"], "vikt", "Håll stången framför låren och lyft axlarna mot öronen.", "Rulla inte axlarna – rakt upp och ner."], 60),
  r(["Shrugs i smithmaskin", "Smith machine shrugs", "axlar", ["gym"], "vikt", "Lyft axlarna rakt upp med stången i smithmaskinen.", "Pausa i toppen."], 60),
  r(["Dragkedja i kabel", "Cable upright row", "axlar", ["gym"], "vikt", "Dra kabelstången längs kroppen upp mot bröstet.", "Stanna i bröst­höjd för att skona axlarna."], 60),
  // Utökning: armar
  r(["Alternerande bicepscurls", "Alternating dumbbell curls", "armar", ["hantlar"], "vikt", "Curla en hantel i taget och vrid handflatan uppåt.", "Håll armbågarna stilla vid sidan."], 45),
  r(["Zottmancurl", "Zottman curl", "armar", ["hantlar"], "vikt", "Curla upp med handflatan uppåt, vrid och sänk med handflatan nedåt.", "Sänk långsamt för underarmarna."], 45),
  r(["Spidercurl", "Spider curl", "armar", ["hantlar", "gym"], "vikt", "Ligg på mage på lutande bänk och curla med armarna hängande rakt ner.", "Ingen fusk möjlig – full fokus på biceps."], 45),
  r(["Dragcurl", "Drag curl", "armar", ["gym"], "vikt", "Curla stången längs kroppen medan armbågarna går bakåt.", "Håll stången nära magen."], 45),
  r(["Curls med EZ-stång", "EZ-bar curl", "armar", ["gym"], "vikt", "Curla den vinklade stången med axelbrett grepp.", "Skonsammare för handlederna."], 60),
  r(["Omvänd curl", "Reverse curl", "armar", ["gym", "hantlar"], "vikt", "Curla med handflatorna nedåt för underarmar och brachialis.", "Lättare vikt än vanliga curls."], 45),
  r(["Bicepscurls med band", "Band bicep curls", "armar", ["gummiband"], "reps", "Stå på bandet och curla handtagen mot axlarna.", "Pressa hårt i toppen."], 45),
  r(["Hammercurl i kabel med rep", "Cable rope hammer curl", "armar", ["gym"], "vikt", "Curla repet med handflatorna mot varandra.", "Armbågarna fast vid sidorna."], 45),
  r(["Preacher curl med hantel", "Dumbbell preacher curl", "armar", ["hantlar", "gym"], "vikt", "Armen mot preacherbänken, curla en hantel i taget.", "Sträck nästan helt i botten."], 45),
  r(["Triceps pushdown med underhandsgrepp", "Reverse-grip pushdown", "armar", ["gym"], "vikt", "Pressa kabelstången ner med handflatorna uppåt.", "Håll armbågarna mot sidorna."], 45),
  r(["Enarms triceps pushdown", "Single-arm cable pushdown", "armar", ["gym"], "vikt", "Pressa ett handtag i taget rakt ner.", "Sträck ut helt i botten."], 45),
  r(["Triceps overhead med rep", "Cable overhead triceps extension", "armar", ["gym"], "vikt", "Ryggen mot kabeln, sträck repet framåt och uppåt över huvudet.", "Armbågarna pekar framåt och stilla."], 45),
  r(["Triceps overhead med band", "Band overhead triceps extension", "armar", ["gummiband"], "reps", "Stå på bandet och sträck armarna över huvudet.", "Rör bara underarmarna."], 45),
  r(["Fransk press med skivstång", "Barbell skullcrusher", "armar", ["gym"], "vikt", "Liggande, sänk EZ-stången mot pannan och sträck upp.", "Armbågarna pekar mot taket."], 60),
  r(["JM-press", "JM press", "armar", ["gym"], "vikt", "En blandning av smal bänkpress och fransk press.", "Sänk stången mot hakan med armbågarna framåt."], 75),
  r(["Tricepsdips med raka ben", "Straight-leg bench dips", "armar", ["ingen"], "reps", "Bänkdips med benen raka framför dig för tyngre belastning.", "Håll ryggen nära bänken."], 60),
  r(["Omvända wrist curls", "Reverse wrist curls", "armar", ["hantlar", "gym"], "vikt", "Underarmarna på låren, lyft handlederna med handryggen uppåt.", "Lätt vikt räcker långt."], 30),
  r(["Greppklämmor", "Grip squeezes", "armar", ["ingen"], "reps", "Kläm en greppränare eller tennisboll så hårt du kan.", "Bra för greppstyrkan i marklyft och chins."], 30),
  // Utökning: bål
  r(["Omvända crunches", "Reverse crunches", "bål", ["ingen"], "reps", "Ligg på rygg och rulla höften upp från golvet mot bröstet.", "Rör dig långsamt – ingen fart."], 45),
  r(["Cykelcrunches", "Bicycle crunches", "bål", ["ingen"], "reps", "För motsatt armbåge mot knät i en cyklande rörelse.", "Rotera med överkroppen, inte bara armbågen."], 45),
  r(["Kabelcrunch", "Cable crunch", "bål", ["gym"], "vikt", "På knä med repet vid huvudet, rulla ner överkroppen mot golvet.", "Rör dig med magen, inte höften."], 45),
  r(["Sit-ups", "Sit-ups", "bål", ["ingen"], "reps", "Res upp hela överkroppen från liggande till sittande.", "Andas ut på vägen upp."], 45),
  r(["Fladdersparkar", "Flutter kicks", "bål", ["ingen"], "tid", "Ligg på rygg och sparka benen små rörelser upp och ner.", "Pressa nedre ryggen mot golvet."], 45),
  r(["Saxsparkar", "Scissor kicks", "bål", ["ingen"], "tid", "Korsa raka ben över varandra strax ovanför golvet.", "Håll magen spänd hela tiden."], 45),
  r(["Hollow rock", "Hollow rock", "bål", ["ingen"], "tid", "Gunga fram och tillbaka i hollow-positionen.", "Behåll formen – bålen som en båt."], 45),
  r(["Copenhagen-planka", "Copenhagen plank", "bål", ["ingen"], "tid", "Sidoplanka med översta benet på en bänk.", "Träffar insida lår – börja på knä."], 45),
  r(["Sidoplanka med höftlyft", "Side plank hip dips", "bål", ["ingen"], "reps", "I sidoplanka, sänk höften mot golvet och lyft igen.", "Kontrollerade rörelser."], 45),
  r(["Planka med benlyft", "Plank leg lifts", "bål", ["ingen"], "reps", "I planka, lyft ett ben i taget bakåt.", "Höften ska inte rotera."], 45),
  r(["Planka på raka armar", "High plank", "bål", ["ingen"], "tid", "Håll armhävningsposition med raka armar.", "Pressa bort golvet med händerna."], 45),
  r(["Sågplanka", "Plank saw", "bål", ["ingen"], "reps", "I underarmsplanka, gunga kroppen fram och tillbaka.", "Små rörelser räcker."], 45),
  r(["Dragon flag (assisterad)", "Assisted dragon flag", "bål", ["ingen", "gym"], "reps", "Ligg på bänk, håll i bakom huvudet och sänk raka kroppen långsamt.", "Avancerad – börja med böjda knän."], 75),
  r(["Pallof press med hållning", "Pallof press hold", "bål", ["gummiband", "gym"], "tid", "Pressa bandet framåt och håll mot rotationen.", "Stå stadigt och andas lugnt."], 45),
  r(["Katana extensions i kabel", "Cable Katana extension", "armar", ["gym"], "vikt", "Stå med sidan mot kabeln, för handtaget från motsatt höft diagonalt upp och sträck armen över huvudet.", "Armbågen pekar framåt – sträck ut helt i toppen."], 45),
  r(["Bayesian curl i kabel", "Bayesian cable curl", "armar", ["gym"], "vikt", "Ryggen mot den nedre trissan, armen bakom kroppen, curla handtaget framåt och uppåt.", "Låt armbågen stanna bakom höften för full stretch."], 45),
  r(["Sidolyft i kabel bakom ryggen", "Behind-the-back cable lateral raise", "axlar", ["gym"], "vikt", "Kabeln går bakom ryggen från nedre trissan, lyft handtaget ut åt sidan till axelhöjd.", "Ger motstånd redan i botten – håll lätt vikt."], 45),
  r(["Y-lyft i kabel", "Cable Y-raise", "axlar", ["gym"], "vikt", "Ta korsade handtag från nedre trissorna och lyft armarna i ett Y snett uppåt.", "Tummarna upp, skuldrorna nere."], 45),
  r(["Rear delt cuff flyes", "Cable rear delt cuff fly", "axlar", ["gym"], "vikt", "Kablarna fästa vid handlederna med manschetter, dra armarna bakåt i axelhöjd.", "Leda med armbågarna, inte händerna."], 45),
  r(["Vedhuggare i kabel", "Cable woodchopper", "bål", ["gym", "gummiband"], "reps", "Dra handtaget diagonalt från högt till lågt över kroppen.", "Rotera med bålen och vrid bakfoten."], 45),
  r(["Vedhuggare nerifrån", "Low-to-high woodchopper", "bål", ["gym", "gummiband"], "reps", "Dra handtaget diagonalt från lågt till högt.", "Armarna följer med – kraften från bålen."], 45),
  r(["Sidoböj med kettlebell", "Kettlebell side bend", "bål", ["kettlebell"], "reps", "Håll kettlebellen i ena handen och böj dig åt sidan och upp.", "Rör dig rakt åt sidan, inte framåt."], 45),
  r(["Suitcase carry", "Suitcase carry", "bål", ["hantlar", "kettlebell"], "tid", "Gå med en tung vikt i en hand utan att luta dig.", "Håll axlarna i våg."], 60),
  r(["Hängande vindrutetorkare", "Hanging windshield wipers", "bål", ["gym"], "reps", "Häng och lyft benen, för dem sida till sida.", "Avancerat – börja med böjda knän."], 75),
  r(["Vindrutetorkare liggande", "Lying windshield wipers", "bål", ["ingen"], "reps", "Ligg på rygg med benen upp och sänk dem sida till sida.", "Axlarna ska ligga kvar mot golvet."], 45),
  r(["Maghjul från knä", "Kneeling ab rollout", "bål", ["gym"], "reps", "På knä, rulla hjulet framåt så långt du klarar och dra tillbaka.", "Håll ryggen neutral."], 60),
  r(["Toe touches", "Toe touches", "bål", ["ingen"], "reps", "Ligg med benen rakt upp och sträck händerna mot tårna.", "Lyft skulderbladen från golvet."], 45),
  r(["Hängande knälyft med rotation", "Hanging oblique knee raises", "bål", ["gym"], "reps", "Häng och lyft knäna snett mot ena axeln.", "Växla sida och undvik att svinga."], 60),
  r(["Bird dog med hållning", "Bird dog hold", "bål", ["ingen"], "tid", "På alla fyra, sträck motsatt arm och ben och håll.", "Håll ryggen platt som ett bord."], 30),
  // Utökning: rumpa
  r(["Glute bridge med band", "Banded glute bridge", "rumpa", ["gummiband"], "reps", "Band runt knäna, lyft höften och pressa knäna utåt.", "Kläm rumpan i toppen."], 45),
  r(["Glute bridge med paus", "Glute bridge hold", "rumpa", ["ingen"], "tid", "Håll höften uppe i glute bridge-positionen.", "Pressa genom hälarna."], 45),
  r(["Höftlyft med band", "Banded hip thrust", "rumpa", ["gummiband"], "reps", "Ryggen mot bänk och band över höften, pressa upp.", "Hakan in och blicken framåt."], 60),
  r(["Ettbens höftlyft", "Single-leg hip thrust", "rumpa", ["ingen"], "reps", "Hip thrust på ett ben med ryggen mot en bänk.", "Höften ska vara i våg."], 60),
  r(["Frog pumps", "Frog pumps", "rumpa", ["ingen"], "reps", "Ligg med fotsulorna ihop och knäna utåt, lyft höften snabbt.", "Kort och snabb rörelse."], 45),
  r(["Fire hydrants", "Fire hydrants", "rumpa", ["ingen", "gummiband"], "reps", "På alla fyra, lyft det böjda benet ut åt sidan.", "Håll ryggen stilla."], 45),
  r(["Donkey kicks", "Donkey kicks", "rumpa", ["ingen"], "reps", "På alla fyra, pressa ena foten mot taket med böjt knä.", "Kläm rumpan i toppen."], 45),
  r(["Sidoliggande benlyft", "Side-lying leg raises", "rumpa", ["ingen"], "reps", "Ligg på sidan och lyft det övre benet rakt upp.", "Tårna pekar framåt."], 45),
  r(["Clamshells", "Clamshells", "rumpa", ["ingen", "gummiband"], "reps", "Ligg på sidan med böjda knän och öppna det övre knät.", "Fötterna ihop och höften stilla."], 45),
  r(["Kabelabduktion stående", "Standing cable abduction", "rumpa", ["gym"], "vikt", "Fäst kabeln vid fotleden och för benet ut åt sidan.", "Håll i något för balans."], 45),
  r(["Sumomarklyft med kettlebell", "Kettlebell sumo deadlift", "rumpa", ["kettlebell", "hantlar"], "vikt", "Bred fotställning, lyft kettlebellen mellan benen.", "Pressa knäna utåt."], 60),
  r(["Reverse hyper", "Reverse hyperextension", "rumpa", ["gym"], "reps", "Ligg på mage på en bänk och lyft benen bakåt.", "Kläm rumpan och lyft lugnt."], 60),
  r(["Kettlebell-sving med en arm", "Single-arm kettlebell swing", "helkropp", ["kettlebell"], "vikt", "Svinga kettlebellen med en hand genom höftkraft.", "Håll axeln stabil och bålen spänd."], 60),
  // Utökning: helkropp
  r(["Hantelthrusters med en arm", "Single-arm dumbbell thruster", "helkropp", ["hantlar", "kettlebell"], "vikt", "Knäböj med en vikt vid axeln och pressa upp när du reser dig.", "Använd benens kraft i pressen."], 75),
  r(["Hantelsnatch", "Dumbbell snatch", "helkropp", ["hantlar", "kettlebell"], "vikt", "Lyft hanteln från golvet till över huvudet i en explosiv rörelse.", "Kraften från höften – inte armen."], 75),
  r(["Hang clean", "Hang clean", "helkropp", ["gym"], "vikt", "Lyft stången explosivt från knähöjd till axlarna.", "Börja lätt och lär dig tekniken."], 120),
  r(["Man makers", "Man makers", "helkropp", ["hantlar"], "reps", "Armhävning, rodd på varje arm, upp och pressa hantlarna.", "Ta tid på dig och håll tekniken."], 90),
  r(["Devil press", "Devil press", "helkropp", ["hantlar"], "reps", "Burpee med hantlar som svingas upp över huvudet.", "Rak rygg när du lyfter."], 90),
  r(["Wall balls", "Wall balls", "helkropp", ["gym"], "reps", "Knäböj med medicinboll och kasta den upp mot väggen.", "Fånga bollen och gå direkt ner igen."], 60),
  r(["Slam ball", "Ball slams", "helkropp", ["gym"], "reps", "Lyft bollen över huvudet och slå den kraftigt i golvet.", "Böj knäna när du plockar upp den."], 60),
  r(["Kettlebell clean", "Kettlebell clean", "helkropp", ["kettlebell"], "vikt", "Lyft kettlebellen från golvet till rackposition vid axeln.", "Låt den rulla runt handen – inte slå i."], 60),
  r(["Kettlebell windmill", "Kettlebell windmill", "helkropp", ["kettlebell"], "reps", "Kettlebellen över huvudet, fäll åt sidan mot golvet.", "Blicken på kettlebellen hela tiden."], 60),
  r(["Waiters walk", "Waiter's walk", "helkropp", ["kettlebell", "hantlar"], "tid", "Gå med en vikt rakt upp över huvudet.", "Lås armen och håll bålen spänd."], 60),
  r(["Sandsäckslyft", "Sandbag clean", "helkropp", ["gym"], "reps", "Lyft sandsäcken från golvet till bröstet.", "Rak rygg i starten."], 90),
  r(["Inchworm", "Inchworm", "helkropp", ["ingen"], "reps", "Fäll ner, gå ut med händerna till planka och gå tillbaka.", "Håll benen så raka du kan."], 45),
  r(["Krabbgång", "Crab walk", "helkropp", ["ingen"], "tid", "Gå på händer och fötter med magen mot taket.", "Höften uppe hela tiden."], 45),
  r(["Burpees med armhävning", "Push-up burpees", "helkropp", ["ingen"], "reps", "Burpee med en hel armhävning i botten.", "Behåll rak kropp i armhävningen."], 60),
  // Utökning: kondition
  r(["Dubbla hopprep", "Double unders", "kondition", ["ingen"], "tid", "Hopprep där repet passerar två gånger per hopp.", "Hoppa lite högre och snurra med handlederna."], 60),
  r(["Utfallssteg på stället", "Split jacks", "kondition", ["ingen"], "tid", "Hoppa mellan utfallspositioner med armarna i takt.", "Landa mjukt på framfoten."], 45),
  r(["Tuck jumps", "Tuck jumps", "kondition", ["ingen"], "reps", "Hoppa upp och dra knäna mot bröstet.", "Landa mjukt och gå direkt in i nästa hopp."], 60),
  r(["Broad jumps", "Broad jumps", "kondition", ["ingen"], "reps", "Hoppa så långt framåt du kan med båda fötterna.", "Svinga armarna och landa i knäböj."], 60),
  r(["Shuttle run", "Shuttle runs", "kondition", ["ingen"], "tid", "Spring fram och tillbaka mellan två markeringar.", "Sänk tyngdpunkten i vändningarna."], 60),
  r(["Sprintintervaller", "Sprint intervals", "kondition", ["ingen"], "tid", "Korta sprinter med vila emellan.", "Värm upp ordentligt innan."], 90),
  r(["Backintervaller", "Hill sprints", "kondition", ["ingen"], "tid", "Spring uppför en backe och gå ner som vila.", "Korta steg och driv med armarna."], 90),
  r(["Simning", "Swimming", "kondition", ["gym"], "tid", "Simma längder i jämnt tempo.", "Skonsamt för leder med hela kroppen i arbete."], 60),
  r(["Stavgång", "Nordic walking", "kondition", ["ingen"], "tid", "Rask promenad med stavar för att få med överkroppen.", "Sätt i staven bakom kroppen."], 60),
  r(["Skuggboxning", "Shadow boxing", "kondition", ["ingen"], "tid", "Boxa i luften med rörliga fötter.", "Håll garden uppe och andas ut i slagen."], 45),
  r(["Seal jacks", "Seal jacks", "kondition", ["ingen"], "tid", "Jumping jacks där armarna klappar framför bröstet.", "Håll tempot jämnt."], 45),
  r(["Burpee box jump", "Burpee box jumps", "kondition", ["gym"], "reps", "Burpee följt direkt av hopp upp på lådan.", "Kliv ner istället för att hoppa ner."], 90),
  r(["Släddrag", "Sled pull", "kondition", ["gym"], "tid", "Gå bakåt och dra släden mot dig med ett rep eller handtag.", "Låg position och korta steg."], 90),
  r(["Cykelintervaller", "Bike intervals", "kondition", ["gym"], "tid", "Växla mellan hårda och lugna perioder på motionscykel.", "Exempel: 30 sek hårt, 60 sek lugnt."], 60),
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

/** Hantelövningar loggas per hantel; totalvikten är två hantlar (enarmsövningar räknas också per hantel). */
export function isDumbbell(name: string): boolean {
  return /hantel|hantlar|dumbbell/i.test(name);
}
export const totalLoadKg = (name: string, kg: number): number => (isDumbbell(name) ? kg * 2 : kg);

/** Liknande övningar: samma rörelsemönster först, sedan samma muskelgrupp. */
export function similarExercises(all: ExercisePreset[], ex: ExercisePreset, pattern: (e: ExercisePreset) => string, max = 4): ExercisePreset[] {
  const p = pattern(ex);
  return all
    .filter((e) => e.id !== ex.id && (e.muscle === ex.muscle || pattern(e) === p))
    .map((e) => ({ e, s: (pattern(e) === p ? 2 : 0) + (e.muscle === ex.muscle ? 1 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, max)
    .map((x) => x.e);
}
