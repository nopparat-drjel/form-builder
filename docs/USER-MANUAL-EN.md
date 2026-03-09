# HR FormKit User Manual

**For Human Resources Personnel**
**Version 1.0 | March 2026**

---

## Table of Contents

1. [Login](#1-login)
2. [Dashboard](#2-dashboard)
3. [Form Management](#3-form-management)
4. [Creating and Editing Forms (Form Builder)](#4-creating-and-editing-forms-form-builder)
5. [Sharing Forms](#5-sharing-forms)
6. [Filling out Forms (Applicant View)](#6-filling-out-forms-applicant-view)
7. [Managing Applications (Responses)](#7-managing-applications-responses)
8. [Export and Print](#8-export-and-print)
9. [Logout](#9-logout)

---

## 1. Login

### Login Steps

1. Open your browser (Google Chrome or Microsoft Edge recommended).
2. Enter the website address: **https://hr-form-frontend.vercel.app/login**
3. Enter the following information:
   - **Email:** admin@hrformkit.com
   - **Password:** Admin@1234
4. Click the **"Login"** button.
5. The system will automatically take you to the Dashboard.

> **Note:** The system will remember your login status. If not used for a long time, the session will renew automatically. You do not need to log in every time.

> **Security Tip:** Do not share your login credentials and avoid logging in on public computers.

---

## 2. Dashboard

The Dashboard is the main page you will see after logging in, designed to give you an immediate overview of the system.

### Dashboard Components

#### Stats Cards

At the top of the page, 3 stat cards are displayed:

| Card | Meaning |
|---|---|
| Total Responses | Cumulative number of applications received in the system. |
| New Today | Number of applications submitted today. |
| Total Forms | Number of forms created in the system. |

#### Recent Responses

- Displays the **5 most recent** applications.
- You can click any item to view its details.
- Click the star icon (★) to bookmark important applications.

#### Quick Action Cards

At the bottom, 2 shortcut buttons are displayed:

- **"Create Form"** — Click to start building a new form immediately.
- **"View Responses"** — Click to go to the full list of applications.

#### Onboarding Banner

If you have no forms in the system yet, an onboarding banner will appear. Click **"Create your first form"** to get started.

---

## 3. Form Management

The **"Forms"** menu in the left sidebar takes you to the list of all forms.

### 3.1 View Form List

This page shows all created forms with the following info:

- Form Name and Description
- Status: **Active** (Green) or **Inactive** (Gray)
- Number of responses received
- Creation date

### 3.2 Create New Form

1. Click the **"+ Create Form"** button in the top right corner.
2. Fill in the popup window:
   - **Form Name** (Required): e.g., "Marketing Officer Job Application"
   - **Description** (Optional): e.g., "Application form for March 2026 intake"
3. Click the **"Create"** button.
4. The system will create the form and open the Form Builder for you to edit.

### 3.3 Enable/Disable Forms

- Click the Toggle switch next to the form name.
- **"Active" Status:** Applicants can access and fill out the form.
- **"Inactive" Status:** The form link will be temporarily disabled.

> **Tip:** Disable forms when the recruitment period ends to prevent new submissions. Existing application data remains in the system.

### 3.4 Edit Form

Click the **"Edit"** button or click on the form name to enter the Form Builder.

### 3.5 Delete Form

1. Click the **"Delete"** button (trash icon) in the form's row.
2. A confirmation dialog will appear to prevent accidental deletion.
3. Click **"Confirm Delete"** to proceed.

> **Warning:** Deleting a form will remove all associated data, including all submitted responses. This action cannot be undone.

---

## 4. Creating and Editing Forms (Form Builder)

The Form Builder is a Drag-and-Drop tool designed for ease of use without technical knowledge.

### 4.1 Form Builder Structure

The Form Builder page is divided into 3 parts:

| Part | Position | Function |
|---|---|---|
| Block Palette | Left | List of all block types available to build the form. |
| Canvas | Middle | Displays the form being built. Drag and drop blocks here. |
| Settings | Right | Customize the currently selected block. |

### 4.2 11 Block Types

#### Content Group

| Block Type | Usage |
|---|---|
| **Heading** | Insert main or sub-headings, e.g., "Personal Info" or "Education History". |
| **Paragraph** | Insert descriptions, instructions, or notices, e.g., "Please fill in all fields correctly". |

#### Input Fields Group

| Block Type | Usage | Example |
|---|---|---|
| **Short Answer** | For 1-line short text. | Full Name, Position Applied For |
| **Long Answer** | For multi-line text. | Short Bio, Reason for Interest |
| **Email** | For email addresses with auto-validation. | Contact Email |
| **Phone** | For phone numbers. | Mobile Number |
| **Number** | For numeric data only. | Age, Expected Salary |
| **Date** | For selecting a date from a calendar. | Date of Birth, Start Date |

#### Choice Fields Group

| Block Type | Usage | Example |
|---|---|---|
| **Dropdown** | Select 1 option from a list. Good for long lists. | Province, Education Level |
| **Multiple Choice / Radio** | Select only 1 option. All options visible. | Gender, Job Type (Full-time / Part-time) |
| **Checkboxes** | Select multiple options. | Skills, Languages |

#### File Group

| Block Type | Usage | Example |
|---|---|---|
| **File Upload** | Allow applicants to attach files. | Resume, Photo, Supporting Docs |

### 4.3 Adding Blocks to a Form

**Method 1: Drag & Drop**
1. Hover over the desired block in the Block Palette on the left.
2. Click, hold, and drag it to the desired position in the Canvas.

**Method 2: Click to Add**
1. Click a block in the Block Palette.
2. The block will be added to the end of the form automatically.

### 4.4 Reordering Blocks

- Hover over a block in the Canvas; a drag handle icon will appear.
- Click and hold the handle to drag the block to a new position.

### 4.5 Block Settings

1. Click any block in the Canvas.
2. The Settings panel on the right will update to show that block's options.

**Adjustable Options:**

| Setting | Meaning |
|---|---|
| Label | The question text shown to the applicant. |
| Placeholder | Example text shown inside the field, e.g., "Enter your first name". |
| Required | Toggle whether this field must be filled. |
| Options | For Dropdown, Radio, Checkboxes — Add, edit, or delete choices. |

> **Tip:** Fields with a red * are "Required". Applicants must fill these before they can submit the form.

### 4.6 Uploading Organization Logo

1. In the Canvas, click the logo area at the top of the form.
2. Select an image file from your computer (Supports JPG, PNG, WebP).
3. The system will automatically resize the image (approx. 400 x 200 pixels).

### 4.7 Saving the Form

- The system **Auto-saves** every change (within 1.5 seconds).
- The top right corner shows **"Saved"** status when data is successfully stored.
- You do not need to click save manually.

### 4.8 Previewing the Form

1. Click the **"Preview"** button at the top right of the Form Builder.
2. The system will open the preview in a new tab.
3. The preview page displays a yellow bar at the top with **"Preview Mode"**.
4. You can check the form's appearance before sharing it with applicants.

---

## 5. Sharing Forms

Once designed, you can generate a link to send to applicants.

### Steps to Generate a Share Link

1. Go to the **"Forms"** page.
2. Find the form you want to share.
3. Click the **"Share"** button (arrow icon).
4. Choose the link expiration period:

| Option | Suitable For |
|---|---|
| **7 Days** | Urgent hiring or short-term opening. |
| **30 Days** | General recruitment (Recommended). |
| **90 Days** | Mid-term projects. |
| **365 Days** | Year-round rolling recruitment. |

5. Click **"Generate Link"**.
6. Click **"Copy Link"** to copy it to your clipboard.
7. Paste the link in Email, LINE, or other communication channels.

> **Note:** Applicants do not need an account; they can open the link and fill it out immediately.

> **Tip:** Ensure the form status is "Active" before sharing the link.

---

## 6. Filling out Forms (Applicant View)

### What Applicants Need to Do

1. Open the received link in a browser (Mobile and Desktop supported).
2. Fill in the information in each field.
3. Fields with **"*"** are required.
4. Click **"Submit Form"** when complete.
5. The system shows a confirmation page with a success animation.

### If the Link Doesn't Work

| Message Displayed | Cause | Resolution |
|---|---|---|
| 404 Page (Form Not Found) | Invalid link. | Check if the sent link is correct. |
| 410 Page (Form Expired) | Link has expired. | Generate a new link and resend to the applicant. |

---

## 7. Managing Applications (Responses)

The **"Responses"** menu in the left sidebar takes you to the list of all applications.

### 7.1 Filtering and Searching

- **Search:** Type name or email in the search box.
- **Filter by Status:** New / Reviewing / Approved / Rejected.
- **Filter Starred:** To see only bookmarked applications.

### 7.2 Application Status

| Status | Meaning |
|---|---|
| **New** | Newly submitted applications, not yet reviewed. |
| **Reviewing** | Currently under consideration. |
| **Approved** | Selected/Passed. |
| **Rejected** | Not selected. |

### 7.3 Viewing Application Details (Response Drawer)

1. Click on the row of the desired application.
2. A data panel will slide out from the right.
3. View personal info, all answers, and attached files.

### 7.4 Changing Status

In the Response Drawer, click the Status Dropdown → Select new status → Saves immediately.

### 7.5 Starring

Click the star icon (★) to mark important applications — Gold Star = Starred.

### 7.6 Deleting Applications

In the Response Drawer → Click "Delete" → 2-step confirmation.

> **Warning:** Deletion is permanent and cannot be recovered.

---

## 8. Export and Print

### 8.1 Export Data as CSV (Excel)

1. Go to the **"Responses"** page.
2. Apply filters as desired.
3. Click the **"Export CSV"** button in the top right.
4. The file will download automatically.

> **Note:** The file uses UTF-8 with BOM format to support Thai text in Microsoft Excel. It also handles empty cells correctly for easier data processing.

### 8.2 Print Application as PDF

1. Open the Response Drawer of the desired application.
2. Click the **"Print"** button.
3. The browser will open the print dialog in A4 layout.
4. Select **"Save as PDF"** or choose a printer → Click **"Print"**.

---

## 9. Logout

1. Look at the left sidebar menu.
2. Scroll down to the bottom.
3. Click the **"Logout"** button.
4. The system will return you to the login page.

> **Tip:** Please log out after every use, especially on public computers.

---

## Appendix: FAQ

**Q: I forgot my password, what should I do?**
A: Please contact your IT administrator to reset your password.

**Q: How many forms can I create?**
A: There is no limit. You can create as many as needed.

**Q: Can applicants edit their application after submission?**
A: No. If edits are needed, HR must delete the old one and have them fill it out again.

**Q: How long is application data stored?**
A: Data is stored until you manually delete it.

**Q: If a form link expires, is the previously submitted data lost?**
A: No. Previous responses remain in the system; only new submissions through that link are blocked.

**Q: Can it be used on mobile?**
A: Yes, but for the Form Builder, using a desktop computer is recommended for the best experience.

---

*This manual is for HR FormKit Version 1.0 | March 2026*
