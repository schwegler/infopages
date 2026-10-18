import { q, qa } from "./dom.js";
import { securityCopy } from "./model.js";
qa(".checklist input").forEach((checkbox) =>
  checkbox.addEventListener("change", () => {
    q("#assessment-status").textContent =
      `${qa(".checklist input:checked").length} of 4 assessment steps complete`;
  }),
);
q("#compare").addEventListener("click", () => {
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
