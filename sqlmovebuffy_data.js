export const dmaFindings = [
    { id: 'compat', text: 'Prophecy of Incompatibility', note: 'A number of stored procedures are using a compatibility level from a bygone era. They may not behave as expected under the new magics of SQL 2019.', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'breaking', text: 'Curse of Breaking Change', note: 'The ancient `RAISERROR` incantation has been altered. Our scripts must be updated to the new syntax, lest they curdle.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'behavior', text: 'Glamour of Behavior Change', note: 'The `COUNT` spell, when used with an `OVER` clause, now calculates things differently. A subtle glamour that could lead to disastrously incorrect reports.', icon: 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M8 5a2 2 0 012-2h4a2 2 0 012 2M8 5v.01M16 5v.01M12 9a2 2 0 100 4 2 2 0 000-4z' },
    { id: 'deprecated', text: 'Whispers of Deprecation', note: 'The `sp_dboption` demon has been marked for death. Though it still functions, it will be vanquished in a future version. We must exorcise it now.', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }
];

export const servers = {
    web: { name: 'The Master\'s Lair', type: 'SQL + IIS', icon: 'M13 10V3L4 14h7v7l9-11h-7z', connections: ['api', 'data'] },
    api: { name: 'The Crypt', type: 'SQL Backend', icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414a1 1 0 01.707-.293H21', connections: ['web'] },
    data: { name: 'The Demon\'s Roost', type: 'SQL Backend', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', connections: ['web', 'api'] }
};

export const positions = { web: {top: '40%', left: '5%'}, api: {top: '5%', left: '70%'}, data: {top: '75%', left: '70%'} };

export const weaponData = {
    tde: { name: 'Transparent Data Encryption', desc: 'Encrypts your database files at rest. If a demon steals your hard drive, the data is just gibberish.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', color: 'blue' },
    ae: { name: 'Always Encrypted', desc: 'Encrypts specific sensitive columns. The keys are held by the application, so SQL Server itself can\'t see the plaintext.', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2h2v-2h2v-2h2l1.257-1.257A6 6 0 0115 7z', color: 'purple' },
    hsts: { name: 'IIS: HSTS Protocol', desc: 'A protection spell for your website that forces browsers to only communicate over secure HTTPS, preventing downgrade attacks.', icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2', color: 'green' },
    audit: { name: 'Unified Auditing', desc: 'Meticulously logs all activity on SQL and IIS. If a demon gets in, you\'ll have a full record of its every move.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5V3a2 2 0 012-2h2a2 2 0 012 2v2', color: 'yellow' }
};

export const cutoverSteps = [
    { id: 'final-log', text: 'Apply Final Log Backups', done: false },
    { id: 'iis-config', text: 'Migrate IIS Configuration', done: false },
    { id: 'deploy-app', text: 'Deploy Application Code to Cleveland', done: false },
    { id: 'validation', text: 'Run Final Data & App Validation', done: false },
    { id: 'dns', text: 'Redirect DNS to Cleveland', done: false },
    { id: 'online', text: 'Bring Cleveland Databases Online', done: false },
    { id: 'decom', text: 'Decommission Sunnydale (Salt and Burn)', done: false },
];

export const gilesPrompts = {
    'intro': 'Welcome. The Council has tasked us with this migration. It is... fraught with peril. Use the navigation to review each phase. I am here to assist with your research.',
    'phase-1': 'The Data Migration Assistant results are in. We have identified compatibility issues—some "breaking changes" that require immediate attention. We must consult the ancient texts (documentation) to resolve these before we can even think of moving.',
    'phase-2': 'Willow\'s testing spell—the DEA—has been most revealing. Comparing the Sunnydale workload against Cleveland shows a significant performance improvement, though there are a few degraded queries we must investigate. Better to find them now than in the heat of battle.',
    'phase-3': 'This dependency map outlines our evacuation route. Note the "Log Shipping" spells; they provide a continuous stream of data to Cleveland, ensuring we have a warm standby. It is a fragile chain, but a necessary one.',
    'phase-4': 'We are fortifying Cleveland with every protection available. Transparent Data Encryption for the data at rest, and Always Encrypted for our most sensitive secrets. And do not forget HSTS for the web server—we cannot allow any unencrypted whispers.',
    'phase-5': 'The final ritual. The cutover checklist must be followed sequentially. Final log backups, IIS migration, then the code deployment. Only when the ritual is complete can we safely close the Sunnydale connection.',
    'default': 'I am afraid I do not recall reading about that specific artifact. Perhaps check the index?'
};
