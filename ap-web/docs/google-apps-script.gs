/**
 * AP Helper — Google Sheet “picks” backend
 *
 * 1) Create a new Google Sheet (any name). You can link this script to that spreadsheet:
 *    Extensions → Apps Script → paste this file → Save.
 * 2) Run once: from the menu “AP Helper” → “Create Picks sheet (if missing)”
 *    (authorize when prompted).
 * 3) Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (pilot) — or restrict per your policy
 * 4) Copy the Web App URL into ap-web/.env.local as APPS_SCRIPT_PICKS_URL=
 *
 * Sheet tab: "Picks"
 * Headers: record_id | picked_at | site_url | om
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("AP Helper")
    .addItem("Create Picks sheet (if missing)", "setupPicksSheet")
    .addToUi();
}

/** Run manually once from the menu (or from the script editor Run). */
function setupPicksSheet() {
  getOrCreatePicksSheet_();
  SpreadsheetApp.getUi().alert(
    'Tab "Picks" is ready with headers. Deploy as Web App and paste URL into APPS_SCRIPT_PICKS_URL.',
  );
}

function getOrCreatePicksSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName("Picks");
  if (sh) return sh;
  sh = ss.insertSheet("Picks");
  sh.getRange(1, 1, 1, 4).setValues([
    ["record_id", "picked_at", "site_url", "om"],
  ]);
  sh.setFrozenRows(1);
  return sh;
}

function doGet() {
  try {
    var sheet = getOrCreatePicksSheet_();
    var values = sheet.getDataRange().getValues();
    var ids = [];
    for (var i = 1; i < values.length; i++) {
      var id = values[i][0];
      if (id) ids.push(String(id));
    }
    return ContentService.createTextOutput(
      JSON.stringify({ recordIds: ids }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ recordIds: [], error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = getOrCreatePicksSheet_();
    sheet.appendRow([
      body.recordId,
      new Date(),
      body.siteUrl || "",
      body.om || "",
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
