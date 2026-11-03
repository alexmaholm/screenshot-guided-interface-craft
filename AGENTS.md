<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep dietary eligibility and recovery selection in `src/lib/balans.ts` so onboarding, meal suggestions, and recovery meals use the same rules.
- Reuse dietary selectors and recovery recommendations across pages through focused components so restrictions cannot diverge between views.
- Preserve the existing browser-local storage flow for this milestone; connected accounts and payments require a separate implementation.
- Bundle fonts through Fontsource CSS imports so rendering does not depend on external font hosts.
- Keep daily habit scoring in `src/lib/habits.ts` and its shared display in `DailyHabits` so logged meals and water use the same score across views; scores describe logging progress, not medical health.
- Parse manual nutrition values through `parseNutrition` before saving so all four macros share decimal and nonnegative validation.
- All AI features (photo log, text log, coach) call Google Gemini through `src/lib/gemini.server.ts` with `GEMINI_API_KEY`; the owner chose their own Google key for lower running cost.

- Cloud sync mirrors the whole local state as one JSON row per user (`user_state`) via `src/lib/cloudsync.ts`; local storage stays the source of truth so the app works offline.
- Keep PRO plans, trial and membership status in `src/lib/tiers.ts` and gate PRO features with `ProGate`/`Paywall` so locks and prices stay consistent; purchases are simulated until native billing is added.
