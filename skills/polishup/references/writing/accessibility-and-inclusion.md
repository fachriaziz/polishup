# Accessibility & Inclusive Writing

Use when content barriers, representation, or alternative formats affect understanding. [Multilingual Writing](multilingual-writing.md) covers translation and local conventions. Writing alone cannot establish product accessibility.

## Identify content barriers

Use supplied requirements and observed difficulties to identify the obstacle: unfamiliar language, unexplained concepts, implicit information, memory or processing demands, inaccessible media, or inappropriate representation. Ask about a necessary function rather than demanding a diagnosis or inferring ability from identity.

Distinguish language proficiency, literacy, disability, topic expertise, and cultural background. A specialist may need explicit language or a different format while retaining full technical depth. Select assistance for the actual barrier; no single reading level or format serves everyone.

## Apply relevant standards

For a standards-based task, establish version, conformance level, medium, and content scope. [WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/) is the normative source used here. Understanding documents explain criteria; [COGA guidance](https://www.w3.org/TR/coga-usable/) is supplemental. Neither adds requirements to WCAG by itself. Do not infer legal compliance from a style guide.

| WCAG 2.2 criterion | Level | Writing decision and boundary |
| --- | --- | --- |
| 1.1.1 Non-text Content | A | Provide an alternative serving equivalent purpose, subject to the criterion's exceptions. Informative, functional, and decorative content need different treatment |
| 2.4.4 Link Purpose (In Context) | A | Make purpose identifiable from link text or programmatically determined context, except where generally ambiguous. Every link need not stand alone |
| 2.4.6 Headings and Labels | AA | Provided headings and labels describe topic or purpose. This does not require headings everywhere or establish semantic markup; 1.3.1 addresses structure and relationships |
| 3.1.1 Language of Page; 3.1.2 Language of Parts | A; AA | Make the relevant human language programmatically determinable. Parts includes exceptions for names, technical terms, indeterminate language, and adopted vernacular |
| 3.1.5 Reading Level | AAA | For text above lower-secondary reading ability, after excluding proper names and titles, provide suitable supplemental content or a version within that level. This is not an AA grade-score requirement |

Definitions and abbreviations criteria 3.1.3 and 3.1.4 are AAA; specialist vocabulary is not universally prohibited at AA. A simplified version must preserve the information needed for its purpose. Interpret the full criterion and exceptions when they determine the design.

## Reduce comprehension barriers

Make the point, action, conditions, and consequences easy to connect. Explain essential implications, define unfamiliar terms where needed, separate different instructions, and make clear what pronouns and labels refer to. Use [Language & Style](language-and-style.md) and [Content Structure](content-structure.md) for the specific repair.

Use literal language when idiom or cultural references obstruct essential instructions. Preserve intended creative expression; an accompanying explanation may address access without rewriting the work's identity. For quantities or probabilities, state the unit and relevant comparison, adding explanation when needed without changing the value or omitting a condition.

Choose plain language or a specialist format for an identified need. Short sentences alone do not make text suitable for a specialist format such as Easy Read or prove understanding. Preserve adult dignity and necessary detail. Add pictures when they help explain, and check that they do.

## Provide content alternatives

Choose an alternative that preserves the information or function otherwise unavailable to the reader. Describe an image's contribution in context. A functional graphic needs its purpose communicated; a complex chart may need a takeaway plus accessible values, units, relationships, or a longer description. Decorative content should not add irrelevant spoken output. Apply the relevant exceptions and delivery requirements.

Inspect the actual image, recording, or data. If unavailable, identify the missing input rather than inventing details, speech, numbers, or identities. Distinguish a visible caption from a nonvisual alternative; avoid duplicating equivalent nearby information unnecessarily.

For media, determine whether speech, meaningful sounds, essential visuals, or their combination need representation. Captions, transcripts, and audio description serve different functions. A speech transcript does not replace synchronized captions or describe unspoken diagrams. WCAG 1.2 requirements depend on medium, live/prerecorded status, level, and exceptions; prepare the relevant content and arrange checks of timing, association, and delivery.

Use meaningful names for links and instructions, matching their actual destination or action. Avoid essential dependence on color, position, sound, or an icon alone. Specify the relationships the delivered format must preserve.

## Represent people accurately

Include identity or demographic detail when relevant and supported. Do not infer competence, language, gender, or preferences from a name, appearance, location, or category. Use examples appropriate to the setting without treating one background as universal or one person as representative of a whole group.

Respect expressed names, pronouns, and self-description. Consult current community or professional guidance when terminology matters; individual preferences can differ from group conventions. Neither person-first nor identity-first English wording is universally preferred. Ask only for information needed by the task.

Keep narrator framing distinct from attributed quotations, historical terminology, fictional voices, and reclaimed descriptions. Explain important issues in context when needed, rather than silently replacing source wording. Gender-inclusive solutions and cultural conventions are language-specific; avoid applying an English word replacement mechanically elsewhere.

## Check content and implementation

For creation, choose relevant support and alternatives. For refinement, repair the identified barrier and preserve meaning. For review, identify the affected passage or alternative, applicable need or criterion, proposed action, and delivery dependency.

Check whether the essential information remains obtainable through the intended reading path. Use relevant reader, subject-expert, or language feedback when available and important to the result. A checklist, score, imagined persona, or text-only review does not prove comprehension or WCAG conformance.

Writing specifies meaning, wording, alternatives, and content relationships. UI/UX verifies access paths, discoverability, and interaction; Engineering verifies semantics, language/direction handling, associations, and rendered behavior. Coordinate those checks without claiming unperformed implementation work.
