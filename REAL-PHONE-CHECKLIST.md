# 5-minute real-phone check (only what machines can't see)

Do this once per launch or big change, **after** `test all devices` passed. Use your own iPhone and one Android if you have one.

1. **Send yourself the link on WhatsApp** and open it from there (tests the WhatsApp/Viber built-in browser and the link preview card: name, title, picture).
2. **Microphone popup**: tap the record button. You should get one "Allow microphone?" question; allow it, speak 5 s, the level bars must move, play it back and hear yourself.
3. **Phone's own pickers**: tap the photo button. The phone should offer photos/camera only (no video or files menu that confuses people). Take or pick one photo.
4. **Send it** and wait for the thank-you page (and the confirmation email if you entered an email).
5. Tell Claude what looked odd (a screenshot is best). Claude deletes the test request **only if you ask**.

What the lab already covers automatically (no need to check by hand): texts and decisions on the page, layout on Windows/Mac/iPhone/Android screen sizes, Safari and Chrome behaviour, broken images, tiny buttons, sideways scrolling.
