# Connify - Account Deletion Google Form Setup Guide

Use the data below to build your official **Google Form for Account Deletion Requests**. This form satisfies **Google Play Console Data Safety & Account Deletion Policy** and **Apple App Store Guideline 5.1.1(v)** requirements.
https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform
---

## Form Header Configuration

- **Form Title**: `Connify — Account & Data Deletion Request`
- **Form Description**:  
  > Use this form to request permanent deletion of your **Connify** account, personal profile data, emergency guardian contacts, medical notes, and associated incident telemetry. In accordance with Google Play and App Store Data Safety requirements, your data will be permanently wiped within 48 hours of verification.

---

## Form Questions & Fields

### Question 1: Account Email Address
- **Question Text**: `Registered Email Address`
- **Help Text / Description**: `Enter the email address associated with your Connify account or Google OAuth sign-in.`
- **Question Type**: `Short answer`
- **Response Validation**: `Text -> Email`
- **Required**: `Yes`

### Question 2: Account Holder Name
- **Question Text**: `Full Name`
- **Help Text / Description**: `Enter your full name as registered in the Connify app profile.`
- **Question Type**: `Short answer`
- **Required**: `Yes`

### Question 3: Registered Phone Number
- **Question Text**: `Registered Phone Number`
- **Help Text / Description**: `Include country code (e.g., +15550199 or +919876543210).`
- **Question Type**: `Short answer`
- **Required**: `Yes`

### Question 4: Connify Node Identity / UID (Optional)
- **Question Text**: `Hardware Node Identity / Google UID (If known)`
- **Help Text / Description**: `Found under Profile -> Google Account Information in the app (e.g. UID or Node Hex).`
- **Question Type**: `Short answer`
- **Required**: `No`

### Question 5: Reason for Account Deletion
- **Question Text**: `Reason for Account Deletion`
- **Question Type**: `Multiple choice`
- **Options**:
  - `I no longer use the Connify app`
  - `Privacy / Data collection concerns`
  - `Creating a new account`
  - `Temporary account removal`
  - `Other`
- **Required**: `No`

### Question 6: Data Deletion Scope Checklist
- **Question Text**: `Select Data to be Permanently Wiped`
- **Help Text / Description**: `Confirm the categories of data you wish to be permanently removed.`
- **Question Type**: `Checkboxes`
- **Options**:
  - `[x] User Account & Identity Profile (Name, Email, OAuth Tokens)`
  - `[x] Emergency Guardian Contacts & Phone Numbers`
  - `[x] Medical Profile & Health Notes (Blood Group, Allergies, Conditions)`
  - `[x] Incident Audit History & Telemetry Blackbox Logs`
  - `[x] Cryptographic Device Credentials (Ed25519 Public Keys & Device Fingerprints)`
- **Required**: `Yes`

### Question 7: Confirmation & Verification Acknowledgement
- **Question Text**: `Account Owner Confirmation`
- **Question Type**: `Checkboxes`
- **Options**:
  - `I confirm that I am the authorized owner of this Connify account. I understand that account deletion is permanent, irreversible, and clears all emergency guardian links.`
- **Required**: `Yes`

---

## Form Settings & Automated Confirmation

1. **Collect email addresses**: `Enabled (Verified or Input)`
2. **Send responders a copy of their response**: `Always`
3. **Confirmation Message**:  
   > *Thank you for your request. Your Connify account deletion request has been submitted successfully. Our privacy team will verify your request and permanently purge your account data within 24 to 48 hours. You will receive a confirmation email once complete.*
