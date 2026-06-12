const FONT_EXTENSIONS = new Set(["ttf", "otf", "ttc", "dfont", "woff", "woff2"]);
const CATEGORY_LABELS = {
  barcode: "Barcode",
  display: "Display",
  mono: "Mono",
  sans: "Sans",
  script: "Script",
  serif: "Serif",
  symbol: "Symbol",
  unknown: "Chưa rõ",
};

const elements = {
  fileInput: document.querySelector("#fontFiles"),
  dropzone: document.querySelector(".dropzone"),
  sampleText: document.querySelector("#sampleText"),
  searchInput: document.querySelector("#searchInput"),
  categoryInput: document.querySelector("#categoryInput"),
  sizeInput: document.querySelector("#sizeInput"),
  weightInput: document.querySelector("#weightInput"),
  styleInput: document.querySelector("#styleInput"),
  countText: document.querySelector("#countText"),
  clearButton: document.querySelector("#clearButton"),
  loadBundledButton: document.querySelector("#loadBundledButton"),
  emptyState: document.querySelector("#emptyState"),
  fontList: document.querySelector("#fontList"),
};

const state = {
  fonts: [],
};

function getExtension(name) {
  return name.split(".").pop().toLowerCase();
}

function getFontLabel(file) {
  return file.name.replace(/\.(ttf|otf|ttc|dfont|woff2?)$/i, "").replace(/[_-]+/g, " ");
}

function getFilePath(file) {
  return file.webkitRelativePath || file.name;
}

function isFontFile(file) {
  return FONT_EXTENSIONS.has(getExtension(file.name));
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function classifyFont(label, path) {
  const text = `${label} ${path}`.toLowerCase();

  if (includesAny(text, ["barcode", "code128", "qr font", "qrcode", "qr "])) return "barcode";
  if (includesAny(text, ["symbol", "dingbat", "webding", "wingding", "emoji", "braille", "ornament", "math", "stix", "zither"])) return "symbol";
  if (includesAny(text, ["mono", "monaco", "menlo", "courier", "consola", "code"])) return "mono";
  if (includesAny(text, ["script", "hand", "brush", "signpainter", "vibes", "bilestone", "bachelorette", "blackjack", "calli", "chancery", "mishafi", "snell", "zapfino"])) return "script";
  if (includesAny(text, ["serif", "times", "georgia", "baskerville", "bodoni", "didot", "cochin", "palatino", "charter", "hoefler", "rockwell", "iowan", "athelas", "garamond", "bree"])) return "serif";
  if (includesAny(text, ["sans", "arial", "helvetica", "avenir", "roboto", "lato", "montserrat", "poppins", "raleway", "open sans", "verdana", "tahoma", "geneva", "gothic", "sfns", "sfcompact", "shopee", "noto"])) return "sans";
  if (includesAny(text, ["display", "decor", "chalk", "papyrus", "futura", "impact", "bebas", "phosphate", "marker", "stencil", "rough", "battle", "tropical"])) return "display";

  return "unknown";
}

async function loadFontSource({ label, path, source, type, urlObject }) {
  const family = `font-check-${crypto.randomUUID()}`;
  const face = new FontFace(family, `url("${encodeURI(source)}")`);

  await face.load();
  document.fonts.add(face);

  state.fonts.push({
    category: classifyFont(label, path),
    family,
    label,
    path,
    type,
    url: urlObject,
  });
}

async function addFonts(files) {
  const fontFiles = Array.from(files).filter(isFontFile);
  const existingPaths = new Set(state.fonts.map((font) => font.path));
  const newFonts = fontFiles.filter((file) => !existingPaths.has(getFilePath(file)));

  const results = await Promise.allSettled(
    newFonts.map(async (file) => {
      const path = getFilePath(file);
      const url = URL.createObjectURL(file);

      await loadFontSource({
        label: getFontLabel(file),
        path,
        source: url,
        type: getExtension(file.name).toUpperCase(),
        urlObject: url,
      });
    })
  );

  const failedCount = results.filter((result) => result.status === "rejected").length;
  if (failedCount > 0) {
    console.warn(`${failedCount} font file(s) could not be loaded.`);
  }

  state.fonts.sort((a, b) => a.label.localeCompare(b.label));
  render();
}

async function loadBundledFonts() {
  elements.loadBundledButton.disabled = true;
  elements.loadBundledButton.textContent = "Đang load fonts/...";
  elements.countText.textContent = "Đang load fonts/...";

  try {
    const paths = await getBundledFontPaths();
    const existingPaths = new Set(state.fonts.map((font) => font.path));
    const newPaths = paths.filter((path) => !existingPaths.has(path));

    const results = await Promise.allSettled(
      newPaths.map((path) => {
        const name = path.split("/").pop();
        return loadFontSource({
          label: name.replace(/\.(ttf|otf|ttc|dfont|woff2?)$/i, "").replace(/[_-]+/g, " "),
          path,
          source: path,
          type: getExtension(name).toUpperCase(),
        });
      })
    );

    const failedCount = results.filter((result) => result.status === "rejected").length;
    if (failedCount > 0) {
      console.warn(`${failedCount} bundled font file(s) could not be loaded.`);
    }

    state.fonts.sort((a, b) => a.label.localeCompare(b.label));
    render();
  } catch (error) {
    alert(error.message);
  } finally {
    elements.loadBundledButton.disabled = false;
    elements.loadBundledButton.textContent = "Load fonts/";
  }
}

async function getBundledFontPaths() {
  if (Array.isArray(window.FONT_MANIFEST)) {
    return window.FONT_MANIFEST;
  }

  const response = await fetch("fonts-manifest.json");
  if (!response.ok) {
    throw new Error("Không đọc được danh sách fonts/. Hãy mở bằng localhost hoặc kiểm tra file fonts-manifest.js.");
  }

  return response.json();
}

function getFilteredFonts() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryInput.value;

  return state.fonts.filter((font) => {
    const matchesQuery = !query || `${font.label} ${font.path}`.toLowerCase().includes(query);
    const matchesCategory = category === "all" || font.category === category;

    return matchesQuery && matchesCategory;
  });
}

