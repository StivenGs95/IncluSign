/* IncluSign - prototipo funcional (solo navegador).
 * No usa servidor ni base de datos: las cuentas, el avance, las favoritas y los
 * resultados de práctica se guardan en el almacenamiento local de este navegador.
 */
"use strict";

/* =========================================================
 * Utilidades
 * ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const params = new URLSearchParams(location.search);
const pct = (a, b) => (b > 0 ? Math.round((a * 100) / b) : 0);
const normalizar = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const barajar = (arr) => {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (iso) => {
	const d = new Date(iso);
	return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
};
const iniciales = (nombre) => String(nombre).trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "IS";

/* =========================================================
 * Contenido
 * ========================================================= */
const LECCIONES = CURSOS.flatMap((c) => c.lecciones.map((l) => ({ ...l, curso: c })));
const sena = (id) => SENAS.find((s) => s.id === id);
const categoria = (id) => CATEGORIAS.find((c) => c.id === id);
const leccion = (id) => LECCIONES.find((l) => l.id === Number(id));
const thumb = (s) => `https://i.ytimg.com/vi/${s.video}/maxresdefault.jpg`;
const leccionesDeSena = (id) => LECCIONES.filter((l) => l.senas.includes(id));

/* =========================================================
 * Almacenamiento local (simula la base de datos)
 * ========================================================= */
const Store = {
	get(key, fallback) {
		try {
			const v = localStorage.getItem("inclusign." + key);
			return v === null ? fallback : JSON.parse(v);
		} catch {
			return fallback;
		}
	},
	set(key, value) {
		try {
			localStorage.setItem("inclusign." + key, JSON.stringify(value));
		} catch {
			/* Sin almacenamiento disponible el prototipo sigue funcionando en memoria. */
		}
	},
	del(key) {
		try {
			localStorage.removeItem("inclusign." + key);
		} catch {
			/* ignorar */
		}
	},
};

const DEMO = { nombre: "Laura Martínez", correo: "estudiante@inclusign.co", clave: "Estudiante2026*" };

function sembrarDemo() {
	if (Store.get("usuarios", null)) return;
	const dias = (n) => new Date(Date.now() - n * 864e5).toISOString();
	Store.set("usuarios", [{ ...DEMO, creado: dias(20) }]);
	Store.set("datos." + DEMO.correo, {
		progreso: [{ id: 1, fecha: dias(3) }],
		favoritas: ["hola", "gracias", "feliz"],
		intentos: [
			{ alcance: "Saludos y cortesía", aciertos: 4, total: 5, fecha: dias(3) },
			{ alcance: "Todas las señas", aciertos: 7, total: 10, fecha: dias(1) },
		],
	});
}

const Auth = {
	usuarios: () => Store.get("usuarios", []),
	actual() {
		const correo = Store.get("sesion", null);
		return correo ? this.usuarios().find((u) => u.correo === correo) ?? null : null;
	},
	entrar(correo, clave) {
		const u = this.usuarios().find((x) => x.correo === normalizar(correo) && x.clave === clave);
		if (u) Store.set("sesion", u.correo);
		return u ?? null;
	},
	registrar(nombre, correo, clave) {
		const usuarios = this.usuarios();
		usuarios.push({ nombre, correo, clave, creado: new Date().toISOString() });
		Store.set("usuarios", usuarios);
		Store.set("sesion", correo);
	},
	actualizar(cambios) {
		const u = this.actual();
		Store.set("usuarios", this.usuarios().map((x) => (x.correo === u.correo ? { ...x, ...cambios } : x)));
	},
	salir: () => Store.del("sesion"),
};

const Datos = {
	leer() {
		const u = Auth.actual();
		return u ? Store.get("datos." + u.correo, { progreso: [], favoritas: [], intentos: [] }) : { progreso: [], favoritas: [], intentos: [] };
	},
	guardar(d) {
		const u = Auth.actual();
		if (u) Store.set("datos." + u.correo, d);
	},
	completadas() {
		return this.leer().progreso.map((p) => p.id);
	},
	completar(id, valor) {
		const d = this.leer();
		d.progreso = d.progreso.filter((p) => p.id !== id);
		if (valor) d.progreso.push({ id, fecha: new Date().toISOString() });
		this.guardar(d);
	},
	esFavorita(id) {
		return this.leer().favoritas.includes(id);
	},
	alternarFavorita(id) {
		const d = this.leer();
		d.favoritas = d.favoritas.includes(id) ? d.favoritas.filter((x) => x !== id) : [...d.favoritas, id];
		this.guardar(d);
		return d.favoritas.includes(id);
	},
	registrarIntento(alcance, aciertos, total) {
		const d = this.leer();
		d.intentos.push({ alcance, aciertos, total, fecha: new Date().toISOString() });
		this.guardar(d);
	},
	estadisticas() {
		const d = this.leer();
		const hechas = d.progreso.map((p) => p.id);
		const lecc = LECCIONES.filter((l) => hechas.includes(l.id));
		const senas = new Set(lecc.flatMap((l) => l.senas));
		const aciertos = d.intentos.reduce((a, i) => a + i.aciertos, 0);
		const total = d.intentos.reduce((a, i) => a + i.total, 0);
		return {
			completadas: hechas.length,
			total: LECCIONES.length,
			porcentaje: pct(hechas.length, LECCIONES.length),
			senas: senas.size,
			minutos: lecc.reduce((a, l) => a + l.minutos, 0),
			intentos: d.intentos.length,
			precision: pct(aciertos, total),
			favoritas: d.favoritas.length,
		};
	},
	siguiente() {
		const hechas = this.completadas();
		return LECCIONES.find((l) => !hechas.includes(l.id)) ?? null;
	},
	cursos() {
		const hechas = this.completadas();
		return CURSOS.map((c) => {
			const n = c.lecciones.filter((l) => hechas.includes(l.id)).length;
			return { ...c, hechas: n, porcentaje: pct(n, c.lecciones.length), minutos: c.lecciones.reduce((a, l) => a + l.minutos, 0) };
		});
	},
};

/* Mensajes que sobreviven a un cambio de página. */
const Flash = {
	set(tipo, texto) {
		try {
			sessionStorage.setItem("inclusign.flash", JSON.stringify({ tipo, texto }));
		} catch {
			/* ignorar */
		}
	},
	html() {
		try {
			const f = JSON.parse(sessionStorage.getItem("inclusign.flash") || "null");
			sessionStorage.removeItem("inclusign.flash");
			return f ? alerta(f.tipo, f.texto) : "";
		} catch {
			return "";
		}
	},
};
const alerta = (tipo, texto) => `<div class="alert alert-${tipo} alert-soft alert-dismissible fade show" role="alert">${esc(texto)}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button></div>`;

/* =========================================================
 * Componentes visuales
 * ========================================================= */
const ICONOS = {
	inicio: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
	catalogo: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8m-8 4h6"/>',
	diccionario: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
	practica: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
	perfil: '<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2z"/>',
	login: '<path d="M14 7l5 5-5 5m5-5H7m3 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
	logout: '<path d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
};
const icono = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] ?? ""}</svg>`;

/** Video de una seña. */
function videoSena(s, { autoplay = false } = {}) {
	const extra = autoplay ? `&autoplay=1&mute=1&loop=1&playlist=${s.video}` : "";
	return `<div class="sign-video ratio ratio-16x9"><iframe src="https://www.youtube-nocookie.com/embed/${s.video}?rel=0&modestbranding=1&playsinline=1${extra}" title="Seña de ${esc(s.palabra)} en Lengua de Señas Colombiana" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
}
const creditoVideo = (s) => `<p class="video-credit">Video: Instituto Nacional para Sordos (INSOR) · <a href="${INSOR_PAGINA}${s.insor}/" target="_blank" rel="noopener">#UnaSeñaParaTi</a></p>`;

