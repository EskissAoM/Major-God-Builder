/* AoM Retold Civ Creator - static GitHub Pages draft
   This is intentionally backend-free. All files are generated locally in the browser. */

const AGES = ["ClassicalAge", "HeroicAge", "MythicAge"];
const $ = (id) => document.getElementById(id);

const els = {
  displayName: $("displayName"),
  internalName: $("internalName"),
  baseMajor: $("baseMajor"),
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

function sanitizeId(value, fallback = "CustomCiv") {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
  return cleaned || fallback;
}

function sanitizeFolder(value) {
  return sanitizeId(value).replace(/^\d+/, "") || "CustomCiv";
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

function selectedBaseMajor() {
  return window.AOM_DATA.majors.find((m) => m.name === els.baseMajor.value) || window.AOM_DATA.majors[0];
}

function minorLabel(god) {
  return `${god.name} (${god.culture})`;
}

function setMessage(text, isError = false) {
  els.messages.textContent = text;
  els.messages.classList.toggle("error", Boolean(isError));
}

function initMajorSelect() {
  const groups = new Map();
  for (const major of window.AOM_DATA.majors) {
    if (!groups.has(major.culture)) groups.set(major.culture, []);
    groups.get(major.culture).push(major);
  }
  els.baseMajor.innerHTML = "";
  for (const [culture, majors] of groups) {
    const group = document.createElement("optgroup");
    group.label = `${culture} (${majors.length})`;
    for (const major of majors) {
      const opt = document.createElement("option");
      opt.value = major.name;
      opt.textContent = `${major.name} — ${major.culture}`;
      group.appendChild(opt);
    }
    els.baseMajor.appendChild(group);
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
        opt.value = god.tech;
        opt.textContent = minorLabel(god);
        select.appendChild(opt);
      }
      const previous = current[age]?.[slot - 1];
      if (previous && options.some((g) => g.tech === previous)) select.value = previous;
      else if (options[slot - 1]) select.value = options[slot - 1].tech;
      else if (options[0]) select.value = options[0].tech;
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
  return window.AOM_DATA.minors.find((g) => g.tech === tech);
}

function getConfig() {
  const base = selectedBaseMajor();
  const internal = sanitizeFolder(els.internalName.value || els.displayName.value);
  const minorGods = collectMinorSelectionLoose();
  return {
    displayName: els.displayName.value.trim() || "Custom Civilization",
    internalName: internal,
    lowerName: lower(internal),
    baseMajorName: base.name,
    baseCulture: base.culture,
    baseMajor: base,
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
  if (!config.displayName) errors.push("Civ display name is required.");
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(config.internalName)) errors.push("Internal name must start with a letter and use only letters/numbers after sanitizing.");
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

function generateTechTreeMods(config) {
  const c = config.ageTechs;
  const classical = config.minorGods.ClassicalAge;
  const heroic = config.minorGods.HeroicAge;
  const mythic = config.minorGods.MythicAge;
  return `<techtreemods>
\t<tech name="${escapeXml(c.archaic)}">
\t\t<status>UNOBTAINABLE</status>
\t\t<flag>HideAllNotifications</flag>
\t\t<flag>AgeTech</flag>
\t\t<effects>
${techStatusEffects([...classical, c.classical])}
\t\t</effects>
\t</tech>

\t<tech name="${escapeXml(c.classical)}">
\t\t<status>UNOBTAINABLE</status>
\t\t<flag>HideAllNotifications</flag>
\t\t<flag>Volatile</flag>
\t\t<flag>AgeTech</flag>
\t\t<prereqs>
\t\t\t<specificage>ClassicalAge</specificage>
\t\t</prereqs>
\t\t<effects>
${techStatusEffects([...heroic, c.heroic])}
\t\t</effects>
\t</tech>

\t<tech name="${escapeXml(c.heroic)}">
\t\t<status>UNOBTAINABLE</status>
\t\t<flag>HideAllNotifications</flag>
\t\t<flag>Volatile</flag>
\t\t<flag>AgeTech</flag>
\t\t<prereqs>
\t\t\t<specificage>HeroicAge</specificage>
\t\t</prereqs>
\t\t<effects>
${techStatusEffects([...mythic, c.mythic])}
\t\t</effects>
\t</tech>

\t<tech name="${escapeXml(c.mythic)}">
\t\t<status>UNOBTAINABLE</status>
\t\t<flag>HideAllNotifications</flag>
\t\t<flag>Volatile</flag>
\t\t<flag>AgeTech</flag>
\t\t<prereqs>
\t\t\t<specificage>MythicAge</specificage>
\t\t</prereqs>
\t\t<effects>
\t\t</effects>
\t</tech>
</techtreemods>\n`;
}

function generateMinorGodsMods() {
  return `<minorgodsmods>\n\t<!-- Existing vanilla minor gods are referenced directly, so no new minor god definitions are required for this draft. -->\n</minorgodsmods>\n`;
}

function generateStringMods(config) {
  return `${config.stringPrefix} ${config.displayName}
${config.stringPrefix}_LR ${config.displayName}
${config.stringPrefix}_T ${config.displayName}
STR_TECH_${config.internalName.toUpperCase()}_CLASSICAL_NAME Advance to Classical Age
STR_TECH_${config.internalName.toUpperCase()}_HEROIC_NAME Advance to Heroic Age
STR_TECH_${config.internalName.toUpperCase()}_MYTHIC_NAME Advance to Mythic Age
`;
}

function generateGodPickerXaml(config) {
  const className = `GodPicker_${config.baseCulture}_${config.internalName}`;
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
        <techTree:TechTreeAge AgeName="ArchaicAge" />
${AGES.map((age) => generateGodPickerAge(age, config.minorGods[age])).join("\n")}
    </local:GodPickerPageBase.Ages>
</local:GodPickerPageBase>
`;
}

function generateGodPickerAge(age, techs) {
  return `        <techTree:TechTreeAge AgeName="${age}">
            <techTree:TechTreeAge.Bonuses>
${techs.map((tech) => `                <techTree:TechTreeBonusTrack God="${escapeXml(tech)}" />`).join("\n")}
            </techTree:TechTreeAge.Bonuses>
        </techTree:TechTreeAge>`;
}

function generateTechTreeXaml(config) {
  const className = `TechTree_${config.baseCulture}_${config.internalName}`;
  return `﻿<local:TechTreePageBase x:Class="athenswpf.Content.Pregame.TechTree.${escapeXml(className)}"
      xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
      xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
      xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" 
      xmlns:d="http://schemas.microsoft.com/expression/blend/2008" 
      xmlns:local="clr-namespace:athenswpf.Content.Pregame.TechTree"
      mc:Ignorable="d" 
      Style="{StaticResource TechTreePageStyle}">

    <local:TechTreePageBase.Ages>
        <local:TechTreeAge AgeName="ArchaicAge" />
${AGES.map((age) => generateTechTreeAge(age, config.minorGods[age])).join("\n")}
    </local:TechTreePageBase.Ages>
</local:TechTreePageBase>
`;
}

function generateTechTreeAge(age, techs) {
  return `        <local:TechTreeAge AgeName="${age}">
            <local:TechTreeAge.Bonuses>
${techs.map((tech) => `                <local:TechTreeBonusTrack God="${escapeXml(tech)}" />`).join("\n")}
            </local:TechTreeAge.Bonuses>
        </local:TechTreeAge>`;
}

function generateReadme(config) {
  return `AoM Retold Civ Creator draft export

Civilization: ${config.displayName}
Internal name: ${config.internalName}
Base major god cloned: ${config.baseMajorName} (${config.baseCulture})

Generated files follow this mod shape:
${config.internalName}/game/data/gameplay/major_gods_mods.xml
${config.internalName}/game/data/gameplay/minor_gods_mods.xml
${config.internalName}/game/data/gameplay/techtree_mods.xml
${config.internalName}/game/data/strings/English/stringmods.txt
${config.internalName}/game/ui_myth/content/pregame/godpicker/godpicker_${config.baseCulture.toLowerCase()}_${config.lowerName}.xaml
${config.internalName}/game/ui_myth/content/pregame/techtree/TechTree_${config.baseCulture}_${config.internalName}.xaml

Install by extracting the folder into your AoM Retold local mods folder.

Known draft limitation:
This is designed to validate folder structure and selected god wiring. It may still need additional age-tech effects or UI nodes depending on what the game expects for a fully playable custom civ.
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
  files.push(textFile(`${root}game/ui_myth/content/pregame/godpicker/godpicker_${config.baseCulture.toLowerCase()}_${config.lowerName}.xaml`, generateGodPickerXaml(config)));
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
    baseMajorName: config.baseMajorName,
    sameCultureOnly: els.sameCultureOnly.checked,
    minorGods: config.minorGods,
  };
}
function applyPreset(preset) {
  if (!preset) return;
  els.displayName.value = preset.displayName || "My Custom Civ";
  els.internalName.value = preset.internalName || sanitizeFolder(preset.displayName);
  if (preset.baseMajorName) els.baseMajor.value = preset.baseMajorName;
  els.sameCultureOnly.checked = preset.sameCultureOnly !== false;
  refreshMinorOptions(false);
  if (preset.minorGods) {
    for (const age of AGES) {
      for (const slot of [1, 2]) {
        const select = $(`${age}_${slot}`);
        const value = preset.minorGods[age]?.[slot - 1];
        if (value && Array.from(select.options).some((o) => o.value === value)) select.value = value;
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
        godpicker_${config.baseCulture.toLowerCase()}_${config.lowerName}.xaml
      content/pregame/techtree/
        TechTree_${config.baseCulture}_${config.internalName}.xaml
      resources/${config.lowerName}/
        ${els.iconFile.files[0] ? "<uploaded icon>" : "(none; base icon path reused)"}`;
  const friendly = {
    displayName: config.displayName,
    internalName: config.internalName,
    cloneMajorGod: `${config.baseMajorName} (${config.baseCulture})`,
    minorGods: Object.fromEntries(AGES.map((age) => [age, config.minorGods[age].map((t) => {
      const g = getMinorByTech(t);
      return g ? `${g.tech} — ${g.name} (${g.culture})` : t;
    })])),
  };
  els.configPreview.textContent = JSON.stringify(friendly, null, 2);
}

function wireEvents() {
  els.baseMajor.addEventListener("change", () => refreshMinorOptions(true));
  els.sameCultureOnly.addEventListener("change", () => refreshMinorOptions(true));
  els.displayName.addEventListener("input", () => {
    if (!els.internalName.dataset.touched) els.internalName.value = sanitizeFolder(els.displayName.value);
    updatePreview();
  });
  els.internalName.addEventListener("input", () => { els.internalName.dataset.touched = "true"; updatePreview(); });
  els.iconFile.addEventListener("change", updatePreview);
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
initMinorPickers();
wireEvents();
updatePreview();
