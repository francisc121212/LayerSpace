// LayerSpace
// Protótipo simples em JavaScript puro para compor imagens em planos 3D.

const layerDefaults = {
  background: {
    label: "Fundo",
    planeId: "plane-background",
    color: "#dfe7e4",
    x: 0,
    y: 0,
    z: -4.6,
    scale: 1,
    rotation: 0,
    visible: true,
    width: 7.5,
    height: 4.2
  },
  layer1: {
    label: "Camada 1",
    planeId: "plane-layer1",
    color: "#f4b860",
    x: -0.8,
    y: 0.25,
    z: -3.2,
    scale: 1,
    rotation: 0,
    visible: true,
    width: 3.6,
    height: 2.4
  },
  layer2: {
    label: "Camada 2",
    planeId: "plane-layer2",
    color: "#70a9a1",
    x: 0.65,
    y: -0.05,
    z: -2.3,
    scale: 1,
    rotation: 0,
    visible: true,
    width: 3.2,
    height: 2.1
  },
  layer3: {
    label: "Camada 3",
    planeId: "plane-layer3",
    color: "#d95d39",
    x: 0.25,
    y: 0.55,
    z: -1.35,
    scale: 1,
    rotation: 0,
    visible: true,
    width: 2.8,
    height: 1.9
  }
};

// Cada camada guarda transformações, ficheiro carregado e URL local da imagem.
const layers = Object.fromEntries(
  Object.entries(layerDefaults).map(([key, value]) => [
    key,
    {
      ...value,
      imageUrl: "",
      fileName: ""
    }
  ])
);

let activeLayerId = "background";

const scene = document.querySelector("#scene");
const assets = document.querySelector("#assets");
const layerSelect = document.querySelector("#layerSelect");
const imageUpload = document.querySelector("#imageUpload");
const fileName = document.querySelector("#fileName");
const visibilityButton = document.querySelector("#visibilityButton");
const resetButton = document.querySelector("#resetButton");
const exportButton = document.querySelector("#exportButton");
const centerCameraButton = document.querySelector("#centerCameraButton");
const layerSummary = document.querySelector("#layerSummary");

const inputs = {
  x: document.querySelector("#posX"),
  y: document.querySelector("#posY"),
  z: document.querySelector("#posZ"),
  scale: document.querySelector("#scale"),
  rotation: document.querySelector("#rotation")
};

const outputs = {
  x: document.querySelector("#posXValue"),
  y: document.querySelector("#posYValue"),
  z: document.querySelector("#posZValue"),
  scale: document.querySelector("#scaleValue"),
  rotation: document.querySelector("#rotationValue")
};

function getPlane(layerId) {
  return document.querySelector(`#${layers[layerId].planeId}`);
}

function getAssetId(layerId) {
  return `asset-${layerId}`;
}

function formatNumber(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "");
}

function setMaterialForLayer(layerId) {
  const layer = layers[layerId];
  const plane = getPlane(layerId);

  // Quando ainda não há imagem, o plano usa uma cor translúcida como marcador visual.
  if (!layer.imageUrl) {
    plane.setAttribute("material", {
      color: layer.color,
      opacity: 0.72,
      transparent: true,
      depthWrite: false,
      side: "double"
    });
    return;
  }

  plane.setAttribute("material", {
    src: `#${getAssetId(layerId)}`,
    transparent: true,
    opacity: 1,
    alphaTest: 0.01,
    depthWrite: false,
    side: "double"
  });
}

function fitPlaneToImage(layerId, imageElement) {
  const layer = layers[layerId];
  const ratio = imageElement.naturalWidth / imageElement.naturalHeight;
  const maxWidth = layerId === "background" ? 7.5 : 4.2;
  const maxHeight = layerId === "background" ? 4.2 : 3;

  // Mantém a proporção original da imagem dentro de um tamanho confortável.
  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  layer.width = width;
  layer.height = height;

  const plane = getPlane(layerId);
  plane.setAttribute("width", width);
  plane.setAttribute("height", height);
}

function applyLayerTransform(layerId) {
  const layer = layers[layerId];
  const plane = getPlane(layerId);

  plane.setAttribute("position", `${layer.x} ${layer.y} ${layer.z}`);
  plane.setAttribute("scale", `${layer.scale} ${layer.scale} ${layer.scale}`);
  plane.setAttribute("rotation", `0 0 ${layer.rotation}`);
  plane.setAttribute("visible", layer.visible);

  // Pequeno realce da camada selecionada sem alterar a imagem.
  plane.setAttribute("data-active", layerId === activeLayerId ? "true" : "false");
}

function syncControls() {
  const layer = layers[activeLayerId];

  inputs.x.value = layer.x;
  inputs.y.value = layer.y;
  inputs.z.value = layer.z;
  inputs.scale.value = layer.scale;
  inputs.rotation.value = layer.rotation;

  outputs.x.value = formatNumber(layer.x);
  outputs.y.value = formatNumber(layer.y);
  outputs.z.value = formatNumber(layer.z);
  outputs.scale.value = formatNumber(layer.scale);
  outputs.rotation.value = `${formatNumber(layer.rotation)} deg`;

  fileName.textContent = layer.fileName
    ? `Imagem atual: ${layer.fileName}`
    : "Nenhuma imagem carregada nesta camada.";

  visibilityButton.textContent = layer.visible ? "Ocultar camada" : "Mostrar camada";
}