function tarjetaSena(s, logueado) {
	const cat = categoria(s.categoria);
	const fav = logueado && Datos.esFavorita(s.id);
	return `<article class="sign-card">
		<a class="sign-card-link" href="signDetails.html?id=${s.id}">
			<span class="sign-thumb"><img src="${thumb(s)}" alt="" loading="lazy"><span class="sign-thumb-play" aria-hidden="true">▶</span></span>
			<span class="sign-card-body"><strong>${esc(s.palabra)}</strong><small>${cat.icono} ${esc(cat.nombre)}</small></span>
		</a>
		${logueado ? `<button class="sign-fav${fav ? " is-fav" : ""}" type="button" data-fav="${s.id}" aria-pressed="${fav}" aria-label="${fav ? "Quitar de" : "Agregar a"} favoritas: ${esc(s.palabra)}" title="${fav ? "Quitar de favoritas" : "Agregar a favoritas"}">${fav ? "★" : "☆"}</button>` : ""}
	</article>`;
}

function statCard(ic, etiqueta, valor) {
	return `<div class="col-6 col-xl-3"><article class="stat-card h-100"><span class="stat-icon" aria-hidden="true">${ic}</span><div><p class="small text-muted-custom mb-1">${etiqueta}</p><p class="h5 fw-bold mb-0">${valor}</p></div></article></div>`;
}

const barra = (p, etiqueta) => `<div class="progress" role="progressbar" aria-label="${esc(etiqueta)}" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:${p}%"></div></div>`;

/* =========================================================
 * Estructura de página
 * ========================================================= */
function navItems(u) {
	if (!u) return [["catalogo", "catalog.html", "Lecciones"], ["diccionario", "dictionary.html", "Diccionario"], ["login", "login.html", "Ingresar"]];
	return [["inicio", "main.html", "Mi aprendizaje"], ["catalogo", "catalog.html", "Lecciones"], ["diccionario", "dictionary.html", "Diccionario"], ["practica", "practice.html", "Práctica"], ["perfil", "profile.html", "Mi perfil"]];
}

function montarLayout(activo) {
	const u = Auth.actual();
	const home = u ? "main.html" : "login.html";
	document.body.innerHTML = `
	<a class="skip-link" href="#contenido">Saltar al contenido</a>
	<div class="container app-shell py-3 py-lg-4"><div class="workspace-layout">
		<aside class="app-sidebar" aria-label="Navegación principal">
			<div class="sidebar-header">
				<a class="sidebar-brand" href="${home}" aria-label="IncluSign, inicio"><img class="sidebar-logo-full" src="../assets/img/logo.png" alt="IncluSign"><img class="sidebar-logo-compact" src="../assets/img/logo-img.png" alt=""></a>
				<button class="sidebar-toggle" type="button" data-sidebar-toggle aria-label="Compactar navegación" aria-expanded="true" aria-controls="primaryNavigation" title="Compactar navegación"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 18-6-6 6-6"/></svg><span class="visually-hidden">Compactar navegación</span></button>
			</div>
			<p class="sidebar-section-label">${u ? "TU ESPACIO" : "EXPLORA"}</p>
			<nav class="app-nav" id="primaryNavigation" aria-label="Secciones">
				${navItems(u).map(([k, href, label]) => `<a class="app-nav-link${k === activo ? " active" : ""}" href="${href}"${k === activo ? ' aria-current="page"' : ""} title="${label}">${icono(k)}<span>${label}</span></a>`).join("")}
			</nav>
			<div class="sidebar-footer">
				<div class="sidebar-tip"><span aria-hidden="true">✦</span><p class="mb-0">Cada seña te acerca a una nueva conversación.</p></div>
				${u ? `<a class="sidebar-profile text-decoration-none" href="profile.html"><span class="nav-avatar" aria-hidden="true">${esc(iniciales(u.nombre))}</span><span><strong>${esc(u.nombre)}</strong><small>Estudiante</small></span></a>
				<a class="sidebar-logout" href="login.html" data-logout>${icono("logout")}<span>Cerrar sesión</span></a>` : `<a class="btn btn-brand btn-sm w-100" href="register.html">Crear cuenta gratis</a>`}
			</div>
		</aside>
		<div class="workspace-main">
			<header class="mobile-topbar"><a class="brand-lockup" href="${home}" aria-label="IncluSign, inicio"><img class="brand-logo" src="../assets/img/logo.png" alt="Logo de IncluSign"></a>
				${u ? `<a class="mobile-exit" href="login.html" data-logout aria-label="Cerrar sesión">${icono("logout")}</a>` : ""}</header>
			<main id="contenido">${Flash.html()}<div id="vista"></div></main>
			<footer class="app-footer">IncluSign · Prototipo funcional · Corporación Universitaria Iberoamericana · Videos de señas: Instituto Nacional para Sordos (INSOR), serie #UnaSeñaParaTi. Herramienta de apoyo; no reemplaza la enseñanza formal de la LSC.</footer>
		</div>
	</div></div>`;
	iniciarSidebar();
	return $("#vista");
}

function montarAcceso(contenido) {
	document.body.className = "login-wrap d-flex align-items-center justify-content-center p-3";
	document.body.innerHTML = `<main class="login-panel">
		<section class="login-visual" aria-label="Aprender lengua de señas">
			<img class="login-visual-image" src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=85" alt="">
			<div class="login-visual-overlay"></div>
			<div class="login-visual-content">
				<img class="login-logo" src="../assets/img/logo.png" alt="IncluSign">
				<p class="login-visual-kicker">Aprender también es conectar</p>
				<h2>Una seña puede abrir una conversación.</h2>
				<p>Descubre la Lengua de Señas Colombiana, practica a tu ritmo y construye una comunicación más inclusiva.</p>
				<div class="login-visual-tag"><span aria-hidden="true">✦</span> Un aprendizaje para todas las personas</div>
			</div>
		</section>
		<section class="login-form-panel">${Flash.html()}${contenido}</section>
	</main>`;
}

function iniciarSidebar() {
	const layout = $(".workspace-layout");
	const toggle = $("[data-sidebar-toggle]");
	if (!layout || !toggle) return;
	const desktop = window.matchMedia("(min-width: 992px)");
	const set = (c, persist = true) => {
		layout.classList.toggle("sidebar-collapsed", c);
		const label = c ? "Expandir navegación" : "Compactar navegación";
		toggle.setAttribute("aria-label", label);
		toggle.setAttribute("title", label);
		toggle.setAttribute("aria-expanded", String(!c));
		$(".visually-hidden", toggle).textContent = label;
		if (persist && desktop.matches) Store.set("sidebar", c);
	};
	set(desktop.matches && Store.get("sidebar", false) === true, false);
	toggle.addEventListener("click", () => set(!layout.classList.contains("sidebar-collapsed")));
}

/* =========================================================
 * Páginas
 * ========================================================= */
const Paginas = {};

