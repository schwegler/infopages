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
