# Sweetie — Advanced Interface

Weekly interactive components for Advanced Interface (ArtCenter), built on the Sweetie design system (Sweetgreen LLM — start with one word).

- `index.html`: landing page that lists every week
- `wk01-loaders/`: Week 1, progress indicators (Capsule, Petal, Pool — Pool now uses the rounded Sweetie hexagon)
- `wk02-badges/`: Week 2, badges & tooltips in one tone, Serene: five sets (Bag, Location, Ingredient, sg badge, Carrot) plus an extra Move-canvas tooltip. Badges go none ↔ dot and none ↔ content (the carrot starts with its question badge); tooltips go plain and rich with an action. Add `wk02-badges/assets/carrot.png` (export from Figma) for the real carrot photo.

- `wk04-sliders/`: Week 4, sliders in three tones (Serene, Playful, Elegant), each with one stepped and one continuous slider. Serene turns the bowl builder's ingredient bars into sliders: slide across a bar and a bubble names the portion (Less · Good amount · More · A lot); includes a live bowl builder and spec cards for every set.
- `app/`: tablet landscape prototype (1210 × 834) of the five Figma flows — Start with one word, Discover, Bowl builder, Chat with ingredients, Your orders — using the WK01–WK05 interactions (Pool loader between screens, Serene badges/tooltips, Serene selectors in the profile sheet, ingredient sliders where None removes, Serene lists in the order sheet). Photos in `app/assets/` are exported from the Figma file. Keys 1–5 jump between flows; “Full screen” hides the frame for an iPad.

Each week gets its own folder with an `index.html`. Design tokens (colors, gradients, motion timings) match the "Sweetie ·" Figma variables on the Design System - WK01 page.
