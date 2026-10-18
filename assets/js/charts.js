import { element } from "./dom.js";
export function barChart(rows, caption, maximum = 100) {
  const figure = element("figure", undefined, "source-chart");
  figure.append(element("figcaption", caption));
  const list = element("div", undefined, "chart-bars");
  rows.forEach(([label, value]) => {
    const row = element("div", undefined, "chart-row");
    const text = element("p", label);
    text.append(element("strong", String(value)));
    const meter = element("meter");
    meter.min = 0;
    meter.max = maximum;
    meter.value = value;
    meter.setAttribute("aria-label", `${label}: ${value}`);
    row.append(text, meter);
    list.append(row);
  });
  figure.append(list);
  return figure;
}
export function linePoints(values, maximum = 100) {
  return values
    .map(
      (value, index) =>
        `${20 + index * (560 / (values.length - 1 || 1))},${180 - (Math.max(0, Math.min(maximum, value)) / maximum) * 160}`,
    )
    .join(" ");
}
export function lineChart(labels, series, caption, maximum = 100) {
  const figure = element("figure", undefined, "source-chart line-chart");
  figure.append(element("figcaption", caption));
  const ns = "http://www.w3.org/2000/svg",
    svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 600 200");
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    caption + " Values available in the adjacent data table.",
  );
  for (const y of [20, 100, 180]) {
    const line = document.createElementNS(ns, "line");
    for (const [key, value] of Object.entries({
      x1: 20,
      x2: 580,
      y1: y,
      y2: y,
      class: "chart-grid",
    }))
      line.setAttribute(key, String(value));
    svg.append(line);
  }
  series.forEach(([label, values], index) => {
    const line = document.createElementNS(ns, "polyline");
    line.setAttribute("points", linePoints(values, maximum));
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", index === 0 ? "#514287" : "#9a7694");
    line.setAttribute("stroke-width", "3");
    svg.append(line);
    values.forEach((value, i) => {
      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", String(20 + i * (560 / (values.length - 1 || 1))));
      dot.setAttribute("cy", String(180 - (value / maximum) * 160));
      dot.setAttribute("r", "4");
      dot.setAttribute("fill", index === 0 ? "#514287" : "#9a7694");
      const title = document.createElementNS(ns, "title");
      title.textContent = `${label}, ${labels[i]}: ${value}`;
      dot.append(title);
      svg.append(dot);
    });
  });
  const frame = element("div", undefined, "line-frame");
  const scale = element("div", undefined, "chart-scale");
  scale.append(element("span", String(maximum)), element("span", "0"));
  frame.append(scale, svg);
  figure.append(frame);
  const axis = element("div", undefined, "chart-axis");
  labels.forEach((label) => axis.append(element("span", label)));
  figure.append(axis);
  const legend = element("div", undefined, "chart-legend");
  series.forEach(([label]) => legend.append(element("span", label)));
  figure.append(legend);
  return figure;
}
