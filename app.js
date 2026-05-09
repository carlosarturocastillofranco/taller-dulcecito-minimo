// =================== DATOS EN MEMORIA Y LOCALSTORAGE ===================
let repuestos = [];
let entradas = [];
let salidas = [];

const STORAGE_KEY = "dulcecito_minimo_v1";

function cargarDatos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      repuestos = data.repuestos || [];
      entradas = data.entradas || [];
      salidas = data.salidas || [];
    } catch (e) {
      console.error("Error al cargar datos:", e);
    }
  } else {
    // Datos de ejemplo iniciales
    repuestos = [
      { codigo: "PAST-FR-001", descripcion: "Pastillas de freno", aplicacion: "Vehículos livianos", categoria: "Frenos", precioCompra: 30000, precioVenta: 55000, stockMin: 2, stock: 4 },
      { codigo: "ACEI-10W40", descripcion: "Aceite 10W40 1L", aplicacion: "Gasolina", categoria: "Lubricantes", precioCompra: 18000, precioVenta: 35000, stockMin: 4, stock: 1 }
    ];
    entradas = [];
    salidas = [];
  }
}

function guardarDatos() {
  const data = { repuestos, entradas, salidas };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =================== NAVEGACIÓN ENTRE VISTAS ===================
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  initNav();
  initFormRepuesto();
  initFormEntrada();
  initFormSalida();
  renderTodo();
});

function initNav() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const view = btn.dataset.view;
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById("view-" + view).classList.add("active");
    });
  });
}

// =================== UTILIDADES ===================
function estadoStock(rep) {
  if (rep.stock <= 0) return "sin-stock";
  if (rep.stock <= rep.stockMin) return "bajo";
  return "ok";
}

// =================== RENDERS ===================
function renderInventario() {
  const tbody = document.querySelector("#tabla-inventario tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  repuestos.forEach(rep => {
    const tr = document.createElement("tr");
    tr.classList.add(estadoStock(rep));
    tr.innerHTML = `
      <td>${rep.codigo}</td>
      <td>${rep.descripcion}</td>
      <td>${rep.stock}</td>
      <td>${rep.stockMin}</td>
      <td>${estadoStock(rep)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderEntradas() {
  const tbody = document.querySelector("#tabla-entradas tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  entradas.forEach(ent => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${ent.fecha}</td>
      <td>${ent.codigo}</td>
      <td>${ent.cantidad}</td>
      <td>${ent.proveedor || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSalidas() {
  const tbody = document.querySelector("#tabla-salidas tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  salidas.forEach(sal => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${sal.fecha}</td>
      <td>${sal.tipo}</td>
      <td>${sal.codigo}</td>
      <td>${sal.cantidad}</td>
      <td>${sal.detalle || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboard() {
  const totalRepuestos = repuestos.length;
  const totalUnidades = repuestos.reduce((sum, r) => sum + (r.stock || 0), 0);
  const stockCritico = repuestos.filter(r => estadoStock(r) !== "ok").length;

  const elRep = document.getElementById("dash-total-repuestos");
  const elUni = document.getElementById("dash-total-unidades");
  const elCri = document.getElementById("dash-stock-critico");

  if (elRep) elRep.textContent = totalRepuestos;
  if (elUni) elUni.textContent = totalUnidades;
  if (elCri) elCri.textContent = stockCritico;
}

function renderTodo() {
  renderInventario();
  renderEntradas();
  renderSalidas();
  renderDashboard();
}

// =================== FORMULARIOS ===================

// REPUESTO
function initFormRepuesto() {
  const form = document.getElementById("form-repuesto");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const codigo = document.getElementById("rep-codigo").value.trim();
    const descripcion = document.getElementById("rep-descripcion").value.trim();
    const aplicacion = document.getElementById("rep-aplicacion").value.trim();
    const categoria = document.getElementById("rep-categoria").value.trim();
    const precioCompra = parseFloat(document.getElementById("rep-precio-compra").value) || 0;
    const precioVenta = parseFloat(document.getElementById("rep-precio-venta").value) || 0;
    const stockMin = parseInt(document.getElementById("rep-stock-min").value) || 0;

    if (!codigo || !descripcion) {
      alert("Código y descripción son obligatorios.");
      return;
    }

    let rep = repuestos.find(r => r.codigo === codigo);
    if (rep) {
      rep.descripcion = descripcion;
      rep.aplicacion = aplicacion;
      rep.categoria = categoria;
      rep.precioCompra = precioCompra;
      rep.precioVenta = precioVenta;
      rep.stockMin = stockMin;
    } else {
      repuestos.push({
        codigo,
        descripcion,
        aplicacion,
        categoria,
        precioCompra,
        precioVenta,
        stockMin,
        stock: 0
      });
    }

    guardarDatos();
    renderTodo();
    form.reset();
  });
}

// ENTRADA
function initFormEntrada() {
  const form = document.getElementById("form-entrada");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const fecha = document.getElementById("ent-fecha").value;
    const codigo = document.getElementById("ent-codigo").value.trim();
    const cantidad = parseInt(document.getElementById("ent-cantidad").value);
    const proveedor = document.getElementById("ent-proveedor").value.trim();

    if (!fecha || !codigo || !cantidad || cantidad <= 0) {
      alert("Revisa fecha, código y cantidad.");
      return;
    }

    let rep = repuestos.find(r => r.codigo === codigo);
    if (!rep) {
      alert("El repuesto no existe en inventario. Regístralo primero en la pestaña Inventario.");
      return;
    }

    rep.stock = (rep.stock || 0) + cantidad;

    entradas.push({ fecha, codigo, cantidad, proveedor });

    guardarDatos();
    renderTodo();
    form.reset();
  });
}

// SALIDA
function initFormSalida() {
  const form = document.getElementById("form-salida");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const fecha = document.getElementById("sal-fecha").value;
    const tipo = document.getElementById("sal-tipo").value;
    const codigo = document.getElementById("sal-codigo").value.trim();
    const cantidad = parseInt(document.getElementById("sal-cantidad").value);
    const detalle = document.getElementById("sal-detalle").value.trim();

    if (!fecha || !tipo || !codigo || !cantidad || cantidad <= 0) {
      alert("Revisa fecha, tipo, código y cantidad.");
      return;
    }

    let rep = repuestos.find(r => r.codigo === codigo);
    if (!rep) {
      alert("El repuesto no existe en inventario.");
      return;
    }

    if ((rep.stock || 0) < cantidad) {
      const continuar = confirm(`No hay suficiente stock (${rep.stock}). ¿Registrar salida de todas formas?`);
      if (!continuar) return;
    }

    rep.stock = (rep.stock || 0) - cantidad;

    salidas.push({ fecha, tipo, codigo, cantidad, detalle });

    guardarDatos();
    renderTodo();
    form.reset();
  });
}