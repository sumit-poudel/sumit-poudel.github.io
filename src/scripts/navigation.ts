interface StatusBar {
	mode: HTMLElement;
	commandLine: HTMLElement;
	fileInfo: HTMLElement;
	position: HTMLElement;
}

let currentMode = "NORMAL";
let commandBuffer = "";

function getScrollContainer(): HTMLElement {
	return document.querySelector("main") ?? document.documentElement;
}

function getListItems(): HTMLElement[] {
	return Array.from(
		document.querySelectorAll<HTMLElement>(
			"#blog-list .list-item, #projects-list .list-item",
		),
	);
}

let listIndex = -1;

function setListIndex(index: number) {
	const items = getListItems();
	if (items.length === 0) return;
	listIndex = Math.max(0, Math.min(index, items.length - 1));
	items.forEach((item, i) => item.classList.toggle("active", i === listIndex));
	items[listIndex].scrollIntoView({ block: "nearest" });
	updatePosition();
}

function moveListCursor(delta: number): boolean {
	const items = getListItems();
	if (items.length === 0) return false;
	if (listIndex < 0) {
		setListIndex(delta > 0 ? 0 : items.length - 1);
	} else {
		setListIndex(listIndex + delta);
	}
	return true;
}

function openListItem(): boolean {
	const items = getListItems();
	if (items.length === 0 || listIndex < 0) return false;
	const href = items[listIndex]?.dataset.href;
	if (!href) return false;
	window.location.href = href;
	return true;
}

document.addEventListener("keydown", (e: KeyboardEvent) => {
	if (window.handleSearchKey?.(e.key)) {
		e.preventDefault();
		return;
	}

	if (currentMode === "INSERT" && e.key !== "Escape") {
		return;
	}

	switch (e.key) {
		case ":":
			e.preventDefault();
			currentMode = "COMMAND";
			commandBuffer = ":";
			window.updateStatusBar(currentMode, commandBuffer);
			window.refreshPalette?.(commandBuffer);
			break;
		case "/":
			e.preventDefault();
			currentMode = "SEARCH";
			commandBuffer = "/";
			window.updateStatusBar(currentMode, commandBuffer);
			window.refreshPalette?.(commandBuffer);
			break;
		case "Escape":
			handleEscape();
			break;
		case "Enter":
			if (currentMode === "COMMAND" || currentMode === "SEARCH") {
				handleCommand(commandBuffer);
				resetCommandMode();
			} else if (currentMode === "NORMAL") {
				openListItem();
			}
			break;
		case "Backspace":
			if (currentMode === "COMMAND" || currentMode === "SEARCH") {
				e.preventDefault();
				commandBuffer = commandBuffer.slice(0, -1);
				if (commandBuffer.length === 0) {
					handleEscape();
				} else {
					window.updateStatusBar(undefined, commandBuffer);
					window.refreshPalette?.(commandBuffer);
				}
			}
			break;
		default:
			if (currentMode === "COMMAND" || currentMode === "SEARCH") {
				if (e.ctrlKey || e.metaKey || e.altKey) return;
				e.preventDefault();
				commandBuffer += e.key;
				window.updateStatusBar(undefined, commandBuffer);
				window.refreshPalette?.(commandBuffer);
			} else {
				handleNormalModeKey(e.key);
			}
	}
});

function resetCommandMode() {
	currentMode = "NORMAL";
	commandBuffer = "";
	window.updateStatusBar(currentMode, "");
}

function applyCommandLine(query: string) {
	const value = /^[/:]/.test(query) ? query : `/${query}`;
	currentMode = value.startsWith(":") ? "COMMAND" : "SEARCH";
	commandBuffer = value;
	window.updateStatusBar(currentMode, commandBuffer);
	window.refreshPalette?.(commandBuffer);
}

