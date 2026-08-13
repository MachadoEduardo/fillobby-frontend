## Language

- Use Brazilian Portuguese as the default language for responses, progress updates, explanations, documentation and user-facing interface text.
- Keep English only where it is required by source code, APIs, library conventions, technical identifiers or the semantic commit-message convention below.

## Frontend visual guidelines

- Keep domain-specific components inside their respective `src/features` domain. Reserve `src/components` for primitives and components shared across multiple domains.
- Use the semantic Tailwind/CSS tokens defined in `src/styles.css` for colors, surfaces, borders, radii and interaction states. Do not hardcode visual values inside components. When the design system lacks a necessary value, add or refine a semantic token before using it.

## Commit handoff

- At the end of every significant change, include a suggested commit message in the final response.
- Follow the Conventional Commits format (`type(scope): description`), use an imperative English description, and choose the narrowest scope that accurately represents the change.
