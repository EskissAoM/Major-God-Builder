# AoM Retold Major God Creator - real-format draft

Static GitHub Pages prototype. No backend, no build step, no paid hosting.

This version is based on the uploaded vanilla files and the example mod folder layout.

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

- Creates a new **major god** by cloning an existing vanilla major god `<civ>` entry.
- Lets the user choose two existing minor gods per age.
- Displays minor god names in uppercase in the UI.
- Lets the user choose one starting god power from a strict major-god → starting-power mapping for the selected pantheon.
- Adds the selected god power in `techtree_mods.xml` using a `Data / GodPower` effect.
- Adds age tech effects such as `ClassicalAgeGeneral`, `ClassicalAgeGreek`, etc.
- Adds `ArchaicAgeWeakenUnits` to the custom Archaic age tech.
- Builds `GodPicker_<Culture>_<Name>.xaml` from the real uploaded GodPicker XAML blocks.
- Builds `TechTree_<Culture>_<Name>.xaml` from the real uploaded TechTree XAML blocks.
- Copies the Archaic TechTree block from the selected starting-power source major god.
- Copies Classical/Heroic/Mythic TechTree technology layouts from the cloned base major god.
- Replaces each age's TechTree bonus tracks with the selected minor gods.

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

## Important limitation

This is still a structural/testing draft. The generated mod format is much closer to AoM Retold, but you should test in-game and compare the generated age techs and pregame UI against the real vanilla definitions if something is missing. The TechTree file now uses real vanilla XAML sections, but custom combinations of minor gods may still require additional gameplay/proto/tech support outside the pregame UI.

The god power picker now uses an explicit mapping from existing major gods to their starting god powers. Review the mapping in `app.js` under `STARTING_GOD_POWER_BY_MAJOR` if a DLC/game update changes a power name.


## GodPicker template update

This version includes `godPickerTemplates.js`, generated from the uploaded vanilla GodPicker XAML files. The exported GodPicker file now copies the full ArchaicAge block from the selected starting god-power source major god, and copies full minor-god bonus tracks such as `ClassicalAgeAnubis` from the vanilla files instead of emitting empty placeholder tracks.
