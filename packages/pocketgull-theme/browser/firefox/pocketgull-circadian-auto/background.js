// PocketGull Circadian Auto Switcher for Firefox
const THEMES = {
  washi: {
  "frame": "#f0ebe1",
  "frame_inactive": "#f5efe5",
  "tab_selected": "#faf8f0",
  "tab_background_text": "#78716c",
  "tab_text": "#18181b",
  "tab_line": "#0f766e",
  "toolbar": "#faf8f0",
  "toolbar_text": "#18181b",
  "toolbar_field": "#faf8f0",
  "toolbar_field_text": "#18181b",
  "toolbar_top_separator": "#e5dfd3",
  "toolbar_bottom_separator": "#e5dfd3",
  "icons": "#0f766e",
  "ntp_background": "#faf8f0",
  "ntp_text": "#18181b"
},
  hemp: {
  "frame": "#e2dccf",
  "frame_inactive": "#eae5d8",
  "tab_selected": "#f2efe6",
  "tab_background_text": "#78716c",
  "tab_text": "#2c3529",
  "tab_line": "#15803d",
  "toolbar": "#f2efe6",
  "toolbar_text": "#2c3529",
  "toolbar_field": "#f2efe6",
  "toolbar_field_text": "#2c3529",
  "toolbar_top_separator": "#d8d3c3",
  "toolbar_bottom_separator": "#d8d3c3",
  "icons": "#15803d",
  "ntp_background": "#f2efe6",
  "ntp_text": "#2c3529"
},
  scotopic: {
  "frame": "#050000",
  "frame_inactive": "#050000",
  "tab_selected": "#0e0202",
  "tab_background_text": "#7a1a1a",
  "tab_text": "#ff9988",
  "tab_line": "#ff2211",
  "toolbar": "#0e0202",
  "toolbar_text": "#ff6655",
  "toolbar_field": "#050000",
  "toolbar_field_text": "#ff6655",
  "toolbar_top_separator": "#3d0a0a",
  "toolbar_bottom_separator": "#3d0a0a",
  "icons": "#ff2211",
  "ntp_background": "#050000",
  "ntp_text": "#ff6655"
}
};

function getActiveCircadianKey() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  if (h >= 8 && h < 13) {
    return 'washi';     // 08:00 AM - 01:00 PM Daylight
  } else if (h >= 13 && (h < 19 || (h === 19 && m < 30))) {
    return 'hemp';      // 01:00 PM - 07:30 PM Focus
  } else {
    return 'scotopic';  // 07:30 PM - 08:00 AM Night 650nm
  }
}

function applyCircadianTheme() {
  const key = getActiveCircadianKey();
  const colors = THEMES[key];
  if (colors && browser.theme && browser.theme.update) {
    browser.theme.update({ colors });
    console.log('[PocketGull] Applied Circadian Browser Theme:', key);
  }
}

// Check every 60 seconds
browser.alarms.create('circadian-check', { periodInMinutes: 1 });
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'circadian-check') {
    applyCircadianTheme();
  }
});

// Run on startup
applyCircadianTheme();
