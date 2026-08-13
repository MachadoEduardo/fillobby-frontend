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

## Frontend visual guidelines

- Keep domain-specific components inside their respective `src/features` domain. Reserve `src/components` for primitives and components shared across multiple domains.
- Use the semantic Tailwind/CSS tokens defined in `src/styles.css` for colors, surfaces, borders, radii and interaction states. Do not hardcode visual values inside components. When the design system lacks a necessary value, add or refine a semantic token before using it.
