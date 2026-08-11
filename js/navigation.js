import { NAVIGATION_GROUPS, findNavigationItem } from "../data/navigation.js";

function groupCode(group) {
  return (group.shortLabel || group.label)
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function renderNavigation(container) {
  const fragment = document.createDocumentFragment();

  for (const [index, group] of NAVIGATION_GROUPS.entries()) {
    const details = document.createElement("details");
    details.className = "nav-group";
    details.dataset.group = group.label;
    details.open = index < 2;

    const summary = document.createElement("summary");
    summary.className = "nav-group__summary";
    summary.innerHTML = `<span class="nav-group__code" aria-hidden="true">${groupCode(group)}</span><span>${group.label}</span><span class="nav-group__chevron" aria-hidden="true">›</span>`;
    details.append(summary);

    const list = document.createElement("ul");
    list.className = "nav-list";

    for (const item of group.items) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = `#/${item.route}`;
      link.dataset.route = item.route;
      link.title = item.label;
      link.innerHTML = `<span class="nav-link__indicator" aria-hidden="true"></span><span>${item.label}</span>`;
      listItem.append(link);
      list.append(listItem);
    }

    details.append(list);
    fragment.append(details);
  }

  container.replaceChildren(fragment);
}

export function setActiveNavigation(container, route) {
  for (const link of container.querySelectorAll("[data-route]")) {
    const isActive = link.dataset.route === route;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
      link.closest("details").open = true;
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

export function getPlannedRouteContext(route) {
  const item = findNavigationItem(route);
  if (!item) return { title: "Page not found", section: "Unknown route" };

  const group = NAVIGATION_GROUPS.find((candidate) => candidate.items.includes(item));
  return { title: item.label, section: group.label };
}

export function renderPlannedPage(container, route) {
  const context = getPlannedRouteContext(route);
  const isUnknown = context.section === "Unknown route";
  const routeLabel = isUnknown ? "404" : "Curriculum preview";

  container.innerHTML = `
    <section class="planned-page" aria-labelledby="planned-title">
      <div class="planned-page__signal" aria-hidden="true">
        <span>${isUnknown ? "?" : "↗"}</span>
      </div>
      <p class="eyebrow">${routeLabel} · ${context.section}</p>
      <h1 id="planned-title">${context.title}</h1>
      <p class="planned-page__copy">
        ${
          isUnknown
            ? "That route is not part of the IBKR Platform Mastery curriculum."
            : "This curriculum destination is mapped into the foundation, but its learning content will be built in a later implementation phase."
        }
      </p>
      <div class="planned-page__actions">
        <a class="button button--primary" href="#/dashboard">Return to dashboard</a>
        ${isUnknown ? "" : `<span class="status-chip status-chip--neutral"><span aria-hidden="true">◇</span> Planned</span>`}
      </div>
    </section>
  `;
}
