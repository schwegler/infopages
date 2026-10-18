export const q = (selector, root = document) => root.querySelector(selector);
export const qa = (selector, root = document) => [
  ...root.querySelectorAll(selector),
];
export function setPressed(selector, selected) {
  qa(selector).forEach((button) =>
    button.setAttribute("aria-pressed", String(button === selected)),
  );
}
export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function renderTable(headers, rows, caption) {
  const wrapper = element("div", undefined, "table-wrap");
  const table = element("table");
  if (caption) table.append(element("caption", caption));
  const head = element("thead");
  const heading = element("tr");
  headers.forEach((text) => {
    const th = element("th", text);
    th.scope = "col";
    heading.append(th);
  });
  head.append(heading);
  const body = element("tbody");
  rows.forEach((values) => {
    const row = element("tr");
    values.forEach((value, index) => {
      const cell = element(index === 0 ? "th" : "td", value);
      if (index === 0) cell.scope = "row";
      row.append(cell);
    });
    body.append(row);
  });
  table.append(head, body);
  wrapper.append(table);
  return wrapper;
}
