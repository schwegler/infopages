export const permissionCopy = Object.freeze({
  SAFE: "SAFE restricts access to external resources. Outbound network access is unavailable.",
  EXTERNAL_ACCESS:
    "EXTERNAL_ACCESS permits external resources subject to SQL Server deployment, trust and authorization requirements.",
  UNSAFE:
    "UNSAFE grants broader access. It is not a shortcut around a secure integration design.",
});
export function missionResult(permission, payloadLength) {
  if (!Object.hasOwn(permissionCopy, permission))
    throw new RangeError("Unknown permission level");
  const lines = [`> Checking permission boundary: ${permission}`];
  if (permission === "SAFE")
    lines.push(
      "> Outbound HTTP request blocked.",
      "> Result: external resource access is unavailable.",
    );
  if (permission === "EXTERNAL_ACCESS")
    lines.push(
      "> Simulated HTTPS request authorized.",
      "> Result: response validation complete. No network request was sent.",
    );
  if (permission === "UNSAFE")
    lines.push(
      "> Review required: broader privileges increase risk.",
      "> Result: choose the least privileged suitable design.",
    );
  lines.push(
    `> Local payload: ${payloadLength} characters. Content is never executed or transmitted.`,
  );
  return lines.join("\n");
}
export function filterEvents(events, year) {
  return events.filter(
    (event) => year === "all" || String(event.year) === String(year),
  );
}
export function relatedEvents(events, name) {
  return events
    .filter((event) => `${event.title} ${event.description}`.includes(name))
    .sort((a, b) => a.year - b.year);
}
export const securityCopy = Object.freeze({
  tde: "Encrypts database files at rest. Validate certificate and key backup procedures before migration.",
  ae: "Protects selected sensitive columns with keys controlled outside the database engine. Validate client driver support and key access.",
  hsts: "Directs browsers to use HTTPS. Test certificates and web application behavior as part of the wider migration.",
  audit:
    "Records relevant database or application events. Define retention, review and access controls for audit records.",
});
