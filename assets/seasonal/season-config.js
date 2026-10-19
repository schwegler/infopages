/* Add reviewed seasons and their date windows here; no controller rewrite required. */
window.SchwegSeasonalConfig = {
  schemaVersion: 2,
  invitationDelayMs: 1000,
  profile: {
    id: "andrew",
    character: "Andrew",
    placement: "main",
  },
  seasons: [
    {
      id: "halloween-2026",
      theme: "halloween",
      label: "Halloween",
      enabled: true,
      window: {
        from: "2026-10-01",
        until: "2026-11-01",
      },
      asset: "mascot.png",
      kicker: "HALLOWEEN / 2026",
      title: "A little practical magic.",
      detail:
        "Orange skies, pencil-wand spells and a friendly little haunting.",
      prompt: "Let\u2019s make a little magic.",
    },
  ],
};
