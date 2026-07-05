# AoM Retold Civ Creator - real-format draft

This is a no-build static prototype for GitHub Pages.

It uses data extracted from the supplied vanilla files:

- `game/data/gameplay/major_gods.xml`
- `game/data/gameplay/minor_gods.xml`

It generates a ZIP with a folder structure based on the supplied example mod:

```text
<MyCiv>/
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
        godpicker_<culture>_<civ>.xaml
      content/pregame/techtree/
        TechTree_<Culture>_<Civ>.xaml
      resources/<civ>/
        <uploaded icon>
```

## GitHub Pages deployment

1. Create a repository.
2. Upload these files to the repository root:
   - `index.html`
   - `style.css`
   - `app.js`
   - `aomData.js`
   - `README.md`
3. Go to **Settings -> Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save.

## Current behavior

- The app clones the selected vanilla major god's `<civ>` entry.
- It changes the civ name, string IDs, icon/portrait path, and Archaic age tech.
- It lets the user select two existing minor gods for Classical, Heroic, and Mythic ages.
- It generates `techtree_mods.xml` with custom age techs that unlock those chosen minor god techs.
- It generates simple GodPicker and TechTree XAML files with the chosen god tracks.

## Important limitations

This is a structural test, not a guaranteed finished playable civ generator yet.

Likely next fixes after in-game testing:

- Confirm whether `ClassicalAge<Civ>`, `HeroicAge<Civ>`, and `MythicAge<Civ>` need more effects copied from the base culture/major god.
- Confirm whether GodPicker/TechTree XAML requires detailed technology nodes under each chosen minor god track.
- Confirm whether custom civ registration requires more UI files or naming conventions.
- Add preset import.
- Add a preview of the generated XML before ZIP export.

## No server

Everything is generated locally in the browser. Uploaded icons are not uploaded anywhere.
