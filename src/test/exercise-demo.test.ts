import { describe, expect, it } from "vitest";
import { EXERCISES } from "@/lib/exercises";
import { patternFor } from "@/components/ExerciseDemo";

const p = (name: string) => patternFor(EXERCISES.find((e) => e.name === name)!);

describe("rätt demonstration per övning", () => {
  it.each([
    ["Planka", "plank"],
    ["Sidoplanka", "plank"],
    ["Crunches", "core"],
    ["Maghjul", "rollout"],
    ["Hängande benlyft", "hang"],
    ["Benlyft liggande", "legraise"],
    ["Höftlyft med skivstång", "hipthrust"],
    ["Glute bridge", "bridge"],
    ["Sidolyft", "lateral"],
    ["Lutande sidolyft på bänk", "lateral"],
    ["Militärpress", "ohp"],
    ["Bänkpress", "bench"],
    ["Flyes med hantlar", "fly"],
    ["Dips", "dips"],
    ["Triceps kickbacks", "kickback"],
    ["Lutande hantelcurl", "curl"],
    ["Gående utfall", "lunge"],
    ["Trap bar marklyft", "hinge"],
    ["Slädpress", "sled"],
    ["Tåhävningar", "calf"],
    ["Bensträck", "legext"],
    ["Bencurl liggande", "legcurl"],
    ["Benpress", "legpress"],
    ["Latsdrag", "vpull"],
    ["Armhävningar", "pushup"],
    ["Mountain climbers", "climber"],
    ["Smithmaskin knäböj", "squat"],
    ["Trappsteg", "cardio"],
  ])("%s → %s", (name, pat) => expect(p(name)).toBe(pat));
});

import { setupFor } from "@/components/ExerciseDemo";
const s = (name: string) => setupFor(EXERCISES.find((e) => e.name === name)!);

describe("övningsspecifik uppsättning", () => {
  it("alla övningar har redskap och primärmuskel", () => {
    for (const e of EXERCISES) expect(setupFor(e).primary.length).toBeGreaterThan(2);
  });
  it("latsdrag använder övre kabel", () => expect(s("Latsdrag").cable).toBe("high"));
  it("hammercurl markerar brachialis", () =>
    expect(s("Hantelcurls med hammersgrepp").primary).toMatch(/Brachialis/));
});

import { variantFor } from "@/components/ExerciseDemo";
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("egna kroppsställningar", () => {
  i2("varianter skiljer sig från grundrörelsen", () => {
    e2(variantFor({ name: "Frontböj" })).toBe("frontsquat");
    e2(variantFor({ name: "Rumänska marklyft" })).toBe("rdl");
    e2(variantFor({ name: "Hammercurl" })).toBe("hammer");
    e2(variantFor({ name: "Latsdrag" })).toBe("pulldown");
    e2(variantFor({ name: "Knäböj" })).toBeNull();
  });
});

describe("revision: varje övning har rätt animation", () => {
  it.each([
    ["Raka armars pulldown", "straightarm"],
    ["Benspark i maskin", "glute"],
    ["Y-lyft", "lateral"],
    ["Farmers walk", "shrug"],
    ["Suitcase carry", "shrug"],
    ["Wall balls", "squat"],
    ["Hang clean", "hinge"],
    ["Hantelsnatch", "ohp"],
    ["Inchworm", "pushup"],
    ["Face pulls", "facepull"],
    ["Sittande kabelrodd", "seatedrow"],
    ["Kryssdrag i kabel", "crossover"],
    ["Pec deck", "pecdeck"],
    ["Pallof press med hållning", "pallof"],
  ])("%s → %s", (name, pat) => expect(p(name)).toBe(pat));
  it("raka armars pulldown är stående, inte sittande latsdrag", () =>
    expect(variantFor({ name: "Raka armars pulldown" })).toBeNull());
  it("alla kabelövningar visar kabelstation", () => {
    for (const e of EXERCISES)
      if (/kabel/i.test(e.name) && !/band/i.test(e.name))
        expect(setupFor(e).gear, e.name).toBe("cable");
  });
  it("ingen styrkeövning faller tillbaka på konditionsanimation", () => {
    for (const e of EXERCISES)
      if (e.muscle !== "kondition" && e.muscle !== "helkropp")
        expect(patternFor(e), e.name).not.toBe("cardio");
  });
});

describe("moderna kabelövningar", () => {
  it.each([
    ["Katana extensions i kabel", "overheadtri"],
    ["Bayesian curl i kabel", "curl"],
    ["Sidolyft i kabel bakom ryggen", "lateral"],
    ["Y-lyft i kabel", "lateral"],
    ["Rear delt cuff flyes", "reardelt"],
  ])("%s → %s med synlig kabel", (name, pat) => {
    expect(p(name)).toBe(pat);
    expect(s(name).gear).toBe("cable");
  });
});

describe("kabelövningar har egen rörelsebana", () => {
  it.each([
    ["Katana extensions i kabel", "katana"],
    ["Bayesian curl i kabel", "bayesian"],
    ["Sidolyft i kabel bakom ryggen", "btblateral"],
    ["Y-lyft i kabel", "cableylift"],
    ["Rear delt cuff flyes", "cuffly"],
  ])("%s → %s", (name, v) => expect(variantFor({ name })).toBe(v));
  it("hantel-Y-lyft behåller sin egen variant", () =>
    expect(variantFor({ name: "Y-lyft" })).toBe("ylift"));
});
