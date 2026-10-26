/* ForgeHype leads: Google Apps Script that receives website form submissions into this Sheet
   and emails an alert for each one.

   SETUP (once, about 5 minutes, signed in as ForgeHypeqatar@gmail.com)
   1. Create a new Google Sheet named "ForgeHype leads".
   2. Extensions > Apps Script. Delete the sample code, paste this whole file, click Save.
   3. Deploy > New deployment > type: Web app.
        Description: ForgeHype leads
        Execute as: Me
        Who has access: Anyone
      Click Deploy, approve the permissions (Advanced > Go to project if Google warns it is unverified; it is your own script).
   4. Copy the Web app URL (ends in /exec) and send it to Claude. It goes into LEADS_URL in assets/js/main.js.
   Re-deploying after an edit: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy. The URL stays the same.
*/

const ALERT_TO = 'ForgeHypeqatar@gmail.com';
const SHEET = 'Leads';
const HEADERS = ['Received', 'Source', 'Business type', 'Interests', 'Website / Instagram', 'Email', 'Biggest problem', 'Consent', 'Page', 'Status', 'Notes'];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.botcheck) return out({ ok: true });                       // honeypot filled: silently ignore
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET);
    if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEADERS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold'); }
    const now = new Date();
    const row = [now, s(p.source) || 'Book a call', s(p.type), s(p.interests), s(p.website), s(p.email), s(p.message), p.consent ? 'Yes' : 'No', s(p.page), 'New', ''];
    sh.appendRow(row);
    sh.autoResizeColumns(1, HEADERS.length);
    const subject = 'New lead: ' + (s(p.type) || 'unknown business') + (s(p.email) ? ' (' + s(p.email) + ')' : '');
    const body = ['New enquiry from the ForgeHype website', '',
      'Source: ' + (s(p.source) || 'Book a call'), 'Business type: ' + s(p.type), 'Interests: ' + s(p.interests),
      'Website / Instagram: ' + s(p.website), 'Email: ' + s(p.email), 'Biggest problem: ' + s(p.message),
      'Consent: ' + (p.consent ? 'Yes' : 'No'), 'Page: ' + s(p.page), '', 'Sheet: ' + ss.getUrl()].join('\n');
    MailApp.sendEmail({ to: ALERT_TO, subject: subject, body: body });
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function doGet() { return out({ ok: true, service: 'ForgeHype leads' }); }

function s(v) { return v == null ? '' : String(v).slice(0, 2000); }
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
