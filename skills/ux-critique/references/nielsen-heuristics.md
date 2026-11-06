# Nielsen's 10 heuristics — UX-first interpretations

1. **Visibility of system status.** Every mutating action produces visible
   feedback within 100ms (optimistic or progress). After completion the new
   state is visible where the user already looks.
2. **Match between system and real world.** Copy uses the user's words from
   product-intent, not the data model's ("участник", not "ACL entry").
3. **User control and freedom.** Cancel mid-flow without damage; undo for
   destructive actions or a confirmation that names the object.
4. **Consistency and standards.** One pattern per job across the product;
   platform conventions win over internal cleverness.
5. **Error prevention.** Constrain input where possible (date picker over
   free text); confirm consequences, not clicks.
6. **Recognition over recall.** Options visible, defaults sensible, recent
   items surfaced. The user should never need to remember an ID.
7. **Flexibility and efficiency.** Shortcuts for experts that stay invisible
   to novices. Don't make the second-time path as slow as the first.
8. **Aesthetic and minimalist design.** Every element competes for attention;
   remove what does not serve the current job. One primary action per screen.
9. **Help users recognize, diagnose, recover from errors.** Plain-language
   error naming the problem and the way out; input preserved.
10. **Help and documentation.** The UI explains itself at the point of need
    (empty states, inline hints), not in a manual.
