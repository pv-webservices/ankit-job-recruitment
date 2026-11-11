// Ankit Jobs & Staffing India — form receiver.
// Bound to the "Ankit Jobs – Website Applications" Google Sheet.
// Deploy: Deploy > New deployment > Web app · Execute as: Me · Who has access: Anyone.
// Candidate and recruiter submissions are appended as rows; uploaded files are
// saved privately to a Drive folder and linked from the row.

var MAX_FILE_BYTES = 5 * 1024 * 1024;
var MAX_TEXT = 1000;
var ROOT_FOLDER_NAME = 'Ankit Jobs - Website Uploads';
var ALLOWED_TYPES = {
  'application/pdf': true,
  'application/msword': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'image/jpeg': true,
  'image/png': true
};
var FORMS = {
  candidate: {
    sheet: 'Candidates',
    folder: 'Candidate Resumes',
    fields: ['name', 'fatherName', 'motherName', 'gender', 'dob', 'age', 'mobile', 'alternativeMobile', 'email', 'qualification', 'state', 'district'],
    headers: ['Full name', 'Father name', 'Mother name', 'Gender', 'Date of birth', 'Age', 'Mobile', 'Alternative mobile', 'Email', 'Qualification', 'State', 'District'],
    required: ['name', 'fatherName', 'motherName', 'gender', 'dob', 'mobile', 'email', 'qualification', 'state', 'district'],
    fileLabel: 'Resume (Drive link)'
  },
  recruiter: {
    sheet: 'Recruiters',
    folder: 'Recruiter Job Descriptions',
    fields: ['companyName', 'industry', 'contactPerson', 'designation', 'mobile', 'email', 'service', 'jobRole', 'openings', 'jobLocation', 'details'],
    headers: ['Company', 'Industry', 'Contact person', 'Designation', 'Mobile', 'Email', 'Service required', 'Job role', 'Openings', 'Job location', 'Requirement details'],
    required: ['companyName', 'industry', 'contactPerson', 'designation', 'mobile', 'email', 'service', 'jobRole', 'openings', 'jobLocation'],
    fileLabel: 'Job description (Drive link)'
  }
};

function doGet() {
  return json({ ok: true, service: 'Ankit Jobs form receiver' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var form = FORMS[body.formType];
    if (!form) return json({ ok: false, error: 'Unknown form.' });
    if (body.website) return json({ ok: true, ref: 'OK' }); // honeypot: silently drop bots

    var cache = CacheService.getScriptCache();
    var submissionId = clean(body.submissionId).slice(0, 64);
    if (submissionId && cache.get(submissionId)) return json({ ok: true, ref: cache.get(submissionId) });

    var data = body.fields || {};
    for (var i = 0; i < form.required.length; i++) {
      if (!clean(data[form.required[i]])) return json({ ok: false, error: 'Please complete all required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.email))) return json({ ok: false, error: 'Please enter a valid email.' });

    var ref = (body.formType === 'candidate' ? 'C-' : 'R-') + Utilities.getUuid().slice(0, 8).toUpperCase();
    var fileUrl = body.file && body.file.data ? saveFile(body.file, form, ref, clean(data.name || data.companyName)) : '';

    lock.waitLock(15000);
    var sheet = getSheet(form);
    var row = [new Date(), ref];
    for (var j = 0; j < form.fields.length; j++) row.push(safeCell(data[form.fields[j]]));
    row.push(fileUrl);
    sheet.appendRow(row);
    if (submissionId) cache.put(submissionId, ref, 21600);
    return json({ ok: true, ref: ref });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: err && err.userMessage ? err.userMessage : 'Submission failed. Please try again or call us.' });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function saveFile(file, form, ref, owner) {
  var type = clean(file.mimeType);
  if (!ALLOWED_TYPES[type]) throw userError('Please upload a PDF, Word document, JPG or PNG file.');
  var bytes = Utilities.base64Decode(String(file.data));
  if (bytes.length > MAX_FILE_BYTES) throw userError('Files must be 5 MB or smaller.');
  var safeName = (ref + ' - ' + owner + ' - ' + clean(file.name)).replace(/[\\\/:*?"<>|]/g, '_').slice(0, 150);
  var saved = getFolder(form.folder).createFile(Utilities.newBlob(bytes, type, safeName));
  return saved.getUrl();
}

function getSheet(form) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(form.sheet) || book.insertSheet(form.sheet);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted at', 'Reference'].concat(form.headers, [form.fileLabel]));
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#061b4c').setFontColor('#ffc928');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getFolder(name) {
  var props = PropertiesService.getScriptProperties();
  var key = 'folder:' + name;
  var id = props.getProperty(key);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (missing) {}
  }
  var rootId = props.getProperty('folder:root');
  var root = null;
  if (rootId) {
    try { root = DriveApp.getFolderById(rootId); } catch (missing) {}
  }
  if (!root) {
    root = DriveApp.createFolder(ROOT_FOLDER_NAME);
    props.setProperty('folder:root', root.getId());
  }
  var folder = root.createFolder(name);
  props.setProperty(key, folder.getId());
  return folder;
}

// Run once from the editor to create both tabs, the Drive folders and grant permissions.
function setup() {
  getSheet(FORMS.candidate);
  getSheet(FORMS.recruiter);
  getFolder(FORMS.candidate.folder);
  getFolder(FORMS.recruiter.folder);
  var first = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  if (first && first.getLastRow() === 0 && SpreadsheetApp.getActiveSpreadsheet().getSheets().length > 2) {
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(first);
  }
}

function clean(value) {
  return String(value == null ? '' : value).trim().slice(0, MAX_TEXT);
}

// Stop spreadsheet formula injection from user-supplied text.
function safeCell(value) {
  var text = clean(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function userError(message) {
  var err = new Error(message);
  err.userMessage = message;
  return err;
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
