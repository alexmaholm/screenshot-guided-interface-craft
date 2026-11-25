import { describe, expect, it } from "vitest";
import { applyAction, mlToGlasses, sanitizeActions } from "@/lib/coachActions";
import { normalizeState } from "@/lib/balans";

describe("coach actions", () => {
  it("500 ml vatten blir 2 glas", () => expect(mlToGlasses(500)).toBe(2));
  it("avvisar negativa makron och okänd måltidstyp", () => {
    expect(
      sanitizeActions([
        { kind: "log_meal", type: "lunch", name: "Ägg", kcal: -5, protein: 1, carbs: 1, fat: 1 },
      ]),
    ).toEqual([]);
    expect(
      sanitizeActions([
        { kind: "log_meal", type: "brunch", name: "Ägg", kcal: 100, protein: 1, carbs: 1, fat: 1 },
      ]),
    ).toEqual([]);
  });
  it("loggar måltid och vatten på dagen", () => {
    const [meal, water] = sanitizeActions([
      {
        kind: "log_meal",
        type: "lunch",
        name: "Två ägg",
        kcal: 140,
        protein: 12,
        carbs: 1,
        fat: 10,
      },
      { kind: "log_water", ml: 250 },
    ]);
    let s = normalizeState({});
    s = applyAction(s, meal!, "2026-01-01");
    s = applyAction(s, water!, "2026-01-01");
    expect(s.meals[0]).toMatchObject({ name: "Två ägg", kcal: 140, date: "2026-01-01" });
    expect(s.habits["2026-01-01"]?.water).toBe(1);
  });
});

describe("coach workout & weight actions", () => {
  it("loggar ett klart pass med set och matchar biblioteksnamn", () => {
    const [w] = sanitizeActions([
      {
        kind: "log_workout",
        status: "klart",
        title: "Rygg",
        workoutKind: "styrka",
        exercises: [
          {
            name: "lat pulldown",
            sets: [
              { reps: 10, kg: 65 },
              { reps: 10, kg: 65 },
              { reps: 8, kg: 70 },
            ],
          },
        ],
      },
    ]);
    expect(w?.kind).toBe("log_workout");
    const s = applyAction(normalizeState({}), w!, "2026-01-02");
    const ex = s.workouts[0]!.exercises[0]!;
    expect(s.workouts[0]!.status).toBe("klart");
    expect(ex.sets).toBe(3);
    expect(ex.weightKg).toBe(70);
    expect(ex.name).not.toBe("lat pulldown");
  });
  it("avvisar pass utan giltiga set", () => {
    expect(
      sanitizeActions([
        { kind: "log_workout", exercises: [{ name: "Bänkpress", sets: [{ reps: -3 }] }] },
      ]),
    ).toEqual([]);
  });
  it("loggar vikt och ersätter samma dag", () => {
    let s = normalizeState({});
    s = applyAction(s, { kind: "log_weight", kg: 82 }, "2026-01-03");
    s = applyAction(s, { kind: "log_weight", kg: 81.4 }, "2026-01-03");
    expect(s.body).toEqual([{ date: "2026-01-03", weight: 81.4 }]);
    expect(sanitizeActions([{ kind: "log_weight", kg: 5 }])).toEqual([]);
  });
});
