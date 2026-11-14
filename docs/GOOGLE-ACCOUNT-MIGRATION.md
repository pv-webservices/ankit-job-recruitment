# Moving the forms to the client's Google account (Sheet + Drive)

Right now, website submissions go to a Google Sheet and Drive folder owned by **your** Google
account. The steps below set up a fresh copy in the **client's** Gmail, so the client owns the
Sheet, the Drive uploads and the script that receives them. Then the website is pointed at it.

Time needed: about 20 minutes. You need the client's Gmail login, or the client sitting with you.

> **Important — do this before (or together with) publishing this website update.** The new forms
> send `country`, `city` and `appliedFor`. The script running in your old account doesn't know these
> fields. Applicants from outside India would get "Please complete all required fields." Setting up
> the new script (step 3) fixes that.

---

## 1. Sign in to the client's account only

Apps Script often breaks when a browser is signed in to several Google accounts at once. Use a
**separate Chrome profile or an Incognito window** where only the client's Gmail is signed in.

## 2. Create the Google Sheet

1. Go to <https://sheets.google.com> and click **Blank spreadsheet**.
2. Rename it to **Ankit Jobs - Website Applications**.

## 3. Add the receiver script

1. In the Sheet, click **Extensions → Apps Script**.
2. Delete everything in `Code.gs`. Paste in the full contents of
   [`google-apps-script/Code.gs`](../google-apps-script/Code.gs) from this project.
3. Click the project name ("Untitled project") and rename it to **Ankit Jobs form receiver**.
4. Click **Save** (💾).

## 4. Run setup once (creates the tabs and the Drive folder)

1. In the function dropdown at the top, choose **`setup`**, then click **Run**.
2. Google will ask for permission. Click **Review permissions** and choose the client's account.
3. Google will show "Google hasn't verified this app". This is normal for your own script. Click
   **Advanced → Go to Ankit Jobs form receiver (unsafe) → Allow**.
4. Check the results:
   - The Sheet now has two tabs, **Candidates** and **Recruiters**, with bold header rows.
   - The client's Google Drive now has a folder called **Ankit Jobs - Website Uploads**, with
     **Candidate Resumes** and **Recruiter Job Descriptions** inside it.

## 5. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon ⚙ next to "Select type" and choose **Web app**.
3. Fill in the settings:
   - Description: `Website forms`
   - **Execute as: Me** (the client's account)
   - **Who has access: Anyone** (the website calls it without a login, so this is required)
4. Click **Deploy** and copy the **Web app URL**. It ends in `/exec` and looks like
   `https://script.google.com/macros/s/AKfy…/exec`.
5. Paste that URL into a browser tab. You should see:
   `{"ok":true,"service":"Ankit Jobs form receiver"}`

## 6. Point the website at the new URL

Choose **one** of these options:

- **Option A: edit the code.** Open [`src/data/site.ts`](../src/data/site.ts) and replace the URL
  inside `formEndpoint` with the new `/exec` URL.
- **Option B: use an environment variable (no code change).** In your hosting dashboard (Netlify /
  Cloudflare Pages / etc.), add `PUBLIC_FORM_ENDPOINT` = the new `/exec` URL.

Then rebuild and redeploy the site (`npm run build`, then upload or push as usual).

## 7. Test both forms on the live site

1. Submit **Candidate Zone** with a small PDF resume, choosing **India**.
2. Submit it again choosing another country (for example **United Arab Emirates**, with city
   **Dubai** and mobile **+971…**).
3. Submit **Recruiter Zone** with a job description file.
4. Confirm that each submission shows a reference number (`C-…` / `R-…`), that a new row appears
   in the client's Sheet, and that the files show up in the client's Drive folder.
5. Delete these test rows afterwards.

## 8. Bring over the old data (optional)

The old Sheet doesn't have the new **Applied for**, **Country** and **City** columns, so don't
paste old rows straight into the new tabs. Either:

- **Keep it as an archive (easiest).** In your account, open the old Sheet, click **Share**, add
  the client's Gmail as an **Editor**, then use **Share → Transfer ownership** to hand it over. Do
  the same for the **Ankit Jobs - Website Uploads** folder in your Drive, so the old resume links
  keep working.
- **Or merge it.** Copy the old rows column by column into the new tabs, leaving the new columns
  blank.

## 9. Switch off the old receiver

Once step 7 passes, go to your **old** account: open the old Sheet, then **Extensions → Apps
Script → Deploy → Manage deployments**. Select the deployment and click **Archive**. Nothing can
be sent to your account after that.

---

## Later changes to the script

If `Code.gs` changes again, paste the new code into the client's Apps Script editor and save.
Then go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. Editing the
existing deployment keeps the same `/exec` URL. A *New deployment* creates a different URL that
you'd then have to update on the website.

Header rows are only written when a tab is empty. If columns are added in future, add the matching
header cells in the Sheet by hand, in the same order as `headers` in `Code.gs`.