/* ---------- Inicio de sesión ---------- */
Paginas.login = () => {
	if (Auth.actual()) return location.replace("main.html");
	montarAcceso(`
		<header class="mb-4"><p class="eyebrow mb-2">Qué bueno tenerte aquí</p><h1 class="h2 fw-bold mb-2">Inicia sesión</h1><p class="text-muted-custom mb-0">Continúa desde donde dejaste tu aprendizaje.</p></header>
		<div data-error></div>
		<form novalidate>
			<div class="mb-3"><label for="correo" class="form-label">Correo electrónico</label><input class="form-control" id="correo" type="email" placeholder="tu@correo.com" autocomplete="username" required><div class="invalid-feedback">Escribe un correo válido.</div></div>
			<div class="mb-3"><label for="clave" class="form-label">Contraseña</label><input class="form-control" id="clave" type="password" placeholder="Ingresa tu contraseña" autocomplete="current-password" required><div class="invalid-feedback">Escribe tu contraseña.</div></div>
			<div class="d-grid mt-4"><button class="btn btn-brand" type="submit">Ingresar a mi espacio <span aria-hidden="true">→</span></button></div>
		</form>
		<p class="text-center mt-4 mb-1">¿Aún no tienes cuenta? <a class="fw-semibold text-decoration-none" href="register.html">Regístrate gratis</a></p>
		<p class="text-center small mb-0"><a class="text-decoration-none" href="dictionary.html">Consultar el diccionario sin iniciar sesión</a></p>
		<p class="demo-hint mt-4 mb-0"><strong>Cuenta de prueba:</strong> ${DEMO.correo} · ${DEMO.clave}</p>`);
	const form = $("form");
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		if (!form.checkValidity()) return form.classList.add("was-validated");
		const u = Auth.entrar($("#correo").value, $("#clave").value);
		if (!u) {
			$("[data-error]").innerHTML = alerta("danger", "El correo o la contraseña no son correctos.");
			return $("#clave").focus();
		}
		Flash.set("success", `¡Hola de nuevo, ${u.nombre.split(" ")[0]}!`);
		const destino = sessionStorage.getItem("inclusign.destino");
		sessionStorage.removeItem("inclusign.destino");
		location.href = destino && /^[A-Za-z]+\.html(\?[\w=&%-]*)?$/.test(destino) ? destino : "main.html";
	});
};

/* ---------- Registro ---------- */
Paginas.registro = () => {
	if (Auth.actual()) return location.replace("main.html");
	montarAcceso(`
		<header class="mb-4"><p class="eyebrow mb-2">Empieza hoy</p><h1 class="h2 fw-bold mb-2">Crea tu cuenta</h1><p class="text-muted-custom mb-0">Guarda tu avance, tus señas favoritas y tus resultados de práctica.</p></header>
		<form novalidate>
			<div class="mb-3"><label for="nombre" class="form-label">Nombre completo</label><input class="form-control" id="nombre" autocomplete="name" required><div class="invalid-feedback" data-msg="nombre">Escribe tu nombre (mínimo 3 caracteres).</div></div>
			<div class="mb-3"><label for="correo" class="form-label">Correo electrónico</label><input class="form-control" id="correo" type="email" autocomplete="email" required><div class="invalid-feedback" data-msg="correo">Escribe un correo válido.</div></div>
			<div class="row g-3">
				<div class="col-sm-6"><label for="clave" class="form-label">Contraseña</label><input class="form-control" id="clave" type="password" autocomplete="new-password" required aria-describedby="ayudaClave"><div class="invalid-feedback" data-msg="clave">Mínimo 8 caracteres, con letras y números.</div></div>
				<div class="col-sm-6"><label for="clave2" class="form-label">Confirmar</label><input class="form-control" id="clave2" type="password" autocomplete="new-password" required><div class="invalid-feedback" data-msg="clave2">Las contraseñas no coinciden.</div></div>
			</div>
			<p id="ayudaClave" class="form-hint mt-2 mb-0">Usa al menos 8 caracteres, combinando letras y números.</p>
			<div class="d-grid mt-4"><button class="btn btn-brand" type="submit">Crear mi cuenta <span aria-hidden="true">→</span></button></div>
		</form>
		<p class="text-center mt-4 mb-0">¿Ya tienes cuenta? <a class="fw-semibold text-decoration-none" href="login.html">Inicia sesión</a></p>`);
	const form = $("form");
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const nombre = $("#nombre").value.trim();
		const correo = normalizar($("#correo").value);
		const clave = $("#clave").value;
		const errores = {};
		if (nombre.length < 3 || nombre.length > 80) errores.nombre = "Escribe tu nombre (entre 3 y 80 caracteres).";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errores.correo = "Escribe un correo electrónico válido.";
		else if (Auth.usuarios().some((u) => u.correo === correo)) errores.correo = "Ya existe una cuenta con este correo.";
		if (clave.length < 8 || !/[A-Za-z]/.test(clave) || !/\d/.test(clave)) errores.clave = "La contraseña debe tener al menos 8 caracteres, con letras y números.";
		if (clave !== $("#clave2").value) errores.clave2 = "Las contraseñas no coinciden.";
		["nombre", "correo", "clave", "clave2"].forEach((k) => {
			$("#" + k).classList.toggle("is-invalid", !!errores[k]);
			if (errores[k]) $(`[data-msg="${k}"]`).textContent = errores[k];
		});
		if (Object.keys(errores).length) return $(".is-invalid").focus();
		Auth.registrar(nombre, correo, clave);
		Flash.set("success", "¡Te damos la bienvenida a IncluSign! Tu cuenta fue creada.");
		location.href = "main.html";
	});
};

/* ---------- Mi aprendizaje ---------- */
Paginas.inicio = () => {
	const u = Auth.actual();
	const v = montarLayout("inicio");
	const st = Datos.estadisticas();
	const sig = Datos.siguiente();
	const recientes = [...Datos.leer().intentos].reverse().slice(0, 3);
	v.innerHTML = `
	<section class="mb-4" aria-labelledby="titulo">
		<p class="eyebrow mb-1">Tu espacio de aprendizaje</p>
		<h1 id="titulo" class="section-heading mb-1">Hola, ${esc(u.nombre.split(" ")[0])}. Un paso más en tu camino</h1>
		<p class="text-muted-custom mb-3">Continúa tu ruta, consulta una seña o pon a prueba lo que sabes.</p>
		${sig ? `<article class="learning-slide learning-slide-current">
			<div class="slide-copy">
				<span class="slide-status"><span aria-hidden="true">●</span> ${st.completadas ? "Tu siguiente lección" : "Empieza aquí"} · ${sig.minutos} min</span>
				<h2>${esc(sig.titulo)}</h2>
				<p>${esc(sig.resumen)} <span class="d-block mt-1 small">Curso: ${esc(sig.curso.titulo)}${sig.senas.length ? ` · ${sig.senas.length} señas en video` : ""}</span></p>
				<div class="slide-progress-label"><span>Avance de tu ruta</span><strong>${st.porcentaje}%</strong></div>
				<div class="progress slide-progress" aria-hidden="true"><div class="progress-bar" style="width:${st.porcentaje}%"></div></div>
				<a class="btn btn-light slide-action" href="serviceDetails.html?id=${sig.id}">Continuar lección <span aria-hidden="true">→</span></a>
			</div>
			<div class="slide-visual">${sig.senas.length ? `<img src="https://i.ytimg.com/vi/${sena(sig.senas[0]).video}/maxresdefault.jpg" alt="Vista previa del video de la seña ${esc(sena(sig.senas[0]).palabra)}">` : `<img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000&q=85" alt="Estudiantes aprendiendo juntos">`}<span class="visual-badge">Aprende con video</span></div>
		</article>` : `<article class="surface-card p-4 text-center"><p class="display-6 mb-2" aria-hidden="true">🎉</p><h2 class="h4 fw-bold">¡Completaste todas las lecciones!</h2><p class="text-muted-custom">Sigue practicando para mantener lo aprendido.</p><a class="btn btn-brand" href="practice.html">Ir a practicar</a></article>`}
	</section>
	<section class="row g-3 mb-4" aria-label="Resumen de progreso">
		${statCard("✓", "Lecciones", `${st.completadas} de ${st.total}`)}
		${statCard("🤟", "Señas aprendidas", st.senas)}
		${statCard("◷", "Tiempo de estudio", `${st.minutos} min`)}
		${statCard("◎", "Precisión en práctica", st.intentos ? st.precision + "%" : "Sin intentos")}
	</section>
	<div class="row g-4">
		<section class="col-12 col-lg-7"><div class="surface-card p-3 p-md-4 h-100">
			<div class="d-flex justify-content-between align-items-center gap-2 mb-3"><h2 class="h5 fw-bold mb-0">Tu ruta de cursos</h2><a class="small text-decoration-none fw-semibold" href="catalog.html">Ver catálogo →</a></div>
			${Datos.cursos().map((c) => `<div class="course-row"><div class="d-flex justify-content-between gap-3 mb-1"><span class="fw-semibold">${c.icono} ${esc(c.titulo)}</span><span class="small text-muted-custom">${c.hechas}/${c.lecciones.length}</span></div>${barra(c.porcentaje, "Avance en " + c.titulo)}</div>`).join("")}
		</div></section>
		<div class="col-12 col-lg-5 d-grid gap-4">
			<section class="surface-card p-3 p-md-4">
				<h2 class="h5 fw-bold mb-1">Consulta rápida</h2>
				<p class="small text-muted-custom">¿Necesitas una seña ahora? Búscala en el diccionario.</p>
				<form action="dictionary.html" method="get" role="search" class="d-flex gap-2"><label class="visually-hidden" for="q">Buscar una seña</label><input class="form-control" id="q" name="q" placeholder="Ej.: gracias, feliz, ayuda…"><button class="btn btn-brand" type="submit">Buscar</button></form>
				<div class="chip-row mt-3">${CATEGORIAS.map((c) => `<a class="chip" href="dictionary.html?categoria=${c.id}">${c.icono} ${esc(c.nombre)}</a>`).join("")}</div>
			</section>
			<section class="surface-card p-3 p-md-4">
				<div class="d-flex justify-content-between align-items-center mb-2"><h2 class="h5 fw-bold mb-0">Práctica reciente</h2><a class="small text-decoration-none fw-semibold" href="practice.html">Practicar →</a></div>
				${recientes.length ? recientes.map((r) => `<div class="vocab-item"><span><strong>${esc(r.alcance)}</strong><br><span class="small text-muted-custom">${fechaCorta(r.fecha)}</span></span><span class="level-pill">${r.aciertos}/${r.total}</span></div>`).join("") : `<p class="small text-muted-custom mb-0">Aún no has practicado. Un cuestionario corto te ayuda a recordar las señas.</p>`}
			</section>
		</div>
	</div>`;
};

