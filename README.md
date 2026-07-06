# AoM Retold Major God Creator - pantheon draft

Static GitHub Pages prototype. No backend, no build step, no paid hosting.

This version is based on the uploaded vanilla files, the example mod folder layout, the GodPicker files, and the TechTree files.

## What it currently generates

The app generates a ZIP like:

```text
<MyMajorGod>/
  README_INSTALL.txt
  game/
    data/
      gameplay/
        major_gods_mods.xml
        minor_gods_mods.xml
        techtree_mods.xml
        proto_mods.xml
        powers_mods.xml
      strings/
        English/
          stringmods.txt
    ui_myth/
      content/pregame/godpicker/
        GodPicker_<Culture>_<Name>.xaml
      content/pregame/techtree/
        TechTree_<Culture>_<Name>.xaml
      resources/<name>/
        <uploaded icon>
```

## Current behavior

- Creates a new **major god** for a selected pantheon/culture.
- Does **not** ask the user to clone a major god anymore.
- Uses a hidden default template major only for basic pantheon data such as starting units/resources until custom rules are added.
- Lets the user choose any existing Archaic Age god power, labeled by pantheon.
- Uses that source major's real Archaic GodPicker and TechTree block.
- Lets the user choose two existing minor gods per age.
- Displays minor god names in uppercase in the UI.
- Writes selected minor god tech names with correct casing, for example `ClassicalAgeAthena`.
- Adds the selected god power in `techtree_mods.xml` using a `Data / GodPower` effect.
- Adds age tech effects such as `ClassicalAgeGeneral`, `ClassicalAgeGreek`, etc.
- Adds `ArchaicAgeWeakenUnits` to the custom Archaic age tech.
- Builds `GodPicker_<Culture>_<Name>.xaml` from the real uploaded GodPicker XAML blocks.
- Builds `TechTree_<Culture>_<Name>.xaml` from the real uploaded TechTree XAML blocks.
- Replaces each age's GodPicker/TechTree bonus tracks with the selected minor gods.
- Writes `stringmods.txt` using the `ID = "..." ; Str = "..."` format.

## GitHub Pages

Upload these files to the root of your GitHub repository:

```text
index.html
style.css
app.js
aomData.js
godPickerTemplates.js
techTreeTemplates.js
README.md
```

Then enable GitHub Pages:

1. Repository Settings
2. Pages
3. Deploy from branch
4. Branch: `main`
5. Folder: `/root`

## Size note

The site stays efficient by storing only extracted data/blocks needed for generation, not the full original game assets. The generated ZIP is created locally in the user's browser and is not hosted by GitHub Pages.

## Important limitation

This is still a structural/testing draft. The generated mod format is much closer to AoM Retold, but you should test in-game and compare the generated age techs and pregame UI against the real vanilla definitions if something is missing.

Major-god-specific bonuses such as Hades shades, Poseidon militia details, and similar custom rules are intentionally left for the next pass.
