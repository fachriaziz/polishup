# Audio & Video

Use for video, audio, players, background media, sound feedback, and time-based interaction. [Art Direction](art-direction.md) covers selection and identity; [Motion Design](motion-design.md) covers interface movement.

## Choose media by user need

Choose media when timing, movement, voice, demonstration, atmosphere, or narrative adds value, or when media consumption is the main task.

| Need | Starting approach | Trade-off |
| --- | --- | --- |
| Find or compare a detail | Text, diagram, screenshot, or concise sequence | Video can make a small fact slow to locate |
| Observe a changing process | Controllable demonstration | Important action must remain readable and revisitable |
| Learn | Focused explanation and meaningful sections | Watching is not proof of understanding |
| Entertainment/performance | Media with suitable continuity and control | Preserve pacing without assuming automatic continuation |
| Character/atmosphere | Relevant imagery or optional background media | Do not obscure the primary task or impose needless delivery cost |
| Interactive tour or branching content | Clear choices, return, timing, and alternatives | A fleeting hotspot or one sensory channel cannot be the only route |

A staged or generated demonstration must not imply unverified capabilities or real events. Consider sound-off use, shared spaces, language, attention, access needs, input, connection, and resources. Do not infer these from the device alone. Reuse known context and clarify only important gaps.

## Place media in context

Make purpose and entry understandable through a suitable poster, title, known duration, or short description. A poster is not playback readiness or confirmed play. Do not disguise promotion or an unavailable asset as a play action.

Place explanatory media beside what it supports. Reserve room for controls, captions, and alternatives. Inspect changing frames for contrast and obstruction; a selected still is insufficient.

