import { barChart } from "./charts.js";
import { q, qa, element } from "./dom.js";
import { filterEvents, relatedEvents } from "./model.js";
const status = q("#timeline-count");
const year = q("#year");
let historyData;
let dialog;
function renderTimeline() {
  const events = filterEvents(historyData.timelineEvents, year.value);
  status.textContent = `${events.length} events shown`;
  const container = q("#timeline");
  container.replaceChildren();
  if (!events.length)
    container.append(
      element("p", "No major events recorded for this selection."),
    );
  events.forEach((event) => {
    const article = element("article", undefined, "timeline-event");
    article.append(
      element("small", `${event.year} / ${event.family || "Village"}`),
      element("h3", event.title),
      element("p", event.description),
    );
    container.append(article);
  });
}
function showCharacter(id) {
  const character = historyData.characters[id];
  if (!character) return;
  const content = q("[data-dialog-content]", dialog);
  const heading = element("h2", character.name);
  heading.id = "character-title";
  content.replaceChildren(
    heading,
    element("p", character.summary || "No summary available."),
  );
  relatedEvents(historyData.timelineEvents, character.name).forEach((event) => {
    const paragraph = element("p");
    paragraph.append(
      element("strong", `${event.year} · ${event.title}`),
      element("br"),
      document.createTextNode(event.description),
    );
    content.append(paragraph);
  });
  dialog.showModal();
}
function familyTree(nodes) {
  const tree = element("ul", undefined, "family-tree");
  nodes.forEach((node) => {
    const item = element("li");
    const character = historyData.characters[node.id];
    if (character) {
      const button = element("button", character.name);
      button.type = "button";
      button.dataset.person = node.id;
      button.addEventListener("click", () => showCharacter(node.id));
      item.append(button);
    } else item.append(element("span", node.name || node.id));
    if (node.note) item.append(element("small", node.note));
    if (node.children) item.append(familyTree(node.children));
    tree.append(item);
  });
  return tree;
}
function renderFamilies() {
  dialog = element("dialog");
  dialog.setAttribute("aria-labelledby", "character-title");
  const close = element("button", "Close");
  close.type = "button";
  close.setAttribute("aria-label", "Close character details");
  close.addEventListener("click", () => dialog.close());
  const content = element("div");
  content.dataset.dialogContent = "";
  dialog.append(close, content);
  document.body.append(dialog);
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  });
  q("#families").replaceChildren();
  Object.values(historyData.familyStructures).forEach((family) => {
    const details = element("details");
    details.append(element("summary", family.name), familyTree(family.tree));
    q("#families").append(details);
  });
}
function renderThemes() {
  q("#themes").replaceChildren();
  historyData.thematicChart.labels.forEach((label, index) => {
    const row = element("div", undefined, "theme-line");
    row.append(element("h3", label));
    row.append(
      barChart(
        historyData.thematicChart.datasets.map((series) => [
          series.label,
          series.data[index],
        ]),
        "Original thematic event counts · " + label,
        20,
      ),
    );
    q("#themes").append(row);
  });
}
async function load() {
  status.textContent = "Loading the timeline…";
  year.disabled = true;
  try {
    const response = await fetch("hollyoaks_data.json");
    if (!response.ok) throw new Error(`Data unavailable (${response.status})`);
    historyData = await response.json();
    if (
      !Array.isArray(historyData.timelineEvents) ||
      !historyData.characters ||
      !historyData.familyStructures ||
      !historyData.thematicChart
    )
      throw new Error("Invalid history data");
    renderTimeline();
    renderFamilies();
    renderThemes();
    year.disabled = false;
  } catch {
    status.replaceChildren(
      document.createTextNode(
        "The interactive history could not load. Reading sections are still available. ",
      ),
    );
    status.classList.add("load-error");
    const retry = element("button", "Try again");
    retry.type = "button";
    retry.className = "text-link";
    retry.addEventListener("click", () => {
      status.classList.remove("load-error");
      load();
    });
    status.append(retry);
  }
}
year.addEventListener("change", renderTimeline);
load();
qa("[data-history-view]").forEach((button) =>
  button.addEventListener("click", () => {
    qa("[data-history-view]").forEach((other) => {
      const selected = other === button;
      other.setAttribute("aria-pressed", String(selected));
      q("#" + other.dataset.historyView).hidden = !selected;
    });
  }),
);
qa(".experiment-nav a").forEach((link) =>
  link.addEventListener("click", () => {
    const id = link.hash.slice(1),
      button = q('[data-history-view="' + id + '"]');
    if (button) button.click();
  }),
);

// Keep the reading sections available without JavaScript.
const initialView = location.hash.slice(1);
const initialButton =
  q('[data-history-view="' + initialView + '"]') ||
  q('[data-history-view="history-timeline"]');
initialButton.click();