/* ---------- Catálogo ---------- */
Paginas.catalogo = () => {
	const u = Auth.actual();
	const v = montarLayout("catalogo");
	const hechas = Datos.completadas();
	const clases = ["", "catalog-icon-lilac", "catalog-icon-sky"];
	v.innerHTML = `
	<header class="catalog-heading mb-4">
		<div><p class="eyebrow mb-2">Aprende a tu ritmo</p><h1 class="display-6 fw-bold mb-2">Catálogo de lecciones</h1><p class="text-muted-custom mb-0">Explora los cursos y abre cualquier lección para ver sus señas en video.</p></div>
		${u ? `<a class="btn btn-outline-brand flex-shrink-0" href="main.html">Volver a mi aprendizaje</a>` : `<a class="btn btn-brand flex-shrink-0" href="register.html">Crear cuenta para guardar tu avance</a>`}
	</header>
	<section class="catalog-list" aria-label="Cursos disponibles">
		${Datos.cursos().map((c, i) => `<details class="catalog-course"${i === 0 ? " open" : ""}>
			<summary class="catalog-course-summary">
				<span class="catalog-course-icon ${clases[i % 3]}" aria-hidden="true">${c.icono}</span>
				<span class="catalog-course-title"><strong>${esc(c.titulo)}</strong><small>${c.nivel} · ${c.lecciones.length} ${c.lecciones.length === 1 ? "lección" : "lecciones"} · ${c.minutos} minutos${u ? ` · ${c.porcentaje}% completado` : ""}</small></span>
				<span class="level-pill">${esc(c.etiqueta)}</span>
			</summary>
			<div class="catalog-course-content"><p>${esc(c.descripcion)}</p>
				<ol class="catalog-lesson-list">${c.lecciones.map((l) => `<li><a href="serviceDetails.html?id=${l.id}" class="lesson-link">${hechas.includes(l.id) ? '<span class="lesson-check" aria-label="Completada">✓</span>' : ""}${esc(l.titulo)}</a><span>${l.senas.length ? `${l.senas.length} videos · ` : "Lectura · "}${l.minutos} min</span></li>`).join("")}</ol>
			</div>
		</details>`).join("")}
	</section>`;
};

