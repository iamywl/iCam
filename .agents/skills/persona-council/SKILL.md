---
name: persona-council
description: >-
  Convene the rebuilt 14-agent photographer, aesthetic curator, color scientist, tactile UX, and visual critic council
  before designing, tuning, or writing code for any camera vibe, shader pipeline, or viewfinder UI.
---

# Persona & Agent Council Review Workflow

Use this skill whenever designing, planning, evaluating, or tuning any camera aesthetic, color pipeline, or UI/UX experience.

## Rules

1. **Never bypass the Agent Council**: Do not jump straight to generic UI or arbitrary filter code.
2. **Consult the authoritative definitions**:
   - Read [AESTHETICS.md](../../AESTHETICS.md) for the 8 core aesthetics and banned anti-patterns.
   - Read [.agents/agents/README.md](../agents/README.md) and load the corresponding `agent.md` definitions:
     - Always include `MasterPhotographerAgent` (`00`), `ColorScientistAgent` (`09`), `TactileDesignAgent` (`10`), and `VisualCriticAgent` (`10`).
     - Include the relevant aesthetic agents (`VintageFilmAgent`, `AirySummerAgent`, `Y2KFlashAgent`, `NocturneCinemaAgent`, `LoFiYouthAgent`, `EditorialPortraitAgent`, `MonochromeStreetAgent`, `DreamyInstantAgent`).
   - Cross-reference full photographic lore and tone DNA in `personas/*.md`.
3. **Strict Tool & Role Separation**:
   - Only `CameraArchitectAgent` implements production code, and ONLY after explicit user authorization and council sign-off.
   - Instantiate subagents via `define_subagent` directly from `.agents/agents/<AgentName>/agent.md` when running formal council critiques.
4. **Gate Before Final Delivery**:
   - Every proposal must pass `VisualCriticAgent` on:
     - **3-Second Stock-Camera Distinction Test**
     - **Skin Tone Dignity Check**
     - **Zero Tacky Gloss / Zero UI Clutter Audit**
     - **Preview-to-Capture Parity**
