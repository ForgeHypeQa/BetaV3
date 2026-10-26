/* ForgeHype leads: Google Apps Script that receives website form submissions into this Sheet,
   emails an alert to the owner, and auto-replies to audit requests that include an email.

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

   Two sheets are kept: "Bookings" (consultation requests, which also open WhatsApp) and "Audits" (free audit requests).
*/

const ALERT_TO = 'ForgeHypeqatar@gmail.com';
const FROM_NAME = 'ForgeHype';
const H_BOOK = ['Received', 'Business type', 'Interests', 'Website', 'Notes', 'Consent', 'Page', 'Status', 'Follow-up'];
const H_AUDIT = ['Received', 'Business type', 'Website / company', 'WhatsApp', 'Email', 'Online presence', 'Operations', 'AI integration', 'Consent', 'Page', 'Status', 'Report sent', 'Meeting'];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.botcheck) return out({ ok: true });                       // honeypot filled: silently ignore
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();
    const audit = s(p.source) === 'Free audit';
    const sh = sheet(ss, audit ? 'Audits' : 'Bookings', audit ? H_AUDIT : H_BOOK);
    let subject, body;
    if (audit) {
      sh.appendRow([now, s(p.type), s(p.website), s(p.whatsapp), s(p.email), s(p.online), s(p.operations), s(p.ai), p.consent ? 'Yes' : 'No', s(p.page), 'New', '', '']);
      subject = 'Audit request: ' + (s(p.website) || s(p.type));
      body = ['New FREE AUDIT request from the website', '', 'Business type: ' + s(p.type), 'Website / company: ' + s(p.website),
        'WhatsApp: ' + s(p.whatsapp), 'Email: ' + s(p.email), '', 'Online presence: ' + s(p.online), 'Operations: ' + s(p.operations), 'AI integration: ' + s(p.ai),
        '', 'Next: review, send the report, then book the meeting.', 'Sheet: ' + ss.getUrl()].join('\n');
      if (s(p.email)) autoReply(s(p.email), s(p.website) || s(p.type));
    } else {
      sh.appendRow([now, s(p.type), s(p.interests), s(p.website), s(p.message), p.consent ? 'Yes' : 'No', s(p.page), 'New', '']);
      subject = 'Booking request: ' + s(p.type);
      body = ['New CONSULTATION booking from the website (the visitor was sent to WhatsApp)', '', 'Business type: ' + s(p.type), 'Interests: ' + s(p.interests),
        'Website: ' + s(p.website), 'Notes: ' + s(p.message), '', 'Sheet: ' + ss.getUrl()].join('\n');
    }
    MailApp.sendEmail({ to: ALERT_TO, subject: subject, body: body, name: FROM_NAME });
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

/* automatic "received" reply to the visitor; edit the wording here */
function autoReply(to, name) {
  const subject = 'Your free audit request is received';
  const body = ['Hi,', '',
    'Thanks for asking ForgeHype for a free audit of ' + name + '.', '',
    'Here is what happens next:',
    '1. We review your online presence: website, Google, social and anything you told us about operations and AI.',
    '2. We send you the report the way you asked (WhatsApp or email).',
    '3. We invite you to a short meeting to go through it together and agree the next step.', '',
    'If you want to add anything in the meantime, reply to this email or message us on WhatsApp: +974 7006 9544.', '',
    'ForgeHype', 'Website design and digital growth consultancy, Doha', 'forgehype.qa'].join('\n');
  MailApp.sendEmail({ to: to, subject: subject, body: body, name: FROM_NAME, replyTo: ALERT_TO });
}

function doGet() { return out({ ok: true, service: 'ForgeHype leads' }); }

function sheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); sh.getRange(1, 1, 1, headers.length).setFontWeight('bold'); }
  return sh;
}
function s(v) { return v == null ? '' : String(v).slice(0, 3000); }
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
