// ---------------------------------------------------------------------------
// Dados de referência (preço sob demanda, lista global, em USD).
// Ajuste estes valores para refletir a região/moeda que você quiser mostrar.
// Fonte de partida: preços públicos de VMs Azure série B (Linux, pay-as-you-go).
// ---------------------------------------------------------------------------

const VM_CATALOG = [
  { id: "b1s",   name: "B1s",   vcpu: 1, ramGb: 1,  usdPerHour: 0.0104 },
  { id: "b1ms",  name: "B1ms",  vcpu: 1, ramGb: 2,  usdPerHour: 0.0207 },
  { id: "b2s",   name: "B2s",   vcpu: 2, ramGb: 4,  usdPerHour: 0.0416 },
  { id: "b2ms",  name: "B2ms",  vcpu: 2, ramGb: 8,  usdPerHour: 0.0832 },
  { id: "b4ms",  name: "B4ms",  vcpu: 4, ramGb: 16, usdPerHour: 0.1660 },
  { id: "d2sv5", name: "D2s v5", vcpu: 2, ramGb: 8, usdPerHour: 0.0960 },
];

const DISK_TIERS = [
  { id: "hdd",      name: "Standard HDD",  usdPerGbMonth: 0.0313 },
  { id: "std-ssd",  name: "Standard SSD",  usdPerGbMonth: 0.0750 },
  { id: "prem-ssd", name: "Premium SSD",   usdPerGbMonth: 0.1350 },
];

const HOURS_PER_MONTH = 730; // média usada pela própria calculadora da Azure

// ---------------------------------------------------------------------------
// Estado + helpers de formatação
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

const formatBRL = (n) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatUSD = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function populateSelect(select, items, labelFn) {
  select.innerHTML = "";
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = labelFn(item);
    select.appendChild(opt);
  });
}

// ---------------------------------------------------------------------------
// Cálculo principal
// ---------------------------------------------------------------------------

function calculate() {
  const vm = VM_CATALOG.find((v) => v.id === $("vm").value);
  const disk = DISK_TIERS.find((d) => d.id === $("disk-tier").value);
  const storageGb = Math.max(0, Number($("storage").value) || 0);
  const qty = Math.max(1, Number($("qty").value) || 1);
  const fx = Math.max(0, Number($("fx").value) || 0);

  const vmMonthlyUsd = vm.usdPerHour * HOURS_PER_MONTH;
  const storageMonthlyUsd = disk.usdPerGbMonth * storageGb;

  const vmSubtotalUsd = vmMonthlyUsd * qty;
  const storageSubtotalUsd = storageMonthlyUsd * qty;
  const totalUsd = vmSubtotalUsd + storageSubtotalUsd;
  const totalBrl = totalUsd * fx;

  // Readouts de specs da VM selecionada
  $("vm-cpu").textContent = vm.vcpu;
  $("vm-ram").textContent = `${vm.ramGb} GB`;

  // Total
  $("total-brl").textContent = formatBRL(totalBrl);
  $("total-usd").textContent = `(US$ ${formatUSD(totalUsd)})`;

  // Breakdown
  $("vm-unit").textContent = `US$ ${formatUSD(vmMonthlyUsd)}`;
  $("vm-qty").textContent = `× ${qty}`;
  $("vm-subtotal").textContent = `US$ ${formatUSD(vmSubtotalUsd)}`;

  $("storage-unit").textContent = `US$ ${formatUSD(storageMonthlyUsd)}`;
  $("storage-qty").textContent = `× ${qty}`;
  $("storage-subtotal").textContent = `US$ ${formatUSD(storageSubtotalUsd)}`;

  return { vm, disk, storageGb, qty, fx, totalUsd, totalBrl };
}

// ---------------------------------------------------------------------------
// Cenários salvos (localStorage) — permite comparar configurações
// ---------------------------------------------------------------------------

const SCENARIOS_KEY = "ccc:scenarios";

function loadScenarios() {
  try {
    return JSON.parse(localStorage.getItem(SCENARIOS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveScenarios(list) {
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(list));
}

function renderScenarios() {
  const list = loadScenarios();
  const container = $("scenario-list");
  container.innerHTML = "";

  list.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "scenario__item";
    row.innerHTML = `
      <span>${s.qty}× ${s.vmName} · ${s.storageGb}GB · R$ ${formatBRL(s.totalBrl)}</span>
      <button data-idx="${idx}">remover</button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("button[data-idx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const list = loadScenarios();
      list.splice(Number(btn.dataset.idx), 1);
      saveScenarios(list);
      renderScenarios();
    });
  });
}

function saveCurrentScenario() {
  const { vm, storageGb, qty, totalBrl } = calculate();
  const list = loadScenarios();
  list.push({ vmName: vm.name, storageGb, qty, totalBrl });
  saveScenarios(list);
  renderScenarios();
}

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

function init() {
  populateSelect($("vm"), VM_CATALOG, (v) => `${v.name} — ${v.vcpu} vCPU / ${v.ramGb} GB`);
  populateSelect($("disk-tier"), DISK_TIERS, (d) => d.name);
  $("vm").value = "b2s";

  ["vm", "storage", "disk-tier", "qty", "fx"].forEach((id) => {
    $(id).addEventListener("input", calculate);
    $(id).addEventListener("change", calculate);
  });

  $("save-scenario").addEventListener("click", saveCurrentScenario);

  calculate();
  renderScenarios();
}

document.addEventListener("DOMContentLoaded", init);