/* ---------- Lección ---------- */
Paginas.leccion = () => {
	const l = leccion(params.get("id"));
	if (!l) {
		Flash.set("warning", "La lección que buscas no existe.");
		return location.replace("catalog.html");
	}
	const u = Auth.actual();
	const v = montarLayout("catalogo");
	const senas = l.senas.map(sena);

	const pintar = () => {
		const hecha = Datos.completadas().includes(l.id);
		const delCurso = l.curso.lecciones.filter((x) => Datos.completadas().includes(x.id)).length;
		const pc = pct(delCurso, l.curso.lecciones.length);
		const idx = LECCIONES.findIndex((x) => x.id === l.id);
		const sig = LECCIONES[idx + 1];
		$("[data-avance]").innerHTML = u ? `
			<div class="d-flex justify-content-between align-items-center mb-2"><h2 class="h5 fw-bold mb-0">Avance del curso</h2><span class="small fw-semibold text-brand">${pc}%</span></div>
			<div class="mb-3">${barra(pc, "Avance del curso")}</div>
			<p class="small text-muted-custom">${delCurso} de ${l.curso.lecciones.length} lecciones de «${esc(l.curso.titulo)}».</p>
			<div class="d-grid gap-2">${hecha ? `<p class="status-message small mb-1">✓ Lección completada</p>${sig ? `<a class="btn btn-brand" href="serviceDetails.html?id=${sig.id}">Siguiente: ${esc(sig.titulo)} →</a>` : ""}<button class="btn btn-outline-brand btn-sm" type="button" data-completar="0">Marcar como pendiente</button>` : `<button class="btn btn-brand" type="button" data-completar="1">Marcar como completada</button>`}</div>` : `
			<h2 class="h5 fw-bold mb-2">Guarda tu avance</h2><p class="small text-muted-custom">Crea una cuenta gratuita para registrar las lecciones que completas y practicar.</p>
			<a class="btn btn-brand w-100 mb-2" href="register.html">Crear cuenta</a><a class="btn btn-outline-brand w-100" href="login.html">Ya tengo cuenta</a>`;
		$("[data-check]").hidden = !hecha;
	};

	v.innerHTML = `
	<nav aria-label="Ruta de navegación" class="small mb-3"><a class="text-decoration-none" href="catalog.html">Catálogo</a><span class="mx-2 text-muted-custom" aria-hidden="true">/</span><span>${esc(l.curso.titulo)}</span><span class="mx-2 text-muted-custom" aria-hidden="true">/</span><span aria-current="page">${esc(l.titulo)}</span></nav>
	<header class="mb-4">
		<span class="level-pill mb-3">${l.curso.nivel} · Lección ${l.curso.lecciones.indexOf(l.curso.lecciones.find((x) => x.id === l.id)) + 1} de ${l.curso.lecciones.length} · ${l.minutos} min</span>
		<h1 class="display-6 fw-bold mb-2">${esc(l.titulo)} <span class="lesson-check lesson-check-lg" data-check title="Completada" hidden>✓</span></h1>
		<p class="text-muted-custom mb-0">${esc(l.resumen)}</p>
	</header>
	<div class="row g-4">
		<div class="col-12 col-lg-8">
			${senas.length ? `<section class="surface-card p-3 p-md-4" aria-labelledby="senasTitulo" data-visor>
				<div class="d-flex justify-content-between align-items-center gap-2 mb-3"><h2 id="senasTitulo" class="h5 fw-bold mb-0">Señas de la lección</h2><span class="small text-muted-custom" data-contador aria-live="polite"></span></div>
				<div data-paso></div>
				<div class="sign-stepper">
					<button class="carousel-nav-btn" type="button" data-prev aria-label="Seña anterior">←</button>
					<div class="sign-dots" role="tablist" aria-label="Elegir seña">${senas.map((s, i) => `<button type="button" role="tab" data-dot="${i}" aria-label="${esc(s.palabra)}"></button>`).join("")}</div>
					<button class="carousel-nav-btn" type="button" data-next aria-label="Siguiente seña">→</button>
				</div>
			</section>` : ""}
			<section class="surface-card p-3 p-md-4${senas.length ? " mt-4" : ""}">
				<h2 class="h5 fw-bold mb-2">En esta lección</h2>
				<p class="text-muted-custom">${esc(l.contenido)}</p>
				<ul class="mb-0 ps-3">${l.objetivos.map((o) => `<li class="mb-2">${esc(o)}</li>`).join("")}</ul>
			</section>
		</div>
		<aside class="col-12 col-lg-4">
			<section class="surface-card p-3 p-md-4 mb-4" data-avance></section>
			${senas.length ? `<section class="surface-card p-3 p-md-4"><h2 class="h5 fw-bold mb-1">Pon a prueba lo aprendido</h2><p class="small text-muted-custom mb-3">Responde un cuestionario corto con las ${senas.length} señas de esta lección.</p><a class="btn btn-outline-brand w-100" href="practice.html?tipo=leccion&id=${l.id}">Practicar esta lección</a></section>` : ""}
		</aside>
	</div>`;

	if (senas.length) {
		let actual = 0;
		const mostrar = (i) => {
			actual = (i + senas.length) % senas.length;
			const s = senas[actual];
			$("[data-paso]").innerHTML = `<div class="row g-3 align-items-center">
				<div class="col-md-7">${videoSena(s)}${creditoVideo(s)}</div>
				<div class="col-md-5"><p class="eyebrow mb-1">${categoria(s.categoria).icono} ${esc(categoria(s.categoria).nombre)}</p><h3 class="display-6 fw-bold mb-2">${esc(s.palabra)}</h3><p class="text-muted-custom">${esc(s.significado)}</p>
				<p class="small mb-2"><strong>Cómo practicar:</strong> reproduce el video, observa la forma de las manos, el movimiento y la expresión del rostro, y repite la seña frente a un espejo.</p>
				<a class="small text-decoration-none" href="signDetails.html?id=${s.id}">Ver ficha de la seña →</a></div></div>`;
			$$("[data-dot]").forEach((d, j) => {
				d.classList.toggle("active", j === actual);
				d.setAttribute("aria-selected", String(j === actual));
			});
			$("[data-contador]").textContent = `Seña ${actual + 1} de ${senas.length}`;
		};
		$("[data-prev]").addEventListener("click", () => mostrar(actual - 1));
		$("[data-next]").addEventListener("click", () => mostrar(actual + 1));
		$$("[data-dot]").forEach((d) => d.addEventListener("click", () => mostrar(Number(d.dataset.dot))));
		$("[data-visor]").addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight") mostrar(actual + 1);
			if (e.key === "ArrowLeft") mostrar(actual - 1);
		});
		mostrar(0);
	}

	v.addEventListener("click", (e) => {
		const b = e.target.closest("[data-completar]");
		if (!b) return;
		const valor = b.dataset.completar === "1";
		Datos.completar(l.id, valor);
		pintar();
		$("[data-avance]").insertAdjacentHTML("afterbegin", alerta(valor ? "success" : "info", valor ? `¡Buen trabajo! Completaste «${l.titulo}».` : "La lección quedó pendiente para que puedas repasarla."));
	});
	pintar();
};

/* ---------- Diccionario ---------- */
Paginas.diccionario = () => {
	const u = Auth.actual();
	const v = montarLayout("diccionario");
	const estado = { q: params.get("q") ?? "", cat: params.get("categoria") ?? "", fav: u && params.get("favoritas") === "1" };

	v.innerHTML = `
	<header class="mb-4"><p class="eyebrow mb-2">Búsqueda y consulta</p><h1 class="display-6 fw-bold mb-2">Diccionario de LSC</h1><p class="text-muted-custom mb-0">${SENAS.length} palabras y expresiones con video. Busca una palabra para ver cómo se realiza su seña.</p></header>
	<form class="dictionary-search surface-card p-3 mb-3" role="search"><label class="visually-hidden" for="q">Buscar una palabra</label><span class="search-icon" aria-hidden="true">${icono("diccionario")}</span><input class="form-control" type="search" id="q" placeholder="Escribe una palabra: hola, gracias, feliz…" autocomplete="off"><button class="btn btn-brand" type="submit">Buscar</button></form>
	<div class="chip-row mb-4" aria-label="Filtrar por categoría" data-chips></div>
	<p class="small text-muted-custom mb-3" aria-live="polite" data-resumen></p>
	<div data-vacio hidden class="surface-card p-4 text-center"><p class="display-6 mb-2" aria-hidden="true">🔎</p><h2 class="h5 fw-bold">No encontramos esa palabra</h2><p class="text-muted-custom mb-3">Revisa la ortografía o prueba con otra palabra. También puedes consultar el diccionario oficial del INSOR.</p><a class="btn btn-outline-brand" href="https://educativo.insor.gov.co/diccionario/" target="_blank" rel="noopener">Abrir diccionario INSOR ↗</a></div>
	<section class="sign-grid" aria-label="Resultados" data-grid></section>`;
	$("#q").value = estado.q;

	const pintar = () => {
		const favs = u ? Datos.leer().favoritas : [];
		const q = normalizar(estado.q);
		const lista = SENAS.filter((s) => (!estado.cat || s.categoria === estado.cat) && (!estado.fav || favs.includes(s.id)) && (!q || normalizar(s.palabra).includes(q) || normalizar(s.significado).includes(q)))
			.sort((a, b) => (normalizar(b.palabra).startsWith(q) - normalizar(a.palabra).startsWith(q)) || a.palabra.localeCompare(b.palabra, "es"));
		const chip = (activo, attrs, texto) => `<button type="button" class="chip${activo ? " active" : ""}" ${attrs} aria-pressed="${activo}">${texto}</button>`;
		$("[data-chips]").innerHTML = chip(!estado.cat && !estado.fav, 'data-cat=""', "Todas")
			+ (u ? chip(estado.fav, "data-favs", `★ Mis favoritas (${favs.length})`) : "")
			+ CATEGORIAS.map((c) => chip(estado.cat === c.id, `data-cat="${c.id}"`, `${c.icono} ${esc(c.nombre)} <span class="chip-count">${SENAS.filter((s) => s.categoria === c.id).length}</span>`)).join("");
		const cat = categoria(estado.cat);
		$("[data-resumen]").innerHTML = `${lista.length} resultado${lista.length === 1 ? "" : "s"}${estado.q ? ` para «<strong>${esc(estado.q)}</strong>»` : ""}${cat ? ` en ${esc(cat.nombre)}` : ""}${estado.q || estado.cat || estado.fav ? ' · <a href="dictionary.html" data-limpiar>Limpiar filtros</a>' : ""}`;
		$("[data-grid]").innerHTML = lista.map((s) => tarjetaSena(s, !!u)).join("");
		$("[data-vacio]").hidden = lista.length > 0;
		const p = new URLSearchParams();
		if (estado.q) p.set("q", estado.q);
		if (estado.cat) p.set("categoria", estado.cat);
		if (estado.fav) p.set("favoritas", "1");
		history.replaceState(null, "", "dictionary.html" + (p.toString() ? "?" + p : ""));
	};

	$("form").addEventListener("submit", (e) => {
		e.preventDefault();
		estado.q = $("#q").value.trim();
		pintar();
	});
	$("#q").addEventListener("input", () => {
		estado.q = $("#q").value.trim();
		pintar();
	});
	v.addEventListener("click", (e) => {
		const c = e.target.closest("[data-cat]");
		const f = e.target.closest("[data-favs]");
		const fav = e.target.closest("[data-fav]");
		const limpiar = e.target.closest("[data-limpiar]");
		if (c) Object.assign(estado, { cat: c.dataset.cat, fav: false });
		else if (f) Object.assign(estado, { fav: !estado.fav, cat: "" });
		else if (fav) Datos.alternarFavorita(fav.dataset.fav);
		else if (limpiar) {
			e.preventDefault();
			Object.assign(estado, { q: "", cat: "", fav: false });
			$("#q").value = "";
		} else return;
		pintar();
	});
	pintar();
};