A hero or background video must not block the message, navigation, or main action. Provide suitable controls and a static or reduced-motion alternative. Muted video still uses data and can distract or cause motion discomfort. Use [Accessibility](accessibility.md#plan-motion-and-media-alternatives) for the scoped requirements.

## Choose autoplay deliberately

Distinguish automatic entry playback, silent previews, and continuation after an intentionally started session. Prefer deliberate start when no media-consumption intent is established; avoid unexpected audible playback.

Where autoplay is justified, preserve controls and a useful experience when it is blocked. Do not work around user settings or treat an attempted start as confirmed playback.

Make automatic continuation understandable and stoppable where appropriate. Respect a deliberate pause, declined preference, and coherent return policy. Do not restart media merely because it re-enters view or start competing audio. Assess consequences through [Design Ethics](design-ethics.md); watch time alone does not establish user benefit.

## Show playback states

| State | Communicate |
| --- | --- |
| Before play | Content, start action, known duration/live status, and relevant alternatives |
| Play requested | Accepted request, with preparation or required next action still pending |
| Playing | Active item, meaningful position/live status, and pause/sound controls |
| User-paused | Deliberate pause and usable resume |
| Seeking/track change | Requested location or track and pending outcome |
| Buffering/reconnecting | Waiting rather than intentional pause or completion |
| Ended | Actual completion, replay/next choice, and established continuation |
| Failed/blocked/unavailable | Supported reason, useful recovery, and appropriate alternative |

Distinguish elapsed position, duration, buffered availability, and live delay. Unknown preparation does not justify fabricated percentages. Missing captions or description are separate from main-stream failure.

For live content, distinguish live edge, delayed playback, and the available recorded window. Offer return-to-live or seeking only when supported. Do not promise replay of unavailable intervals.

Preserve useful position, tracks, speed, and volume through interruption when supported. Leaving, stopping, background playback, and cross-device resume are different capabilities. Match intent, privacy, and platform behavior. Use [Interaction Design](interaction-design.md) for failure/recovery semantics without copying its full state catalog.

## Provide usable playback controls

Make relevant play/pause, position, sound, and track choices understandable and reachable. Icons, labels, states, and behavior must agree.

Support relevant keyboard, pointer, touch, and focus routes. Avoid hover-only or hidden-gesture access. Provide a non-drag seek route when applicable; fading controls must remain discoverable and operable. Scope shortcuts to avoid hijacking unrelated typing or assistive input.

Add chapters, transcript navigation, speed, quality, language, fullscreen, or picture-in-picture when useful and supported. Identify active modes and preserve place through changes. Include only features the clip and task need.

[W3C's media-player guidance](https://www.w3.org/WAI/media/av/player/) supports control selection; verify delivered behavior rather than assuming a listed player feature or custom appearance proves access.

## Plan media accessibility

Identify live/prerecorded status, audio-only/video-only/synchronized content, meaningful speech/sounds, and unspoken visual information. Timed interaction can require more than a plain transcript.

For web work targeting [WCAG 2.2](https://www.w3.org/TR/WCAG22/):

| Media | Selected requirement |
| --- | --- |
| Prerecorded audio-only | Equivalent time-based-media alternative, 1.2.1, A |
| Prerecorded video-only | Equivalent time-based-media alternative or audio track, 1.2.1, A |
| Prerecorded synchronized media | Captions, 1.2.2, A; description or media alternative, 1.2.3, A; audio description, 1.2.5, AA |
| Live synchronized media with audio | Live captions, 1.2.4, AA |

Apply the specified clearly labeled media-alternative-for-text exceptions to 1.2.1, 1.2.2, and 1.2.3. Adjacent text alone does not establish an exception. A transcript does not replace required synchronized captions or the AA audio-description provision. [W3C explains](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html) that no extra description is necessary when existing audio already conveys all important visual information.

Match support to lost information:

- Captions synchronize speech and meaningful sounds, including needed speaker distinctions. A track called subtitles may omit these.
- Transcripts support review and navigation; descriptive transcripts also preserve visual information.
- Audio description supplies important visuals not already conveyed by sound. A dub or generic narration is not automatically adequate.
- Sign language and other supports depend on audience and applicable requirements; one written/spoken language does not serve everyone.

Make alternatives and languages discoverable near the player and match them to the right media version. Check meaning, timing, terminology, numbers, speaker changes, and visual coverage; do not assume automated output is accurate. Writing supplies faithful content; UI/UX supplies availability, selection, placement, and use. Sensory-control criteria remain in Accessibility.

## Support learning with media

Tie instructional media to an understanding or action. Connect visuals and explanation in time and space. Remove competing distractions while retaining useful context, motivation, and demonstration.

Use meaningful sections, navigation, replay, and suitable pacing. A process may need continuity before optional detail; a new concept may need smaller units. Do not impose one duration, speaking rate, or segmentation formula.

Do not remove required captions or useful text merely because narration repeats it. Access, second-language reading, note-taking, and revisiting exact terms can justify redundancy.

Place practice or reflection meaningfully when part of the task. Let people perceive an interactive prompt, act, and understand the consequence. A quiz overlay, completion event, viewing percentage, or enjoyment score does not prove learning, retention, or transfer. Entertainment need not follow instructional constraints.

## Use sound cues deliberately

Distinguish content, functional feedback, alerts, and expressive sound. Reuse a suitable established vocabulary; a tone has no universal meaning across settings and audiences.

Keep optional feedback proportionate, controllable, and consistent with preferences. Do not mask speech, compete with essential audio, or make sound the only consequential status route. Haptics are not a universal substitute. Safety-critical alerts require their actual constraints rather than a blanket mute policy.

Inspect repetition and competing audio. Let people understand or preview a consequential optional sound choice without startling them. Sound production and hardware alarm design remain specialist work.

## Balance media quality and loading

Prioritize useful content and controls. Optional media or third-party players should not block unrelated work. A poster/static alternative can keep a page useful while media is deferred.

Choose quality for what must be perceived: small UI text or sign language can become unusable when reduced too far. Consider data cost, decoding resources, battery, and connection without assuming one device profile. Do not promise offline access, automatic adaptation, or uninterrupted playback without support.

For embeds, inspect relevant controls, tracks, privacy/data behavior, geometry, and failure paths. Check whether the host supplies required alternatives or sends data before playback starts; neither is guaranteed. Use [Performance](performance.md#prioritize-media-loading) for waiting and delivery. Engineering verifies resource strategy, supported formats, synchronization, and platform behavior.

## Evaluate the media experience

Inspect relevant start, pause, seek, track, buffering, failure, end, resume, and live conditions. Check useful alternatives, keyboard/touch access, caption/control collisions, and behavior when autoplay is blocked, sound unavailable, or connection poor.

A screenshot can show placement, not sound, synchronization, focus, or buffering. A silent recording leaves audio unverified. Do not invent speech, unseen frames, tracks, or playback results. Use [Design Evaluation](design-evaluation.md) to match claims to evidence.

For example, preserve a paused clip when it scrolls back into view; provide revisitable steps for a procedure in a noisy workplace; distinguish return-to-live from delayed playback; retain the message and action when a hero loop cannot play.
