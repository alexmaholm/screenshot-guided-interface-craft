import type { Pattern } from "@/components/ExerciseDemo";

/** Teknikcoach per rörelsemönster: startläge, utförande, andning/tempo och vanliga misstag. */
export interface Technique { start: string; move: string; breath: string; mistakes: [string, string] }

const T = (start: string, move: string, breath: string, m1: string, m2: string): Technique => ({ start, move, breath, mistakes: [m1, m2] });

export const TECHNIQUE: Record<Pattern, Technique> = {
  straightarm: T("Stå en halv meter från kabeln, lätt framåtlutad med mjuka knän. Armarna raka mot stången.", "Pressa stången i en båge ner mot låren med nästan raka armar. Känn latsen, inte triceps.", "Andas ut när du pressar ner, in på vägen upp (2 sek).", "Armbågarna böjs – då tar triceps över. Håll dem låsta i lätt böj.", "Överkroppen gungar – stå still och låt bara armarna röra sig."),
  squat: T("Fötterna axelbrett, tårna lätt utåt. Spänn magen och håll bröstet uppe.", "Sätt dig bakåt och ner tills låren är minst parallella med golvet. Tryck upp genom hela foten.", "Andas in på vägen ner (2 sek), ut när du reser dig.", "Knäna faller inåt – tryck dem ut i linje med tårna.", "Hälarna lyfter – håll vikten över mitten av foten."),
  lunge: T("Stå höftbrett med rak överkropp och spänd bål.", "Kliv fram och sänk tills bakre knät nästan nuddar golvet. Tryck tillbaka med främre hälen.", "Andas in ner, ut när du trycker upp.", "Främre knät glider långt förbi tårna – ta ett längre steg.", "Överkroppen lutar framåt – håll bröstet uppe."),
  hinge: T("Stången nära smalbenen, fötterna höftbrett. Rak rygg, skulderbladen spända.", "Fäll i höften och res dig genom att trycka höften framåt. Stången glider längs benen.", "Andas in och spänn magen före lyftet, andas ut uppe.", "Rund rygg – sänk höften och spänn ryggen innan du lyfter.", "Stången glider bort från kroppen – håll den nära."),
  bench: T("Ligg med ögonen under stången. Skulderbladen ihop och ner, fötterna i golvet.", "Sänk kontrollerat till nedre delen av bröstet, pressa upp i en lätt båge mot axlarna.", "Andas in på vägen ner (2 sek), ut i pressen.", "Armbågarna rakt ut åt sidorna – håll dem cirka 45° från kroppen.", "Rumpan lyfter från bänken – håll den kvar."),
  fly: T("Ligg på bänken med hantlarna ovanför bröstet och lätt böjda armbågar.", "Öppna armarna i en vid båge tills du känner sträck i bröstet, för ihop dem igen.", "Andas in när du öppnar, ut när du för ihop.", "Raka armar – behåll en mjuk böj i armbågen.", "För djupt ner – stanna vid axelhöjd."),
  pushup: T("Händerna lite bredare än axlarna, kroppen rak från huvud till häl.", "Sänk bröstet mot golvet med armbågarna snett bakåt, tryck upp till raka armar.", "Andas in ner, ut upp.", "Höften sjunker – spänn mage och rumpa.", "Halva rörelser – gå hela vägen ner."),
  ohp: T("Vikten vid axlarna, greppet strax utanför axlarna. Spänn mage och rumpa.", "Pressa rakt upp tills armarna är raka och vikten är över huvudet.", "Andas in och spänn innan, ut när du pressar.", "Svankar för mycket – spänn magen och rumpan.", "Pressar framåt – för vikten rakt upp över mitten av foten."),
  lateral: T("Stå med lätt böjda knän, hantlarna längs sidan.", "Lyft ut åt sidorna till axelhöjd, armbågarna leder rörelsen. Sänk långsamt.", "Andas ut upp, in ner.", "Gungar med kroppen – välj lättare vikt.", "Lyfter axlarna mot öronen – håll dem nere."),
  front: T("Stå stadigt med vikten framför låren.", "Lyft rakt fram till axelhöjd med nästan raka armar, sänk kontrollerat.", "Andas ut upp, in ner.", "Svingar upp vikten – lyft långsamt.", "Lyfter över huvudhöjd – stanna vid axlarna."),
  shrug: T("Stå rakt med vikten i raka armar.", "Dra axlarna rakt upp mot öronen, håll en sekund och sänk.", "Andas ut upp, in ner.", "Rullar axlarna – rör dem rakt upp och ner.", "Böjer armarna – låt armarna hänga raka."),
  vpull: T("Grip stången lite bredare än axlarna, häng med raka armar och spänd bål.", "Dra armbågarna ner mot sidorna tills bröstet närmar sig stången. Sänk helt kontrollerat.", "Andas ut när du drar, in på vägen ner.", "Gungar upp – starta från stilla häng.", "Kort rörelse – sträck ut armarna helt i botten."),
  row: T("Fäll framåt med rak rygg, vikten hänger under axlarna.", "Dra vikten mot naveln med armbågarna nära kroppen, kläm ihop skulderbladen.", "Andas ut när du drar, in när du sänker.", "Rycker med ryggen – håll överkroppen still.", "Rund rygg – spänn och håll bröstet uppe."),
  curl: T("Stå rakt, armbågarna nära kroppen, handflatorna framåt.", "Böj upp vikten mot axlarna utan att flytta armbågarna. Sänk långsamt (3 sek).", "Andas ut upp, in ner.", "Armbågarna glider framåt – lås dem vid sidan.", "Svingar med ryggen – välj lättare vikt."),
  triceps: T("Överarmarna stilla och nära huvudet eller kroppen.", "Sträck ut armen helt i armbågen, böj tillbaka kontrollerat.", "Andas ut när du sträcker, in när du böjer.", "Armbågarna flaxar ut – håll dem inåt.", "Använder axlarna – rör bara underarmen."),
  kickback: T("Luta överkroppen framåt med stöd, överarmen parallell med golvet.", "Sträck armen bakåt tills den är rak, håll en sekund och böj tillbaka.", "Andas ut bakåt, in tillbaka.", "Överarmen sjunker – håll den still.", "Svingar vikten – rör långsamt."),
  dips: T("Stöd på raka armar, axlarna nere och bröstet uppe.", "Sänk kroppen tills överarmarna är parallella med golvet, tryck upp igen.", "Andas in ner, ut upp.", "För djupt – stanna vid parallellt för att skona axlarna.", "Axlarna åker upp mot öronen – tryck ner dem."),
  core: T("Ligg på rygg med böjda knän, händerna vid tinningarna.", "Rulla upp överkroppen genom att spänna magen, sänk långsamt.", "Andas ut när du rullar upp, in ner.", "Drar i nacken – låt magen göra jobbet.", "Rycker upp – rör långsamt och kontrollerat."),
  plank: T("Underarmarna under axlarna, kroppen rak från huvud till häl.", "Håll positionen stilla med spänd mage och rumpa.", "Andas lugnt och jämnt hela tiden.", "Höften sjunker – spänn rumpan.", "Höften åker upp – sänk till rak linje."),
  rollout: T("Stå på knäna med händerna på hjulet under axlarna.", "Rulla fram så långt du kan med rak rygg, dra tillbaka med magen.", "Andas in ut, ut när du drar tillbaka.", "Svankar – spänn magen och rulla kortare.", "Drar med armarna – låt magen styra."),
  legraise: T("Ligg på rygg med ländryggen mot golvet.", "Lyft benen raka till 90°, sänk långsamt utan att nudda golvet.", "Andas ut upp, in ner.", "Ländryggen lyfter – sänk inte så långt.", "Använder fart – rör långsamt."),
  hang: T("Häng i stången med raka armar och stilla kropp.", "Lyft knän eller ben mot bröstet med magen, sänk kontrollerat.", "Andas ut upp, in ner.", "Gungar – stoppa rörelsen i botten.", "Lyfter med höftböjarna – rulla bäckenet upp."),
  climber: T("Armhävningsläge med händerna under axlarna.", "Dra knäna växelvis mot bröstet i högt tempo.", "Andas jämnt och rytmiskt.", "Höften åker upp – håll kroppen låg.", "Händerna glider – tryck dem i golvet."),
  bridge: T("Ligg på rygg, fötterna nära rumpan.", "Tryck upp höften genom hälarna tills kroppen är rak, kläm rumpan.", "Andas ut upp, in ner.", "Svankar uppe – stanna vid rak linje.", "Trycker med tårna – tryck med hälarna."),
  hipthrust: T("Övre ryggen mot bänken, stången över höften, fötterna höftbrett.", "Tryck upp höften tills den är i linje med knän och axlar, kläm rumpan.", "Andas in nere, ut uppe.", "Svankar – håll hakan in och revbenen nere.", "Fötterna för långt fram – smalbenen lodräta uppe."),
  glute: T("Stå stadigt med stöd, bålen spänd.", "För benet bakåt med rumpan, håll en sekund och tillbaka.", "Andas ut när du sparkar, in tillbaka.", "Svankar – rör bara benet.", "Svingar – rör långsamt."),
  calf: T("Främre delen av foten på en kant, hälarna fria.", "Res dig högt upp på tå, håll en sekund, sänk hälarna under kanten.", "Andas ut upp, in ner.", "Studsar – pausa i botten.", "Halva rörelser – gå hela vägen."),
  legext: T("Sitt med ryggen mot dynan, knät i linje med maskinens led.", "Sträck ut benen helt, sänk långsamt.", "Andas ut när du sträcker, in ner.", "Rycker upp – rör jämnt.", "Lyfter rumpan – håll i handtagen."),
  legcurl: T("Dynan strax ovanför hälarna, knät i linje med maskinens led.", "Böj benen så långt det går, sänk kontrollerat.", "Andas ut när du böjer, in tillbaka.", "Höften lyfter – pressa den mot dynan.", "Snabb sänkning – ta 3 sek ner."),
  sled: T("Ryggen mot dynan, fötterna axelbrett mitt på plattan.", "Sänk tills knäna är cirka 90°, tryck tillbaka utan att låsa knäna.", "Andas in ner, ut när du trycker.", "Låser knäna – behåll en lätt böj.", "Ländryggen lyfter – gå inte för djupt."),
  cardio: T("Hitta en hållning med rak rygg och avslappnade axlar.", "Håll ett jämnt tempo du klarar att prata i, öka gradvis.", "Andas rytmiskt genom näsa och mun.", "Startar för hårt – värm upp 3–5 min.", "Spänner axlarna – slappna av i överkroppen."),
};

/**
 * Riktiga videoloopar per övnings-id. Fyll på med länkar (MP4/WebM) när licensierade videor finns;
 * övningar utan video visar rörelsefiguren.
 */
export const VIDEOS: Record<string, string> = {};
