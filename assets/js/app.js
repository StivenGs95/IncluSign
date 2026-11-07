document.addEventListener("DOMContentLoaded", () => {
	const sessionKey = "incluSign.authenticated";
	const loginForm = document.querySelector("[data-login-form]");
	if (loginForm) {
		loginForm.addEventListener("submit", () => {
			try {
				window.sessionStorage.setItem(sessionKey, "true");
			} catch (error) {
				console.warn("No se pudo guardar el estado de sesión.", error);
			}
		});
	}

	document.querySelectorAll("[data-session-logout]").forEach((logoutLink) => {
		logoutLink.addEventListener("click", () => {
			try {
				window.sessionStorage.removeItem(sessionKey);
			} catch (error) {
				console.warn("No se pudo limpiar el estado de sesión.", error);
			}
		});
	});

	const catalogPage = document.querySelector(".catalog-heading");
	if (catalogPage) {
		let isAuthenticated = false;
		try {
			isAuthenticated = window.sessionStorage.getItem(sessionKey) === "true";
		} catch (error) {
			console.warn("No se pudo leer el estado de sesión.", error);
		}

		document.querySelectorAll("[data-authenticated-only]").forEach((element) => {
			element.hidden = !isAuthenticated;
		});
		document.querySelectorAll("[data-guest-only]").forEach((element) => {
			element.hidden = isAuthenticated;
		});
		document.querySelectorAll("[data-catalog-home-link]").forEach((link) => {
			link.href = isAuthenticated ? "main.html" : "login.html";
		});
		const catalogNavigation = document.querySelector(".app-nav");
		if (catalogNavigation) catalogNavigation.classList.toggle("guest-navigation", !isAuthenticated);
	}

	const workspaceLayout = document.querySelector(".workspace-layout");
	const sidebarToggle = document.querySelector("[data-sidebar-toggle]");
	if (workspaceLayout && sidebarToggle) {
		const desktopViewport = window.matchMedia("(min-width: 992px)");
		const storageKey = "incluSign.sidebarCollapsed";
		let shouldStartCollapsed = false;
		try {
			shouldStartCollapsed = desktopViewport.matches && window.localStorage.getItem(storageKey) === "true";
		} catch {
			shouldStartCollapsed = false;
		}

		const setSidebarCollapsed = (isCollapsed, persist = true) => {
			workspaceLayout.classList.toggle("sidebar-collapsed", isCollapsed);
			const label = isCollapsed ? "Expandir navegación" : "Compactar navegación";
			sidebarToggle.setAttribute("aria-label", label);
			sidebarToggle.setAttribute("title", label);
			sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
			const hiddenLabel = sidebarToggle.querySelector(".visually-hidden");
			if (hiddenLabel) hiddenLabel.textContent = label;
			if (persist && desktopViewport.matches) {
				try {
					window.localStorage.setItem(storageKey, String(isCollapsed));
				} catch {
					// La navegación sigue funcionando aunque el almacenamiento local no esté disponible.
				}
			}
		};

		setSidebarCollapsed(shouldStartCollapsed, false);
		sidebarToggle.addEventListener("click", () => {
			setSidebarCollapsed(!workspaceLayout.classList.contains("sidebar-collapsed"));
		});
	}

	const chips = document.querySelectorAll("[data-chip]");
	const lessonCards = document.querySelectorAll("[data-lesson-card]");
	const emptyState = document.querySelector("[data-empty-state]");

	chips.forEach((chip) => {
		chip.addEventListener("click", () => {
			chips.forEach((item) => {
				item.classList.remove("active");
				item.setAttribute("aria-pressed", "false");
			});
			chip.classList.add("active");
			chip.setAttribute("aria-pressed", "true");

			const selectedCategory = chip.dataset.chip;
			let visibleLessons = 0;
			lessonCards.forEach((card) => {
				const isVisible = selectedCategory === "todas" || card.dataset.category === selectedCategory;
				card.hidden = !isVisible;
				if (isVisible) visibleLessons += 1;
			});
			if (emptyState) emptyState.hidden = visibleLessons > 0;
		});
	});

	const completeButton = document.querySelector("[data-complete-lesson]");
	const completionMessage = document.querySelector("[data-completion-message]");
	if (completeButton && completionMessage) {
		completeButton.addEventListener("click", () => {
			completeButton.textContent = "Lección completada ✓";
			completeButton.disabled = true;
			completionMessage.textContent = "¡Buen trabajo! Lección completada.";
		});
	}

	const previewButton = document.querySelector("[data-preview-button]");
	const previewCaption = document.querySelector("[data-preview-caption]");
	if (previewButton && previewCaption) {
		previewButton.addEventListener("click", () => {
			previewCaption.textContent = "Vista previa seleccionada.";
			previewButton.setAttribute("aria-label", "Vista previa seleccionada");
			previewButton.disabled = true;
		});
	}

});
