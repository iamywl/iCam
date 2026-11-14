---
name: persona-council
description: >-
  Convene the 11-persona photographer, aesthetic curator, color scientist, and tactile UX critic council
  before designing, tuning, or writing code for any camera vibe, filter pipeline, or viewfinder UI.
---

# Persona Council Review Workflow

Use this skill whenever the user asks to design, evaluate, plan, tune, or implement any part of the camera experience (aesthetics, color science, optical effects, viewfinder UI, camera feel).

## Rules

1. **Never bypass the personas**: Do not jump straight to generic UI or arbitrary filter math.
2. **Consult the authoritative documents first**:
   - Read [AESTHETICS.md](../../AESTHETICS.md) to confirm which of the 8 core aesthetics is targeted and review its anti-patterns.
   - Read [00-master-photographer.md](../../personas/00-master-photographer.md) for universal lighting, framing, and skin-tone integrity rules.
   - Read the specific aesthetic photographer dossier (`01` through `08`) under `personas/`.
   - Read [09-darkroom-color-scientist.md](../../personas/09-darkroom-color-scientist.md) and [10-tactile-camera-craftsman.md](../../personas/10-tactile-camera-craftsman.md) for optical physics accuracy and ruthless UX/visual quality control.
3. **Optional Subagent Panel (`define_subagent`)**:
   - For major design/tuning decisions or critiques, define and invoke specialized subagents directly from the `Subagent System Prompt` section inside each persona file (`personas/*.md`), so `MasterPhotographer`, the target `AestheticPersona`, `DarkroomColorScientist`, and `TactileCritic` challenge each other until every VETO condition is cleared.
4. **Gate Before Writing Production Code**:
   - Every proposal must pass:
     - **3-Second Stock-Camera Distinction Test** (`기카 대비 명확한 감성적 우위`)
     - **Skin Tone Dignity Check** (`피부톤 오염·병색 제로`)
     - **Zero Tacky Gloss / Zero UI Clutter Audit** (`뷰파인더 순수성 & 절제된 매트 럭셔리`)