function render() {
  const fonts = getFilteredFonts();
  const total = state.fonts.length;
  const sample = elements.sampleText.value || "Aa Bb Cc 0123456789";
  const size = `${elements.sizeInput.value}px`;
  const weight = elements.weightInput.value;
  const style = elements.styleInput.value;

  elements.countText.textContent = total
    ? `${fonts.length}/${total} font đang hiển thị.`
    : "Chưa có font nào.";

  elements.emptyState.classList.toggle("hidden", total > 0);
  elements.fontList.innerHTML = "";

  const fragment = document.createDocumentFragment();

  fonts.forEach((font) => {
    const card = document.createElement("article");
    card.className = "font-card";

    card.innerHTML = `
      <div class="font-head">
        <div>
          <h2 class="font-name"></h2>
          <p class="font-path"></p>
        </div>
        <div class="font-tags">
          <span class="font-type"></span>
          <span class="font-tag category-tag"></span>
        </div>
      </div>
      <p class="preview"></p>
    `;

    card.querySelector(".font-name").textContent = font.label;
    card.querySelector(".font-path").textContent = font.path;
    card.querySelector(".font-type").textContent = font.type;
    card.querySelector(".category-tag").textContent = CATEGORY_LABELS[font.category] || "Chưa rõ";

    const preview = card.querySelector(".preview");
    preview.textContent = sample;
    preview.style.fontFamily = `"${font.family}", sans-serif`;
    preview.style.fontSize = size;
    preview.style.fontWeight = weight;
    preview.style.fontStyle = style;

    fragment.append(card);
  });

  elements.fontList.append(fragment);
}

function clearFonts() {
  state.fonts.forEach((font) => URL.revokeObjectURL(font.url));
  state.fonts = [];
  elements.fileInput.value = "";
  render();
}

elements.fileInput.addEventListener("change", (event) => {
  addFonts(event.target.files).catch((error) => {
    alert(`Không load được font: ${error.message}`);
  });
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  elements.dropzone.addEventListener(eventName, () => {
    elements.dropzone.classList.remove("dragging");
  });
});

elements.dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  addFonts(event.dataTransfer.files).catch((error) => {
    alert(`Không load được font: ${error.message}`);
  });
});

[
  elements.sampleText,
  elements.searchInput,
  elements.categoryInput,
  elements.sizeInput,
  elements.weightInput,
  elements.styleInput,
].forEach((element) => element.addEventListener("input", render));

elements.clearButton.addEventListener("click", clearFonts);
elements.loadBundledButton.addEventListener("click", loadBundledFonts);

render();