/* ---------- Ficha de la seña ---------- */
Paginas.sena = () => {
	const s = sena(params.get("id"));
	if (!s) {
		Flash.set("warning", "La seña que buscas no existe.");
		return location.replace("dictionary.html");
	}
	const u = Auth.actual();
	const v = montarLayout("diccionario");
	const cat = categoria(s.categoria);
	const lecc = leccionesDeSena(s.id);
	const rel = SENAS.filter((x) => x.categoria === s.categoria && x.id !== s.id);
	v.innerHTML = `
	<nav aria-label="Ruta de navegación" class="small mb-3"><a class="text-decoration-none" href="dictionary.html">Diccionario</a><span class="mx-2 text-muted-custom" aria-hidden="true">/</span><a class="text-decoration-none" href="dictionary.html?categoria=${cat.id}">${esc(cat.nombre)}</a><span class="mx-2 text-muted-custom" aria-hidden="true">/</span><span aria-current="page">${esc(s.palabra)}</span></nav>
	<div class="row g-4">
		<div class="col-12 col-lg-7"><div class="surface-card p-3">${videoSena(s)}${creditoVideo(s)}</div></div>
		<div class="col-12 col-lg-5"><section class="surface-card p-3 p-md-4 h-100">
			<span class="level-pill mb-2">${cat.icono} ${esc(cat.nombre)}</span>
			<h1 class="display-6 fw-bold mb-2">${esc(s.palabra)}</h1>
			<p class="text-muted-custom">${esc(s.significado)}</p>
			<h2 class="h6 fw-bold mt-4 mb-2">Cómo practicar esta seña</h2>
			<ol class="small ps-3 mb-0"><li>Reproduce el video y obsérvalo completo.</li><li>Fíjate en la forma de las manos, el movimiento y el lugar donde se realiza.</li><li>Observa la expresión del rostro: también es parte de la seña.</li><li>Repite la seña frente a un espejo hasta hacerla con naturalidad.</li></ol>
			<div class="d-flex flex-wrap gap-2 mt-4">
				${u ? `<button class="btn ${Datos.esFavorita(s.id) ? "btn-brand" : "btn-outline-brand"}" type="button" data-fav-ficha aria-pressed="${Datos.esFavorita(s.id)}">${Datos.esFavorita(s.id) ? "★ En favoritas" : "☆ Agregar a favoritas"}</button>` : ""}
				<a class="btn btn-outline-brand" href="https://educativo.insor.gov.co/diccionario/" target="_blank" rel="noopener">Diccionario INSOR ↗</a>
			</div>
		</section></div>
	</div>
	<div class="row g-4 mt-1">
		${lecc.length ? `<section class="col-12 col-lg-5"><div class="surface-card p-3 p-md-4 h-100"><h2 class="h5 fw-bold mb-2">Aparece en las lecciones</h2>${lecc.map((l) => `<a class="vocab-item text-decoration-none" href="serviceDetails.html?id=${l.id}"><span><strong class="text-body">${esc(l.titulo)}</strong><br><span class="small text-muted-custom">${esc(l.curso.titulo)}</span></span><span aria-hidden="true">→</span></a>`).join("")}</div></section>` : ""}
		${rel.length ? `<section class="col-12 col-lg-${lecc.length ? 7 : 12}"><div class="surface-card p-3 p-md-4 h-100"><h2 class="h5 fw-bold mb-3">Más señas de ${esc(cat.nombre)}</h2><div class="chip-row">${rel.map((r) => `<a class="chip" href="signDetails.html?id=${r.id}">${esc(r.palabra)}</a>`).join("")}</div></div></section>` : ""}
	</div>`;
	const b = $("[data-fav-ficha]");
	if (b) b.addEventListener("click", () => {
		const es = Datos.alternarFavorita(s.id);
		b.className = "btn " + (es ? "btn-brand" : "btn-outline-brand");
		b.textContent = es ? "★ En favoritas" : "☆ Agregar a favoritas";
		b.setAttribute("aria-pressed", String(es));
	});
};

