import { q, qa, setPressed, element, renderTable } from "./dom.js";
const tna = {
  2007: [
    "The move to two hours",
    "The weekly broadcast expanded, creating more room for storylines and the roster. The original retrospective follows the title scene, the X Division and the Knockouts division.",
    ["Roster category", "Share in original chart"],
    [
      ["Established legends", "60%"],
      ["TNA originals", "25%"],
      ["Tag teams (mixed)", "15%"],
    ],
  ],
  2008: [
    "The Main Event Mafia vs. the Frontline",
    "Veteran star power and the next generation collided in the defining faction story of the era.",
    ["Faction", "Wins", "Losses", "No contests"],
    [
      ["Main Event Mafia", 12, 4, 2],
      ["TNA Frontline", 5, 11, 2],
    ],
  ],
  2009: [
    "Evolution and the arrival of Hogan",
    "A changing roster and major announcements set up a new chapter for the company. The original retrospective closes on the transition into 2010.",
    ["Month", "Main event focus", "X Division focus"],
    [
      ["Jan", 80, 40],
      ["Mar", 75, 45],
      ["Jun", 70, 50],
      ["Sep", 85, 30],
      ["Dec", 90, 20],
    ],
  ],
};
function renderYear(year) {
  const [title, description, headers, rows] = tna[year];
  const details = element("details");
  details.append(
    element("summary", "Explore the original visualization data"),
    element(
      "p",
      "Illustrative values from the existing retrospective, without a verified methodology. These are not presented as measured historical statistics.",
    ),
    renderTable(headers, rows),
  );
  q("#tna-story").replaceChildren(
    element("h3", title),
    element("p", description),
    element(
      "p",
      "Historical narrative retained from the existing retrospective.",
      "source-note",
    ),
    details,
  );
}
if (q("#tna-story")) {
  renderYear("2007");
  qa("[data-tna]").forEach((button) =>
    button.addEventListener("click", () => {
      setPressed("[data-tna]", button);
      renderYear(button.dataset.tna);
    }),
  );
}
const demographicValues = [
  ["General (male) bars", 37],
  ["Women’s bars", 52],
  ["Bars serving people of color", 60],
];
const demographics = {
  all: ["Comparing the decline", [0, 1, 2]],
  women: ["Women’s spaces", [1, 0, 2]],
  poc: ["Spaces serving people of color", [2, 0, 1]],
};
function renderDemographic(view) {
  const [title, order] = demographics[view];
  const bars = element("div", undefined, "bars");
  order.forEach((index) => {
    const [label, value] = demographicValues[index];
    const text = element("p", label);
    text.append(element("span", `−${value}%`));
    const meter = element("meter");
    meter.min = 0;
    meter.max = 100;
    meter.value = value;
    meter.setAttribute("aria-label", `${label}: ${value}% decline in listings`);
    bars.append(text, meter);
  });
  q("#demographic").replaceChildren(
    element("h3", title),
    bars,
    element(
      "p",
      "Decline in listings, 2002–2019. Reproduced from the existing project; verify the primary dataset before publication.",
      "source-note",
    ),
  );
}
const factors = {
  gentrification: [
    "Gentrification & real estate",
    "Rising rents and redevelopment can make long-standing community venues difficult to sustain. The existing report describes real estate pressure as one of several contributing factors.",
  ],
  apps: [
    "The shift to online connection",
    "Dating apps and online communities changed how people meet. This is one possible contributor, rather than a complete explanation of venue decline.",
  ],
  assimilation: [
    "Mainstreaming & changing habits",
    "Wider social acceptance and changing nightlife habits can reshape demand for dedicated venues, while their community role remains important.",
  ],
};
function renderFactor(key) {
  q("#factor").replaceChildren(
    element("h3", factors[key][0]),
    element("p", factors[key][1]),
  );
}
if (q("#demographic")) {
  renderDemographic("all");
  renderFactor("gentrification");
  qa("[data-demographic]").forEach((button) =>
    button.addEventListener("click", () => {
      setPressed("[data-demographic]", button);
      renderDemographic(button.dataset.demographic);
    }),
  );
  qa("[data-factor]").forEach((button) =>
    button.addEventListener("click", () => {
      setPressed("[data-factor]", button);
      renderFactor(button.dataset.factor);
    }),
  );
  const geography = q("#geography");
  geography.append(
    element(
      "p",
      "Illustrative state counts from the original source code, described there as representative values based on population distribution. Not verified venue counts.",
      "source-note",
    ),
    renderTable(
      ["State", "Illustrative listings"],
      [
        ["California", 140],
        ["New York", 120],
        ["Florida", 95],
        ["Texas", 90],
        ["Ohio", 60],
        ["Illinois", 58],
        ["Pennsylvania", 55],
      ],
    ),
  );
  const trends = element("details");
  trends.append(
    element("summary", "Explore the original trend series"),
    element(
      "p",
      "Approximate trajectory from the source code. These values are illustrative, not a verified time series.",
    ),
    renderTable(
      ["Year", "Illustrative listings"],
      [
        ["2002", 1600],
        ["2005", 1550],
        ["2008", 1480],
        ["2011", 1350],
        ["2014", 1200],
        ["2017", 1080],
        ["2019", 1000],
      ],
    ),
  );
  q("#demographic").after(trends);
}