function renderLayerSummary() {
  layerSummary.innerHTML = "";

  Object.entries(layers).forEach(([layerId, layer]) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `layer-card${layerId === activeLayerId ? " is-active" : ""}`;
    card.setAttribute("aria-label", `Selecionar ${layer.label}`);

    const dot = document.createElement("span");
    dot.className = "layer-dot";
    dot.style.background = layer.color;

    const meta = document.createElement("span");
    meta.className = "layer-meta";

    const title = document.createElement("strong");
    title.textContent = layer.label;

    const imageName = document.createElement("span");
    imageName.textContent = layer.fileName || "Sem imagem";

    meta.append(title, imageName);

    const status = document.createElement("span");
    status.className = `status-pill${layer.visible ? "" : " is-hidden"}`;
    status.textContent = layer.visible ? "Visível" : "Oculta";

    card.append(dot, meta, status);
    card.addEventListener("click", () => selectLayer(layerId));
    layerSummary.appendChild(card);
  });
}

function refreshInterface() {
  Object.keys(layers).forEach((layerId) => {
    setMaterialForLayer(layerId);
    applyLayerTransform(layerId);
  });

  syncControls();
  renderLayerSummary();
}

function selectLayer(layerId) {
  activeLayerId = layerId;
  layerSelect.value = layerId;
  imageUpload.value = "";
  refreshInterface();
}

function updateActiveLayer(property, value) {
  layers[activeLayerId][property] = Number(value);
  refreshInterface();
}

function createOrUpdateAsset(layerId, objectUrl, imageFileName) {
  const assetId = getAssetId(layerId);
  let imageAsset = document.querySelector(`#${assetId}`);

  if (!imageAsset) {
    imageAsset = document.createElement("img");
    imageAsset.id = assetId;
    imageAsset.crossOrigin = "anonymous";
    assets.appendChild(imageAsset);
  }

  layers[layerId].imageUrl = objectUrl;
  layers[layerId].fileName = imageFileName;

  imageAsset.onload = () => {
    fitPlaneToImage(layerId, imageAsset);
    setMaterialForLayer(layerId);
    applyLayerTransform(layerId);
    renderLayerSummary();
  };

  imageAsset.src = objectUrl;
}

function handleImageUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    fileName.textContent = "O ficheiro escolhido não é uma imagem.";
    return;
  }

  const layer = layers[activeLayerId];

  // Liberta a memória do URL anterior antes de criar outro para a mesma camada.
  if (layer.imageUrl) {
    URL.revokeObjectURL(layer.imageUrl);
  }

  const objectUrl = URL.createObjectURL(file);
  createOrUpdateAsset(activeLayerId, objectUrl, file.name);
  syncControls();
  renderLayerSummary();
}

function resetLayer(layerId) {
  const current = layers[layerId];
  const defaults = layerDefaults[layerId];

  const resetSize = !current.imageUrl;

  Object.assign(current, {
    x: defaults.x,
    y: defaults.y,
    z: defaults.z,
    scale: defaults.scale,
    rotation: defaults.rotation,
    visible: defaults.visible
  });

  if (resetSize) {
    current.width = defaults.width;
    current.height = defaults.height;

    const plane = getPlane(layerId);
    plane.setAttribute("width", defaults.width);
    plane.setAttribute("height", defaults.height);
  }

  refreshInterface();
}

function resetCamera() {
  const cameraRig = document.querySelector("#cameraRig");
  cameraRig.setAttribute("position", "0 0 3.6");
  cameraRig.setAttribute("rotation", "0 0 0");

  if (cameraRig.components["look-controls"]) {
    cameraRig.components["look-controls"].pitchObject.rotation.x = 0;
    cameraRig.components["look-controls"].yawObject.rotation.y = 0;
  }
}

function downloadCanvas(canvas) {
  const link = document.createElement("a");
  link.download = `layerspace-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function exportScreenshot() {
  // O componente screenshot do A-Frame cria uma imagem da câmara atual.
  const screenshot = scene.components.screenshot;

  if (screenshot && typeof screenshot.getCanvas === "function") {
    const canvas = screenshot.getCanvas("perspective");
    downloadCanvas(canvas);
    return;
  }

  if (screenshot && typeof screenshot.capture === "function") {
    screenshot.capture("perspective");
    return;
  }

  // Alternativa simples caso a API do componente mude numa versão futura.
  const fallbackCanvas = scene.renderer.domElement;
  downloadCanvas(fallbackCanvas);
}

layerSelect.addEventListener("change", (event) => selectLayer(event.target.value));
imageUpload.addEventListener("change", handleImageUpload);
visibilityButton.addEventListener("click", () => {
  layers[activeLayerId].visible = !layers[activeLayerId].visible;
  refreshInterface();
});
resetButton.addEventListener("click", () => resetLayer(activeLayerId));
centerCameraButton.addEventListener("click", resetCamera);
exportButton.addEventListener("click", exportScreenshot);

inputs.x.addEventListener("input", (event) => updateActiveLayer("x", event.target.value));
inputs.y.addEventListener("input", (event) => updateActiveLayer("y", event.target.value));
inputs.z.addEventListener("input", (event) => updateActiveLayer("z", event.target.value));
inputs.scale.addEventListener("input", (event) => updateActiveLayer("scale", event.target.value));
inputs.rotation.addEventListener("input", (event) => updateActiveLayer("rotation", event.target.value));

// Inicialização: aplica os valores base aos planos e desenha o painel de resumo.
refreshInterface();