/* ---------- Práctica ---------- */
Paginas.practica = () => {
	const v = montarLayout("practica");
	const cabecera = `<header class="mb-4"><p class="eyebrow mb-2">Evalúa lo aprendido</p><h1 class="display-6 fw-bold mb-2">Práctica</h1><p class="text-muted-custom mb-0">Observa la seña en el video y elige la palabra que le corresponde.</p></header>`;

	const construir = (tipo, id, cantidad) => {
		let pool = SENAS;
		let titulo = "Todas las señas";
		if (tipo === "categoria" && categoria(id)) {
			pool = SENAS.filter((s) => s.categoria === id);
			titulo = categoria(id).nombre;
		} else if (tipo === "leccion" && leccion(id)) {
			pool = leccion(id).senas.map(sena);
			titulo = "Lección: " + leccion(id).titulo;
		} else if (tipo === "favoritas") {
			pool = Datos.leer().favoritas.map(sena).filter(Boolean);
			titulo = "Mis señas favoritas";
		}
		if (pool.length < 2) return null;
		const preguntas = barajar(pool).slice(0, cantidad).map((s) => {
			const otras = barajar([...pool.filter((x) => x.id !== s.id), ...barajar(SENAS.filter((x) => x.id !== s.id && !pool.includes(x)))]).map((x) => x.palabra);
			const opciones = barajar([s.palabra, ...[...new Set(otras)].slice(0, 3)]);
			return { sena: s, opciones, respuesta: null };
		});
		return { titulo, tipo, id, cantidad, preguntas };
	};

	const configurar = () => {
		const hist = [...Datos.leer().intentos].reverse().slice(0, 8);
		v.innerHTML = cabecera + `
		<div class="row g-4">
			<section class="col-12 col-lg-7"><form class="surface-card p-3 p-md-4" data-config>
				<h2 class="h5 fw-bold mb-3">Crea tu práctica</h2>
				<fieldset class="mb-3"><legend class="form-label fs-6">¿Qué quieres practicar?</legend>
					<div class="d-grid gap-2">
						<label class="option-card"><input class="form-check-input" type="radio" name="tipo" value="todas" checked> <span><strong>Todas las señas</strong><small>Preguntas aleatorias del diccionario completo.</small></span></label>
						<label class="option-card"><input class="form-check-input" type="radio" name="tipo" value="categoria"> <span><strong>Una categoría</strong><small><select class="form-select form-select-sm mt-2" data-para="categoria" aria-label="Categoría" disabled>${CATEGORIAS.map((c) => `<option value="${c.id}">${c.icono} ${esc(c.nombre)}</option>`).join("")}</select></small></span></label>
						<label class="option-card"><input class="form-check-input" type="radio" name="tipo" value="leccion"> <span><strong>Una lección</strong><small><select class="form-select form-select-sm mt-2" data-para="leccion" aria-label="Lección" disabled>${LECCIONES.filter((l) => l.senas.length).map((l) => `<option value="${l.id}">${esc(l.curso.titulo + " · " + l.titulo)}</option>`).join("")}</select></small></span></label>
						<label class="option-card"><input class="form-check-input" type="radio" name="tipo" value="favoritas"> <span><strong>Mis favoritas</strong><small>Las señas que marcaste con ★ en el diccionario.</small></span></label>
					</div>
				</fieldset>
				<label class="form-label" for="cantidad">Número de preguntas</label>
				<select class="form-select mb-4" id="cantidad"><option value="5">5 preguntas</option><option value="10">10 preguntas</option><option value="15">15 preguntas</option></select>
				<div data-error></div>
				<button class="btn btn-brand w-100" type="submit">Comenzar práctica →</button>
			</form></section>
			<section class="col-12 col-lg-5"><div class="surface-card p-3 p-md-4">
				<h2 class="h5 fw-bold mb-2">Tus intentos</h2>
				${hist.length ? hist.map((h) => `<div class="vocab-item"><span><strong>${esc(h.alcance)}</strong><br><span class="small text-muted-custom">${fechaCorta(h.fecha)}</span></span><span class="level-pill${pct(h.aciertos, h.total) >= 80 ? " pill-success" : ""}">${h.aciertos}/${h.total} · ${pct(h.aciertos, h.total)}%</span></div>`).join("") : '<p class="small text-muted-custom mb-0">Todavía no tienes intentos registrados.</p>'}
			</div></section>
		</div>`;
		const form = $("[data-config]");
		const sync = () => {
			const t = $("input[name=tipo]:checked", form).value;
			$$("[data-para]", form).forEach((s) => (s.disabled = s.dataset.para !== t));
		};
		form.addEventListener("change", sync);
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const tipo = $("input[name=tipo]:checked", form).value;
			const sel = $(`[data-para="${tipo}"]`, form);
			const quiz = construir(tipo, sel ? sel.value : "", Number($("#cantidad").value));
			if (!quiz) {
				$("[data-error]").innerHTML = alerta("warning", tipo === "favoritas" ? "Agrega al menos 2 señas a tus favoritas para practicarlas." : "No hay suficientes señas en esa selección.");
				return;
			}
			jugar(quiz);
		});
	};

	const jugar = (quiz) => {
		let i = 0;
		const n = quiz.preguntas.length;
		const pintar = () => {
			const p = quiz.preguntas[i];
			const respondidas = quiz.preguntas.filter((x) => x.respuesta !== null).length;
			v.innerHTML = cabecera + `
			<div class="d-flex justify-content-between align-items-center gap-2 mb-2"><span class="level-pill">${esc(quiz.titulo)}</span><span class="small text-muted-custom" aria-live="polite">Pregunta ${i + 1} de ${n} · ${respondidas} respondidas</span></div>
			<div class="progress mb-3" aria-hidden="true"><div class="progress-bar" style="width:${pct(respondidas, n)}%"></div></div>
			<fieldset class="surface-card p-3 p-md-4 mb-3">
				<legend class="h5 fw-bold mb-3">Pregunta ${i + 1} de ${n}: ¿Qué palabra corresponde a esta seña?</legend>
				<div class="row g-4 align-items-center">
					<div class="col-md-6"><div class="quiz-video"><iframe src="https://www.youtube-nocookie.com/embed/${p.sena.video}?autoplay=1&mute=1&loop=1&playlist=${p.sena.video}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1" title="Video de la seña a identificar" allow="autoplay; encrypted-media" tabindex="-1"></iframe><span class="quiz-video-band" aria-hidden="true">Observa la seña</span></div></div>
					<div class="col-md-6"><div class="quiz-options">${p.opciones.map((o, j) => `<input class="btn-check" type="radio" name="r" id="r${j}" value="${esc(o)}"${p.respuesta === o ? " checked" : ""}><label class="btn btn-outline-brand quiz-option" for="r${j}">${esc(o)}</label>`).join("")}</div></div>
				</div>
			</fieldset>
			<div class="d-flex justify-content-between gap-2">
				${i > 0 ? '<button class="btn btn-outline-brand" type="button" data-ant>← Anterior</button>' : "<span></span>"}
				${i < n - 1 ? `<button class="btn btn-brand" type="button" data-sig${p.respuesta === null ? " disabled" : ""}>Siguiente →</button>` : `<button class="btn btn-brand" type="button" data-calificar${p.respuesta === null ? " disabled" : ""}>Calificar respuestas</button>`}
			</div>`;
			$$("input[name=r]").forEach((r) => r.addEventListener("change", () => {
				p.respuesta = r.value;
				const b = $("[data-sig], [data-calificar]");
				b.disabled = false;
			}));
			$("[data-ant]")?.addEventListener("click", () => { i--; pintar(); });
			$("[data-sig]")?.addEventListener("click", () => { i++; pintar(); });
			$("[data-calificar]")?.addEventListener("click", () => resultado(quiz));
		};
		pintar();
	};

	const resultado = (quiz) => {
		const n = quiz.preguntas.length;
		const ok = quiz.preguntas.filter((p) => p.respuesta === p.sena.palabra).length;
		Datos.registrarIntento(quiz.titulo, ok, n);
		const p100 = pct(ok, n);
		const repetir = `practice.html?tipo=${quiz.tipo}&id=${encodeURIComponent(quiz.id)}&cantidad=${quiz.cantidad}`;
		v.innerHTML = cabecera + `
		<section class="surface-card p-4 mb-4 result-hero">
			<div class="result-score" style="--pct:${p100}"><strong>${ok}/${n}</strong><small>${p100}%</small></div>
			<div><p class="eyebrow mb-1">${esc(quiz.titulo)}</p><h2 class="h3 fw-bold mb-2">${p100 >= 80 ? "¡Excelente trabajo!" : p100 >= 50 ? "¡Vas por buen camino!" : "Sigue practicando, lo lograrás"}</h2>
			<p class="text-muted-custom mb-3">Tu resultado quedó guardado en tu perfil. Repasa las señas que fallaste y vuelve a intentarlo.</p>
			<a class="btn btn-brand" href="${repetir}">Repetir práctica</a> <a class="btn btn-outline-brand" href="practice.html">Elegir otro tema</a></div>
		</section>
		<section class="surface-card p-3 p-md-4"><h2 class="h5 fw-bold mb-2">Revisión de respuestas</h2>
			${quiz.preguntas.map((p) => {
				const bien = p.respuesta === p.sena.palabra;
				return `<div class="vocab-item"><span><span class="answer-mark ${bien ? "is-ok" : "is-bad"}" aria-hidden="true">${bien ? "✓" : "✗"}</span><strong>${esc(p.sena.palabra)}</strong>${bien ? "" : `<span class="small text-muted-custom"> · Respondiste: ${esc(p.respuesta ?? "sin respuesta")}</span>`}<span class="visually-hidden">${bien ? "Correcta" : "Incorrecta"}</span></span><a class="small text-decoration-none flex-shrink-0" href="signDetails.html?id=${p.sena.id}">Repasar →</a></div>`;
			}).join("")}
		</section>`;
	};

	const tipo = params.get("tipo");
	if (tipo) {
		const quiz = construir(tipo, params.get("id"), Math.min(15, Math.max(1, Number(params.get("cantidad")) || 5)));
		history.replaceState(null, "", "practice.html");
		if (quiz) return jugar(quiz);
	}
	configurar();
};

