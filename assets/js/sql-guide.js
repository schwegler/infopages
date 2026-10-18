import { q, qa, setPressed } from "./dom.js";
import { permissionCopy, missionResult } from "./model.js";
let permission = "SAFE";
qa("[data-permission]").forEach((button) =>
  button.addEventListener("click", () => {
    permission = button.dataset.permission;
    setPressed("[data-permission]", button);
    q("#permission-text").textContent = permissionCopy[permission];
    q("#console").textContent =
      "Permission changed. Ready to run the local demonstration.";
  }),
);
q("#run-mission").addEventListener("click", () => {
  q("#console").textContent = missionResult(
    permission,
    q("#payload").value.length,
  );
});
q("#reset-mission")?.addEventListener("click", () => {
  permission = "SAFE";
  const safe = q('[data-permission="SAFE"]');
  setPressed("[data-permission]", safe);
  q("#permission-text").textContent = permissionCopy.SAFE;
  q("#payload").value = "<p>Hello, world.</p>";
  q("#console").textContent =
    "Ready. Select a permission level, then run the demonstration.";
});

q("#experiment-status")?.setAttribute("hidden", "");
