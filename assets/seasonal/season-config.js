/* Approved dated PNG packs. Display copy and decorations belong to the pack. */
window.SchwegSeasonalConfig = {
  schemaVersion: 2,
  invitationDelayMs: 1000,
  profile: {
    id: "andrew",
    character: "Andrew",
  },
  seasons: [
    {
      id: "halloween-2026",
      theme: "halloween",
      label: "Halloween",
      enabled: true,
      window: {
        from: "2026-10-18",
        until: "2026-11-01",
      },
      asset: "mascot.png",
      scheme: "dark",
      tooltip: "make it weird",
      notice: "well. it\u2019s haunted now.",
      decorations: [
        "moon",
        "moon-stars",
        "pumpkin pumpkin-one",
        "pumpkin pumpkin-two",
        "wisp wisp-one",
        "wisp wisp-two",
        "sparkles sparkles-one",
        "sparkles sparkles-two",
      ],
    },
  ],
};