/* ---------- Perfil ---------- */
Paginas.perfil = () => {
	const v = montarLayout("perfil");
	const pintar = (aviso = "") => {
		const u = Auth.actual();
		const st = Datos.estadisticas();
		const d = Datos.leer();
		const recientes = [...d.progreso].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
		v.innerHTML = `${aviso}
		<header class="mb-4"><p class="eyebrow mb-1">Tu cuenta</p><h1 class="display-6 fw-bold mb-2">Mi perfil</h1><p class="text-muted-custom mb-0">Consulta tu información y revisa cómo avanzas en tu aprendizaje.</p></header>
		<section class="surface-card profile-card p-3 p-md-4 mb-4">
			<div class="profile-avatar" aria-hidden="true">${esc(iniciales(u.nombre))}</div>
			<div class="profile-summary"><p class="eyebrow mb-1">Estudiante</p><h2 class="h3 fw-bold mb-1">${esc(u.nombre)}</h2><p class="text-muted-custom mb-0">${esc(u.correo)} · Miembro desde ${fechaCorta(u.creado)}</p></div>
			<a class="btn btn-outline-brand profile-action" href="main.html">Volver a mi aprendizaje</a>
		</section>
		<section class="row g-3 mb-4" aria-label="Resumen">
			${statCard("✓", "Lecciones completadas", `${st.completadas} de ${st.total}`)}
			${statCard("🤟", "Señas aprendidas", st.senas)}
			${statCard("◎", "Prácticas realizadas", st.intentos + (st.intentos ? ` · ${st.precision}%` : ""))}
			${statCard("★", "Señas favoritas", st.favoritas)}
		</section>
		<div class="row g-4 mb-4">
			<section class="col-12 col-lg-7"><div class="surface-card p-3 p-md-4 h-100">
				<div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"><div><p class="eyebrow mb-1">Tu recorrido</p><h2 class="h4 fw-bold mb-0">Mis cursos</h2></div><a class="btn btn-outline-brand" href="catalog.html">Explorar cursos</a></div>
				<div class="d-grid gap-3">${Datos.cursos().map((c) => `<article class="profile-course"><div class="d-flex justify-content-between align-items-start gap-3 mb-2"><div><h3 class="h6 fw-bold mb-1">${esc(c.titulo)}</h3><p class="small text-muted-custom mb-0">${c.nivel} · ${c.hechas} de ${c.lecciones.length} lecciones</p></div><strong class="small text-brand">${c.porcentaje}%</strong></div>${barra(c.porcentaje, "Progreso en " + c.titulo)}</article>`).join("")}</div>
			</div></section>
			<div class="col-12 col-lg-5 d-grid gap-4 align-content-start">
				<section class="surface-card p-3 p-md-4"><h2 class="h5 fw-bold mb-2">Señas favoritas</h2>${d.favoritas.length ? `<div class="chip-row">${d.favoritas.map(sena).filter(Boolean).map((s) => `<a class="chip" href="signDetails.html?id=${s.id}">★ ${esc(s.palabra)}</a>`).join("")}</div>` : '<p class="small text-muted-custom mb-0">Marca señas con ☆ en el diccionario para encontrarlas rápido aquí.</p>'}</section>
				<section class="surface-card p-3 p-md-4"><h2 class="h5 fw-bold mb-2">Completadas recientemente</h2>${recientes.length ? recientes.map((p) => `<a class="vocab-item text-decoration-none" href="serviceDetails.html?id=${p.id}"><strong class="text-body">${esc(leccion(p.id)?.titulo ?? "")}</strong><span class="small text-muted-custom">${fechaCorta(p.fecha)}</span></a>`).join("") : '<p class="small text-muted-custom mb-0">Aún no completas lecciones.</p>'}</section>
			</div>
		</div>
		<div class="row g-4">
			<section class="col-12 col-lg-6"><form class="surface-card p-3 p-md-4 h-100" data-form="datos" novalidate>
				<h2 class="h5 fw-bold mb-3">Datos personales</h2>
				<label class="form-label" for="nombre">Nombre</label><input class="form-control" id="nombre" value="${esc(u.nombre)}" required><div class="invalid-feedback">El nombre debe tener entre 3 y 80 caracteres.</div>
				<label class="form-label mt-3" for="correoPerfil">Correo</label><input class="form-control" id="correoPerfil" value="${esc(u.correo)}" disabled>
				<button class="btn btn-brand mt-3" type="submit">Guardar cambios</button>
			</form></section>
			<section class="col-12 col-lg-6"><form class="surface-card p-3 p-md-4 h-100" data-form="clave" novalidate>
				<h2 class="h5 fw-bold mb-3">Cambiar contraseña</h2>
				<label class="form-label" for="actual">Contraseña actual</label><input class="form-control" id="actual" type="password" autocomplete="current-password" required><div class="invalid-feedback">La contraseña actual no es correcta.</div>
				<label class="form-label mt-3" for="nueva">Nueva contraseña</label><input class="form-control" id="nueva" type="password" autocomplete="new-password" required><div class="invalid-feedback">Mínimo 8 caracteres, con letras y números.</div>
				<button class="btn btn-outline-brand mt-3" type="submit">Actualizar contraseña</button>
			</form></section>
		</div>`;
		$('[data-form="datos"]').addEventListener("submit", (e) => {
			e.preventDefault();
			const nombre = $("#nombre").value.trim();
			if (nombre.length < 3 || nombre.length > 80) return $("#nombre").classList.add("is-invalid");
			Auth.actualizar({ nombre });
			Flash.set("success", "Tus datos se actualizaron.");
			location.reload(); /* recarga para actualizar también el nombre de la barra lateral */
		});
		$('[data-form="clave"]').addEventListener("submit", (e) => {
			e.preventDefault();
			const actualOk = $("#actual").value === Auth.actual().clave;
			const nueva = $("#nueva").value;
			const nuevaOk = nueva.length >= 8 && /[A-Za-z]/.test(nueva) && /\d/.test(nueva);
			$("#actual").classList.toggle("is-invalid", !actualOk);
			$("#nueva").classList.toggle("is-invalid", actualOk && !nuevaOk);
			if (!actualOk || !nuevaOk) return;
			Auth.actualizar({ clave: nueva });
			pintar(alerta("success", "Tu contraseña se cambió correctamente."));
		});
	};
	pintar();
};

/* =========================================================
 * Arranque
 * ========================================================= */
const PRIVADAS = ["inicio", "practica", "perfil"];

document.addEventListener("DOMContentLoaded", () => {
	sembrarDemo();
	const pagina = document.body.dataset.page;

	if (pagina === "index") return location.replace(Auth.actual() ? "main.html" : "login.html");
	if (PRIVADAS.includes(pagina) && !Auth.actual()) {
		try {
			sessionStorage.setItem("inclusign.destino", location.pathname.split("/").pop() + location.search);
		} catch {
			/* ignorar */
		}
		Flash.set("info", "Inicia sesión para continuar.");
		return location.replace("login.html");
	}
	(Paginas[pagina] || Paginas.catalogo)();

	document.addEventListener("click", (e) => {
		if (e.target.closest("[data-logout]")) {
			Auth.salir();
			Flash.set("success", "Cerraste sesión. ¡Vuelve pronto a practicar!");
		}
	});
});
