/* AoM Retold Major God Creator - static GitHub Pages draft
   This is intentionally backend-free. All files are generated locally in the browser. */

const AGES = ["ClassicalAge", "HeroicAge", "MythicAge"];

const DEFAULT_TEMPLATE_MAJOR_BY_CULTURE = {
  Greek: "Zeus",
  Egyptian: "Ra",
  Norse: "Odin",
  Atlantean: "Kronos",
  Chinese: "Fuxi",
  Japanese: "Amaterasu",
  Aztec: "Huitzilopochtli",
};

const STARTING_GOD_POWER_BY_MAJOR = {
  // Greek
  Zeus: "Bolt",
  Poseidon: "Lure",
  Hades: "Sentinel",
  Demeter: "Wither",

  // Egyptian
  Ra: "Rain",
  Isis: "Prosperity",
  Set: "Vision",

  // Norse
  Thor: "DwarvenMine",
  Odin: "GreatHunt",
  Loki: "Spy",
  Freyr: "Gullinbursti",

  // Atlantean
  Kronos: "Deconstruction",
  Oranos: "Shockwave",
  Gaia: "GaiaForest",

  // Chinese
  Fuxi: "ThePeachBlossomSpring",
  Nuwa: "Creation",
  Shennong: "ProsperousSeeds",

  // Japanese
  Amaterasu: "SolarShield",
  Susanoo: "Kusanagi",
  Tsukuyomi: "NewMoon",

  // Aztec
  Huitzilopochtli: "BloodPact",
  Quetzalcoatl: "Tailwind",
  Tezcatlipoca: "ObsidianMirror",
};

