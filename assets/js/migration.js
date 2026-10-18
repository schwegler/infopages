import { barChart } from "./charts.js";
import { q, qa, setPressed } from "./dom.js";
import { securityCopy } from "./model.js";
qa(".checklist input").forEach((checkbox) =>
  checkbox.addEventListener("change", () => {
    q("#assessment-status").textContent =
      `${qa(".checklist input:checked").length} of 4 assessment steps complete`;
  }),
);
q("#compare").addEventListener("click", () => {
  q("#comparison-charts").replaceChildren(
    barChart(
      [
        ["Improved", 0],
        ["Degraded", 0],
        ["Errors", 32],
        ["Stable", 1222],
      ],
      "Original source workload · illustrative counts",
      1254,
    ),
    barChart(
      [
        ["Improved", 953],
        ["Degraded", 12],
        ["Errors", 5],
        ["Stable", 284],
      ],
      "Original target workload · illustrative counts",
      1254,
    ),
  );
  q("#compare-result").hidden = false;
  q("#compare").textContent = "Comparison complete — run again";
  q("#compare").setAttribute("aria-expanded", "true");
});
q("#security").addEventListener(
  "change",
  (event) =>
    (q("#security-text").textContent = securityCopy[event.target.value]),
);
let step = 0;
q("#cutover").addEventListener("click", () => {
  const steps = qa("#cutover-list li");
  if (step === steps.length) {
    steps.forEach((node) => node.classList.remove("done"));
    step = 0;
    q("#cutover").textContent = "Run rehearsal";
    q("#cutover-status").textContent =
      "Reset. Ready for another local walkthrough.";
    return;
  }
  steps[step++].classList.add("done");
  q("#cutover-status").textContent =
    `${step} of ${steps.length} steps rehearsed. ${step === steps.length ? "Walkthrough complete. No systems were changed." : "Continue to the next step."}`;
  q("#cutover").textContent =
    step === steps.length ? "Reset rehearsal" : "Continue rehearsal";
});

const roleLabels = {
  web: "Web + SQL",
  api: "API database",
  data: "Data database",
};
const roleConnections = {
  web: ["api", "data"],
  api: ["web", "data"],
  data: ["web", "api"],
};
q("#dependency-controls").hidden = false;
qa("[data-role]").forEach((button) =>
  button.addEventListener("click", () => {
    const key = button.dataset.role;
    setPressed("[data-role]", button);
    qa("[data-edge]").forEach((edge) =>
      edge.classList.toggle(
        "selected",
        edge.dataset.edge.split("-").includes(key),
      ),
    );
    q("#dependency-result").textContent =
      roleLabels[key] +
      " connects to " +
      roleConnections[key].map((id) => roleLabels[id]).join(" and ") +
      ". Illustrative roles only.";
  }),
);
q('[data-role="web"]').click();

q("#experiment-status")?.setAttribute("hidden", "");