function handleEscape() {
	currentMode = "NORMAL";
	commandBuffer = "";
	window.updateStatusBar(currentMode, "");
	if (window.closeSearchPalette) {
		window.closeSearchPalette();
		return;
	}
	const searchResults = document.getElementById("search-results");
	if (searchResults) {
		searchResults.innerHTML = "";
		searchResults.classList.add("hidden");
	}
}

function handleCommand(command: string) {
	if (command.startsWith(":")) {
		const cmd = command.slice(1).toLowerCase();
		switch (cmd) {
			case "blog":
				window.location.href = "/blog";
				break;
			case "projects":
				window.location.href = "/projects";
				break;
			case "about":
				window.location.href = "/about";
				break;
			case "contact":
				window.location.href = "/contact";
				break;
			case "q":
				window.close();
				window.location.href = "/exited";
				break;
			case "h":
				window.location.href = "/help";
				break;
			default:
				console.log("Unknown command:", cmd);
		}
		window.closeSearchPalette?.();
	} else if (command.startsWith("/")) {
		const searchTerm = command.slice(1);
		if (window.performSearch) {
			window.performSearch(searchTerm);
		}
	}
}

function handleNormalModeKey(key: string) {
	const container = getScrollContainer();

	switch (key) {
		case "h":
			navigateUp();
			break;
		case "l":
			navigateDown();
			break;
		case "j":
			if (!moveListCursor(1)) {
				container.scrollBy(0, 30);
				updatePosition();
			}
			break;
		case "k":
			if (!moveListCursor(-1)) {
				container.scrollBy(0, -30);
				updatePosition();
			}
			break;
		case "d":
			container.scrollBy(0, container.clientHeight * 0.8);
			updatePosition();
			break;
		case "w":
			container.scrollBy(0, -container.clientHeight * 0.8);
			updatePosition();
			break;
		case "g":
			if (getListItems().length > 0) {
				setListIndex(0);
			} else {
				container.scrollTo(0, 0);
				updatePosition();
			}
			break;
		case "G":
			if (getListItems().length > 0) {
				setListIndex(getListItems().length - 1);
			} else {
				container.scrollTo(0, container.scrollHeight);
				updatePosition();
			}
			break;
		case "i":
			currentMode = "INSERT";
			window.updateStatusBar(currentMode);
			break;
		case "v":
			currentMode = "VISUAL";
			window.updateStatusBar(currentMode);
			break;
	}
}

function updatePosition() {
	const items = getListItems();
	if (items.length > 0 && listIndex >= 0) {
		window.updateStatusBar(
			undefined,
			undefined,
			undefined,
			`${listIndex + 1}/${items.length}`,
		);
		return;
	}
	const container = getScrollContainer();
	const scrollableHeight = container.scrollHeight - container.clientHeight;
	const scrollPercentage =
		scrollableHeight > 0
			? Math.round((container.scrollTop / scrollableHeight) * 100)
			: 0;
	window.updateStatusBar(
		undefined,
		undefined,
		undefined,
		`${scrollPercentage}%`,
	);
}

updatePosition();
getScrollContainer().addEventListener("scroll", updatePosition);

if (getListItems().length > 0) {
	setListIndex(0);
}
document.addEventListener("click", (e) => {
	const item = (e.target as HTMLElement | null)?.closest?.(
		".list-item",
	) as HTMLElement | null;
	if (!item) return;
	const index = getListItems().indexOf(item);
	if (index >= 0) setListIndex(index);
});

const currentPath = window.location.pathname;
window.updateStatusBar(
	undefined,
	undefined,
	currentPath === "/" ? "Landing Page" : currentPath.slice(1),
);

window.setCommandLine = applyCommandLine;

function navigateUp() {
	window.history.back();
}

function navigateDown() {
	window.history.forward();
}

function openSearchWithQuery(query: string) {
	currentMode = "SEARCH";
	commandBuffer = `/${query}`;
	window.updateStatusBar(currentMode, commandBuffer);
	window.refreshPalette?.(commandBuffer);
}

window.openSearchWithQuery = openSearchWithQuery;
