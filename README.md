# WiiG Portal v57

- Fixed Account actions: Personal information lets the user update the demo phone number; Language shows available language choices and clearly indicates English translation is not yet implemented; Logout asks for confirmation and clears the local demo session and credits.
- Added a back button to the sign-in screen. It returns to the screen that requested authentication, falling back to Home when appropriate. On the OTP screen, the same back button returns to phone entry.
- Existing 7 games, image assets, play checks, payment prototype, and external-tab routing are preserved.

Demo only: authentication and account state are client-side and should be backed by a real server before production.