function archaicGodPowerOptions() {
  const seen = new Set();
  const options = [];
  for (const major of window.AOM_DATA.majors) {
    const power = STARTING_GOD_POWER_BY_MAJOR[major.name] || "";
    if (!power) continue;
    const key = `${major.culture}|${power}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ culture: major.culture, power });
  }
  return options.sort((a, b) => a.culture.localeCompare(b.culture) || a.power.localeCompare(b.power));
}

const $ = (id) => document.getElementById(id);

const els = {
  displayName: $("displayName"),
  internalName: $("internalName"),
  baseMajor: $("baseMajor"),
  godPower: $("godPower"),
  iconFile: $("iconFile"),
  sameCultureOnly: $("sameCultureOnly"),
  minorPickers: $("minorPickers"),
  downloadZip: $("downloadZip"),
  savePreset: $("savePreset"),
  loadPreset: $("loadPreset"),
  exportPreset: $("exportPreset"),
  messages: $("messages"),
  layoutPreview: $("layoutPreview"),
  configPreview: $("configPreview"),
};

function sanitizeId(value, fallback = "CustomMajorGod") {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
  return cleaned || fallback;
}

function sanitizeFolder(value) {
  return sanitizeId(value).replace(/^\d+/, "") || "CustomMajorGod";
}

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function pascal(value) {
  return sanitizeId(value).replace(/^./, (c) => c.toUpperCase());
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function selectedPantheon() {
  return els.baseMajor.value || window.AOM_DATA.majors[0]?.culture || "Greek";
}

function selectedBaseMajor() {
  const culture = selectedPantheon();
  const preferred = DEFAULT_TEMPLATE_MAJOR_BY_CULTURE[culture];
  return window.AOM_DATA.majors.find((m) => m.culture === culture && m.name === preferred)
    || window.AOM_DATA.majors.find((m) => m.culture === culture)
    || window.AOM_DATA.majors[0];
}

function displayGodName(name) {
  return String(name || "").toUpperCase();
}

function minorLabel(god) {
  return `${displayGodName(god.name)} (${god.culture})`;
}

function canonicalMinorTech(godOrTech, ageHint = "") {
  if (!godOrTech) return "";
  if (typeof godOrTech === "object") return `${godOrTech.age}${sanitizeId(godOrTech.name)}`;
  const raw = String(godOrTech);
  const found = window.AOM_DATA.minors.find((g) => g.tech === raw || `${g.age}${sanitizeId(g.name)}` === raw);
  if (found) return `${found.age}${sanitizeId(found.name)}`;
  const m = raw.match(/^(ClassicalAge|HeroicAge|MythicAge)(.+)$/i);
  if (m) {
    const properAge = AGES.find((a) => a.toLowerCase() === m[1].toLowerCase()) || ageHint || m[1];
    return `${properAge}${sanitizeId(m[2])}`;
  }
  return sanitizeId(raw);
}

function setMessage(text, isError = false) {
  els.messages.textContent = text;
  els.messages.classList.toggle("error", Boolean(isError));
}

function initMajorSelect() {
  const cultures = Array.from(new Set(window.AOM_DATA.majors.map((m) => m.culture))).sort();
  els.baseMajor.innerHTML = "";
  for (const culture of cultures) {
    const majorCount = window.AOM_DATA.majors.filter((m) => m.culture === culture).length;
    const opt = document.createElement("option");
    opt.value = culture;
    opt.textContent = `${culture} pantheon (${majorCount} major gods)`;
    els.baseMajor.appendChild(opt);
  }
  if (cultures.includes("Greek")) els.baseMajor.value = "Greek";
}


function initGodPowerSelect(keep = true) {
  const previous = keep ? els.godPower.value : "";
  const options = archaicGodPowerOptions();
  els.godPower.innerHTML = "";

  for (const culture of Array.from(new Set(options.map((entry) => entry.culture)))) {
    const group = document.createElement("optgroup");
    group.label = culture;
    for (const entry of options.filter((item) => item.culture === culture)) {
      const opt = document.createElement("option");
      opt.value = entry.power;
      opt.dataset.pantheon = entry.culture;
      opt.textContent = `${entry.culture} — ${entry.power}`;
      group.appendChild(opt);
    }
    els.godPower.appendChild(group);
  }

  if (previous && options.some((entry) => entry.power === previous)) {
    els.godPower.value = previous;
  } else {
    const matchingPantheonPower = options.find((entry) => entry.culture === selectedPantheon());
    els.godPower.value = matchingPantheonPower?.power || options[0]?.power || "";
  }
}

function makeMinorPicker(age, slot) {
  const label = document.createElement("label");
  label.textContent = `${age.replace("Age", " Age")} choice ${slot}`;
  const select = document.createElement("select");
  select.id = `${age}_${slot}`;
  select.dataset.age = age;
  select.dataset.slot = String(slot);
  label.appendChild(select);
  return label;
}

function initMinorPickers() {
  els.minorPickers.innerHTML = "";
  for (const age of AGES) {
    const card = document.createElement("div");
    card.className = "age-card";
    const h = document.createElement("h3");
    h.textContent = age.replace("Age", " Age");
    card.appendChild(h);
    card.appendChild(makeMinorPicker(age, 1));
    card.appendChild(makeMinorPicker(age, 2));
    els.minorPickers.appendChild(card);
  }
  refreshMinorOptions();
}

function refreshMinorOptions(keep = true) {
  const base = selectedBaseMajor();
  const current = keep ? collectMinorSelectionLoose() : {};
  for (const age of AGES) {
    const options = window.AOM_DATA.minors.filter((g) => {
      if (g.age !== age) return false;
      return !els.sameCultureOnly.checked || g.culture === base.culture;
    });
    for (const slot of [1, 2]) {
      const select = $(`${age}_${slot}`);
      select.innerHTML = "";
      for (const god of options) {
        const opt = document.createElement("option");
        opt.value = canonicalMinorTech(god);
        opt.textContent = minorLabel(god);
        select.appendChild(opt);
      }
      const previous = current[age]?.[slot - 1];
      if (previous && options.some((g) => canonicalMinorTech(g) === canonicalMinorTech(previous))) select.value = canonicalMinorTech(previous);
      else if (options[slot - 1]) select.value = canonicalMinorTech(options[slot - 1]);
      else if (options[0]) select.value = canonicalMinorTech(options[0]);
    }
  }
  updatePreview();
}

function collectMinorSelectionLoose() {
  const result = {};
  for (const age of AGES) {
    result[age] = [];
    for (const slot of [1, 2]) {
      const select = $(`${age}_${slot}`);
      if (select) result[age].push(select.value);
    }
  }
  return result;
}

function getMinorByTech(tech) {
  const canonical = canonicalMinorTech(tech);
  return window.AOM_DATA.minors.find((g) => g.tech === tech || canonicalMinorTech(g) === canonical);
}

function getConfig() {
  const base = selectedBaseMajor();
  const internal = sanitizeFolder(els.internalName.value || els.displayName.value);
  const minorGods = collectMinorSelectionLoose();
  return {
    displayName: els.displayName.value.trim() || "Custom Major God",
    internalName: internal,
    lowerName: lower(internal),
    baseMajorName: base.name,
    baseCulture: selectedPantheon(),
    baseMajor: base,
    godPower: els.godPower.value,
    godPowerPantheon: els.godPower.selectedOptions[0]?.dataset.pantheon || "",
    minorGods,
    stringPrefix: `STR_CIV_${internal.toUpperCase()}`,
    ageTechs: {
      archaic: `ArchaicAge${internal}`,
      classical: `ClassicalAge${internal}`,
      heroic: `HeroicAge${internal}`,
      mythic: `MythicAge${internal}`,
    },
  };
}

function validateConfig(config) {
  const errors = [];
  if (!config.displayName) errors.push("Major god display name is required.");
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(config.internalName)) errors.push("Internal name must start with a letter and use only letters/numbers after sanitizing.");
  if (!config.godPower) errors.push("Choose a starting god power.");
  const validStartingPowers = archaicGodPowerOptions().map((entry) => entry.power);
  if (config.godPower && !validStartingPowers.includes(config.godPower)) {
    errors.push("Starting god power must be one of the existing Archaic Age god powers.");
  }
  for (const age of AGES) {
    const picks = config.minorGods[age] || [];
    if (picks.length !== 2 || !picks[0] || !picks[1]) errors.push(`${age}: choose two minor gods.`);
    if (picks[0] === picks[1]) errors.push(`${age}: the two minor gods must be different.`);
  }
  const icon = els.iconFile.files[0];
  if (icon) {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(icon.type)) errors.push("Icon must be PNG, JPG, or WebP.");
    if (icon.size > 2 * 1024 * 1024) errors.push("Icon must be 2 MB or smaller for this draft.");
  }
  return errors;
}

function cloneAndPatchMajorGodXml(config, iconPath) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(config.baseMajor.xml, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("Could not parse base major god XML.");
  const civ = doc.documentElement;

  setText(doc, civ, "name", config.internalName);
  setText(doc, civ, "key", config.internalName.slice(0, 1).toUpperCase());
  setText(doc, civ, "displaynameid", config.stringPrefix);
  setText(doc, civ, "rollovernameid", `${config.stringPrefix}_LR`);
  setText(doc, civ, "titleid", `${config.stringPrefix}_T`);
  if (iconPath) {
    setText(doc, civ, "icon", iconPath);
    setText(doc, civ, "portrait", iconPath);
    setText(doc, civ, "breakoutportrait", iconPath);
  }
  const ageTech = civ.querySelector("agetech[age='ArchaicAge'] tech") || civ.querySelector("agetech tech");
  if (ageTech) ageTech.textContent = config.ageTechs.archaic;

  const xml = new XMLSerializer().serializeToString(civ);
  return `<civmods>\n${indent(xml, 1)}\n</civmods>\n`;
}

function setText(doc, root, tag, text) {
  let node = root.querySelector(tag);
  if (!node) {
    node = doc.createElement(tag);
    root.appendChild(node);
  }
  node.textContent = text;
}

function indent(xml, level = 1) {
  const pad = "\t".repeat(level);
  return xml.split("\n").map((line) => pad + line).join("\n");
}

function techStatusEffects(techs, status = "obtainable") {
  return techs.map((tech) => `\t\t\t<effect type="TechStatus" status="${status}">${escapeXml(tech)}</effect>`).join("\n");
}

function cultureAgeTech(age, culture) {
  return `${age}${culture}`;
}

function godPowerEffect(power) {
  return `			<effect type="Data" subtype="GodPower" power="${escapeXml(power)}" amount="1.0" cooldown="60.0" relativity="Absolute">
				<target type="Player"></target>
			</effect>`;
}

function generateTechTreeMods(config) {
  const c = config.ageTechs;
  const classical = config.minorGods.ClassicalAge;
  const heroic = config.minorGods.HeroicAge;
  const mythic = config.minorGods.MythicAge;
  const culture = config.baseCulture;
  return `<techtreemods>
	<tech name="${escapeXml(c.archaic)}">
		<status>UNOBTAINABLE</status>
		<flag>HideAllNotifications</flag>
		<flag>AgeTech</flag>
		<effects>
${techStatusEffects([...classical, c.classical])}
			<effect type="TechStatus" status="active">ArchaicAgeWeakenUnits</effect>
${godPowerEffect(config.godPower)}
		</effects>
	</tech>

	<tech name="${escapeXml(c.classical)}">
		<status>UNOBTAINABLE</status>
		<flag>HideAllNotifications</flag>
		<flag>Volatile</flag>
		<flag>AgeTech</flag>
		<prereqs>
			<specificage>ClassicalAge</specificage>
		</prereqs>
		<effects>
			<effect type="TechStatus" status="active">ClassicalAgeGeneral</effect>
			<effect type="TechStatus" status="active">${escapeXml(cultureAgeTech("ClassicalAge", culture))}</effect>
${techStatusEffects([...heroic, c.heroic])}
		</effects>
	</tech>

	<tech name="${escapeXml(c.heroic)}">
		<status>UNOBTAINABLE</status>
		<flag>HideAllNotifications</flag>
		<flag>Volatile</flag>
		<flag>AgeTech</flag>
		<prereqs>
			<specificage>HeroicAge</specificage>
		</prereqs>
		<effects>
			<effect type="TechStatus" status="active">HeroicAgeGeneral</effect>
			<effect type="TechStatus" status="active">${escapeXml(cultureAgeTech("HeroicAge", culture))}</effect>
${techStatusEffects([...mythic, c.mythic])}
		</effects>
	</tech>

	<tech name="${escapeXml(c.mythic)}">
		<status>UNOBTAINABLE</status>
		<flag>HideAllNotifications</flag>
		<flag>Volatile</flag>
		<flag>AgeTech</flag>
		<prereqs>
			<specificage>MythicAge</specificage>
		</prereqs>
		<effects>
			<effect type="TechStatus" status="active">MythicAgeGeneral</effect>
			<effect type="TechStatus" status="active">${escapeXml(cultureAgeTech("MythicAge", culture))}</effect>
		</effects>
	</tech>
</techtreemods>\n`;
}

function generateMinorGodsMods() {
  return `<minorgodsmods>\n\t<!-- Existing vanilla minor gods are referenced directly, so no new minor god definitions are required for this draft. -->\n</minorgodsmods>\n`;
}

function techStringBase(techName) {
  return `STR_TECH_${sanitizeId(techName).toUpperCase()}`;
}

function generateStringMods(config) {
  const archaic = techStringBase(config.ageTechs.archaic);
  const classical = techStringBase(config.ageTechs.classical);
  const heroic = techStringBase(config.ageTechs.heroic);
  const mythic = techStringBase(config.ageTechs.mythic);
  return `Language = "English"

// GENERATED BY AOM RETOLD MAJOR GOD CREATOR DRAFT
// Keep this file small: only new custom major-god strings are generated.

// GENERAL

ID = "${config.stringPrefix}"   ;   Str = "${escapeStringMod(config.displayName)}"
ID = "${config.stringPrefix}_LR"   ;   Str = "${escapeStringMod(config.displayName)}"
ID = "${config.stringPrefix}_T"   ;   Str = "${escapeStringMod(config.displayName)} followers"

// CUSTOM AGE TECHS

ID = "${archaic}_NAME"   ;   Str = "${escapeStringMod(config.displayName)}"
ID = "${archaic}_LR"   ;   Str = "Start under ${escapeStringMod(config.displayName)}."

ID = "${classical}_NAME"   ;   Str = "Classical Age"
ID = "${classical}_LR"   ;   Str = "Advance to the Classical Age."
ID = "${classical}_SELF"   ;   Str = "You have advanced to the Classical Age."
ID = "${classical}_OTHER"   ;   Str = "{0} advances to the Classical Age."

ID = "${heroic}_NAME"   ;   Str = "Heroic Age"
ID = "${heroic}_LR"   ;   Str = "Advance to the Heroic Age."
ID = "${heroic}_SELF"   ;   Str = "You have advanced to the Heroic Age."
ID = "${heroic}_OTHER"   ;   Str = "{0} advances to the Heroic Age."

ID = "${mythic}_NAME"   ;   Str = "Mythic Age"
ID = "${mythic}_LR"   ;   Str = "Advance to the Mythic Age."
ID = "${mythic}_SELF"   ;   Str = "You have advanced to the Mythic Age."
ID = "${mythic}_OTHER"   ;   Str = "{0} advances to the Mythic Age."
`;
}

function escapeStringMod(value) {
  return String(value ?? "").replaceAll('"', "'");
}

function generateGodPickerXaml(config) {
  const className = `GodPicker_${config.baseCulture}_${config.internalName}`;
  const archaicBlock = godPickerArchaicPowerBlock(config.godPower);
  return `﻿<local:GodPickerPageBase
    x:Class="athenswpf.Content.Pregame.GodPicker.${escapeXml(className)}"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
    xmlns:local="clr-namespace:athenswpf.Content.Pregame.GodPicker"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    xmlns:techTree="clr-namespace:athenswpf.Content.Pregame.TechTree"
    Style="{StaticResource GodPickerPageStyle}"
    mc:Ignorable="d">

    <local:GodPickerPageBase.Ages>
${indentBlock(archaicBlock, 2)}
${AGES.map((age) => generateGodPickerAge(age, config.minorGods[age])).join("\n")}
    </local:GodPickerPageBase.Ages>
</local:GodPickerPageBase>
`;
}

function godPickerArchaicPowerBlock(power) {
  return `<techTree:TechTreeAge AgeName="ArchaicAge">
    <techTree:TechTreeAge.Technologies>
        <techTree:TechTreeNode Power="${escapeXml(power)}" />
    </techTree:TechTreeAge.Technologies>
</techTree:TechTreeAge>`;
}

function godPickerBonusTrack(tech) {
  const templates = window.AOM_GODPICKER || {};
  const block = templates.bonusTrackByGod?.[tech];
  if (block) return block;
  return `<techTree:TechTreeBonusTrack God="${escapeXml(tech)}" />`;
}

function indentBlock(block, level = 0) {
  const pad = "    ".repeat(level);
  return String(block || "")
    .split("\n")
    .map((line) => line.trim() ? pad + line : line)
    .join("\n");
}

function generateGodPickerAge(age, techs) {
  return `        <techTree:TechTreeAge AgeName="${age}">
            <techTree:TechTreeAge.Bonuses>
${techs.map((tech) => indentBlock(godPickerBonusTrack(tech), 4)).join("\n\n")}
            </techTree:TechTreeAge.Bonuses>
        </techTree:TechTreeAge>`;
}

function generateTechTreeXaml(config) {
  const className = `TechTree_${config.baseCulture}_${config.internalName}`;
  const defaultColor = techTreeDefaultColor(config.baseMajorName);
  const defaultColorAttr = defaultColor ? `\n      DefaultPlayerColor="${escapeXml(defaultColor)}"` : "";
  return `﻿<local:TechTreePageBase x:Class="athenswpf.Content.Pregame.TechTree.${escapeXml(className)}"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
      xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
      xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
      xmlns:local="clr-namespace:athenswpf.Content.Pregame.TechTree"
      mc:Ignorable="d" 
      Style="{StaticResource TechTreePageStyle}"${defaultColorAttr}>

    <local:TechTreePageBase.Ages>
${indentBlock(techTreeArchaicPowerBlock(config.godPower), 2)}
${AGES.map((age) => generateTechTreeAge(age, config)).join("\n")}
        <local:TechTreeAge AgeName="TitanAge">
        </local:TechTreeAge>
    </local:TechTreePageBase.Ages>
</local:TechTreePageBase>
`;
}

function techTreeDefaultColor(sourceMajor) {
  return window.AOM_TECHTREE?.defaultPlayerColorByMajor?.[sourceMajor] || "";
}

function techTreeArchaicPowerBlock(power) {
  return `<local:TechTreeAge AgeName="ArchaicAge">
    <local:TechTreeAge.Technologies>
        <local:TechTreeNode Power="${escapeXml(power)}" />
    </local:TechTreeAge.Technologies>
</local:TechTreeAge>`;
}

function techTreeAgeTechnologiesBlock(sourceMajor, age) {
  const templates = window.AOM_TECHTREE || {};
  return templates.ageTechnologiesByMajorAge?.[`${sourceMajor}|${age}`] || "";
}

function techTreeBonusTrack(tech) {
  const templates = window.AOM_TECHTREE || {};
  const block = templates.bonusTrackByGod?.[tech];
  if (block) return block;
  return `<local:TechTreeBonusTrack God="${escapeXml(tech)}" />`;
}

function generateTechTreeAge(age, config) {
  const techs = config.minorGods[age] || [];
  const sourceMajor = config.baseMajorName;
  const technologies = techTreeAgeTechnologiesBlock(sourceMajor, age);
  return `        <local:TechTreeAge AgeName="${age}">

            <local:TechTreeAge.Bonuses>
${techs.map((tech) => indentBlock(techTreeBonusTrack(tech), 4)).join("\n\n")}
            </local:TechTreeAge.Bonuses>
${technologies ? "\n" + indentBlock(technologies, 3) + "\n" : ""}
        </local:TechTreeAge>`;
}

function generateReadme(config) {
  return `AoM Retold Major God Creator draft export

Major god: ${config.displayName}
Internal name: ${config.internalName}
Pantheon: ${config.baseCulture}
Hidden culture template used for starting units/resources: ${config.baseMajorName}
Starting god power: ${config.godPower}${config.godPowerPantheon ? ` (${config.godPowerPantheon})` : ""}
GodPicker Archaic block generated from the selected god power only.
TechTree Archaic block generated from the selected god power only.
TechTree age technology layout uses the selected pantheon template: ${config.baseMajorName}

Generated files follow this mod shape:
${config.internalName}/game/data/gameplay/major_gods_mods.xml
${config.internalName}/game/data/gameplay/minor_gods_mods.xml
${config.internalName}/game/data/gameplay/techtree_mods.xml
${config.internalName}/game/data/strings/English/stringmods.txt
${config.internalName}/game/ui_myth/content/pregame/godpicker/GodPicker_${config.baseCulture}_${config.internalName}.xaml
${config.internalName}/game/ui_myth/content/pregame/techtree/TechTree_${config.baseCulture}_${config.internalName}.xaml

Install by extracting the folder into your AoM Retold local mods folder.

Known draft limitation:
GodPicker and TechTree XAML use compact generated ArchaicAge blocks for the selected god power, plus full vanilla bonus tracks for the selected minor gods. TechTree age technology layouts use the selected pantheon template, while the bonus tracks are replaced with the selected minor gods. The remaining likely test points are age-tech effects and whether any selected cross-pantheon minor god requires additional gameplay files.
`;
}

async function generateFiles(config) {
  const icon = els.iconFile.files[0];
  let iconPath = config.baseMajor.icon;
  let iconBytes = null;
  let iconName = "";
  if (icon) {
    const ext = icon.type === "image/jpeg" ? "jpg" : icon.type === "image/webp" ? "webp" : "png";
    iconName = `${config.internalName}_icon.${ext}`;
    iconPath = `resources\\${config.lowerName}\\${iconName}`;
    iconBytes = await icon.arrayBuffer();
  }

  const root = `${config.internalName}/`;
  const files = [];
  files.push(textFile(`${root}README_INSTALL.txt`, generateReadme(config)));
  files.push(textFile(`${root}game/data/gameplay/major_gods_mods.xml`, cloneAndPatchMajorGodXml(config, iconPath)));
  files.push(textFile(`${root}game/data/gameplay/minor_gods_mods.xml`, generateMinorGodsMods(config)));
  files.push(textFile(`${root}game/data/gameplay/techtree_mods.xml`, generateTechTreeMods(config)));
  files.push(textFile(`${root}game/data/gameplay/proto_mods.xml`, `<protomods>\n\t<!-- Empty in this draft. -->\n</protomods>\n`));
  files.push(textFile(`${root}game/data/gameplay/powers_mods.xml`, `<powersmod>\n\t<!-- Empty in this draft. -->\n</powersmod>\n`));
  files.push(textFile(`${root}game/data/strings/English/stringmods.txt`, generateStringMods(config)));
  files.push(textFile(`${root}game/ui_myth/content/pregame/godpicker/GodPicker_${config.baseCulture}_${config.internalName}.xaml`, generateGodPickerXaml(config)));
  files.push(textFile(`${root}game/ui_myth/content/pregame/techtree/TechTree_${config.baseCulture}_${config.internalName}.xaml`, generateTechTreeXaml(config)));
  if (iconBytes) files.push(binaryFile(`${root}game/ui_myth/resources/${config.lowerName}/${iconName}`, iconBytes));
  return files;
}

function textFile(path, text) {
  return { path, data: new TextEncoder().encode(text) };
}
function binaryFile(path, arrayBuffer) {
  return { path, data: new Uint8Array(arrayBuffer) };
}

// Tiny ZIP writer using STORE method. No CDN or server needed.
function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function u16(n) { return [n & 255, (n >>> 8) & 255]; }
function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
function dosTimeDate(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}
function concatChunks(chunks) {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}
function makeZip(files) {
  const encoder = new TextEncoder();
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;
  const dt = dosTimeDate();
  for (const file of files) {
    const nameBytes = encoder.encode(file.path.replaceAll("\\", "/"));
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data);
    const crc = crc32(data);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(dt.time), ...u16(dt.date),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0),
      ...nameBytes, ...data,
    ]);
    localChunks.push(local);
    const central = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(dt.time), ...u16(dt.date),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...nameBytes,
    ]);
    centralChunks.push(central);
    offset += local.length;
  }
  const centralOffset = offset;
  const central = concatChunks(centralChunks);
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(central.length), ...u32(centralOffset), ...u16(0),
  ]);
  return new Blob([concatChunks(localChunks), central, end], { type: "application/zip" });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function handleDownload() {
  const config = getConfig();
  const errors = validateConfig(config);
  if (errors.length) return setMessage(errors.join(" "), true);
  try {
    const files = await generateFiles(config);
    const zip = makeZip(files);
    downloadBlob(zip, `${config.internalName}.zip`);
    setMessage(`Generated ${files.length} files in ${config.internalName}.zip`);
  } catch (err) {
    console.error(err);
    setMessage(`Export failed: ${err.message}`, true);
  }
}

function presetFromForm() {
  const config = getConfig();
  return {
    displayName: config.displayName,
    internalName: config.internalName,
    baseCulture: config.baseCulture,
    godPower: config.godPower,
    godPowerPantheon: config.godPowerPantheon,
    sameCultureOnly: els.sameCultureOnly.checked,
    minorGods: config.minorGods,
  };
}
function applyPreset(preset) {
  if (!preset) return;
  els.displayName.value = preset.displayName || "My Custom Major God";
  els.internalName.value = preset.internalName || sanitizeFolder(preset.displayName);
  if (preset.baseCulture) els.baseMajor.value = preset.baseCulture;
  else if (preset.baseMajorName) {
    const oldMajor = window.AOM_DATA.majors.find((m) => m.name === preset.baseMajorName);
    if (oldMajor) els.baseMajor.value = oldMajor.culture;
  }
  initGodPowerSelect(false);
  if (preset.godPower && Array.from(els.godPower.options).some((o) => o.value === preset.godPower)) els.godPower.value = preset.godPower;
  els.sameCultureOnly.checked = preset.sameCultureOnly !== false;
  refreshMinorOptions(false);
  if (preset.minorGods) {
    for (const age of AGES) {
      for (const slot of [1, 2]) {
        const select = $(`${age}_${slot}`);
        const value = preset.minorGods[age]?.[slot - 1];
        if (value && Array.from(select.options).some((o) => o.value === canonicalMinorTech(value))) select.value = canonicalMinorTech(value);
      }
    }
  }
  updatePreview();
}

function updatePreview() {
  const config = getConfig();
  els.layoutPreview.textContent = `${config.internalName}/
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
        GodPicker_${config.baseCulture}_${config.internalName}.xaml
      content/pregame/techtree/
        TechTree_${config.baseCulture}_${config.internalName}.xaml
      resources/${config.lowerName}/
        ${els.iconFile.files[0] ? "<uploaded icon>" : "(none; base icon path reused)"}`;
  const friendly = {
    displayName: config.displayName,
    internalName: config.internalName,
    pantheon: config.baseCulture,
    hiddenTemplateMajor: config.baseMajorName,
    startingGodPower: config.godPowerPantheon ? `${config.godPowerPantheon} — ${config.godPower}` : config.godPower,
    godPowerPantheon: config.godPowerPantheon,
    minorGods: Object.fromEntries(AGES.map((age) => [age, config.minorGods[age].map((t) => {
      const g = getMinorByTech(t);
      return g ? `${canonicalMinorTech(g)} — ${displayGodName(g.name)} (${g.culture})` : canonicalMinorTech(t);
    })])),
  };
  els.configPreview.textContent = JSON.stringify(friendly, null, 2);
}

function wireEvents() {
  els.baseMajor.addEventListener("change", () => { initGodPowerSelect(true); refreshMinorOptions(true); });
  els.sameCultureOnly.addEventListener("change", () => refreshMinorOptions(true));
  els.displayName.addEventListener("input", () => {
    if (!els.internalName.dataset.touched) els.internalName.value = sanitizeFolder(els.displayName.value);
    updatePreview();
  });
  els.internalName.addEventListener("input", () => { els.internalName.dataset.touched = "true"; updatePreview(); });
  els.iconFile.addEventListener("change", updatePreview);
  els.godPower.addEventListener("change", updatePreview);
  els.minorPickers.addEventListener("change", updatePreview);
  els.downloadZip.addEventListener("click", handleDownload);
  els.savePreset.addEventListener("click", () => { localStorage.setItem("aomCivCreatorPreset", JSON.stringify(presetFromForm())); setMessage("Preset saved in this browser."); });
  els.loadPreset.addEventListener("click", () => { const raw = localStorage.getItem("aomCivCreatorPreset"); if (!raw) return setMessage("No local preset found.", true); applyPreset(JSON.parse(raw)); setMessage("Preset loaded."); });
  els.exportPreset.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(presetFromForm(), null, 2)], { type: "application/json" });
    downloadBlob(blob, `${getConfig().internalName}-preset.json`);
  });
}

initMajorSelect();
initGodPowerSelect(false);
initMinorPickers();
wireEvents();
updatePreview();
