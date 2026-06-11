---
description: "UI/UX Pro Max — design intelligence (67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types). Generates a complete design system and stack-specific guidance for any UI/UX task."
mode: agent
---

# UI/UX Pro Max

Follow the full workflow defined in [PROMPT.md](ui-ux-pro-max/PROMPT.md). That file is the source of truth — read it before acting.

## Quick start

The skill is powered by a Python search engine over CSV design data. From the workspace root:

```bash
# 1. ALWAYS start here — generate a complete design system with reasoning
python3 .github/prompts/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"

# 2. Drill into a single domain as needed
python3 .github/prompts/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <style|typography|color|landing|chart|ux|product|react|web>

# 3. Stack-specific implementation guidelines (default: html-tailwind)
python3 .github/prompts/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <html-tailwind|react|nextjs|vue|svelte|swiftui|react-native|flutter|shadcn|jetpack-compose>
```

## How to apply it

1. Extract product type, industry, style keywords, and stack from the user request (default stack: `html-tailwind`).
2. Run the `--design-system` command first to get pattern + style + colors + typography + effects + anti-patterns.
3. Supplement with `--domain` / `--stack` searches when you need more detail.
4. Implement the UI using the recommended colors, fonts, spacing, and effects.
5. Validate against the pre-delivery checklist (contrast, hover/focus states, reduced-motion, responsive breakpoints, no emoji icons).

User request: ${input:request:Describe the UI/UX task (e.g. "Build a landing page for a fashion scouting platform")}
