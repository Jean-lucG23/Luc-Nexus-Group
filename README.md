# Luc Nexus Group Website

Upload the CONTENTS of this folder to public_html (not the folder itself). Keep `assets/` beside the HTML files.

- assets/luc-nexus-logo-transparent.png: logo (unchanged)
- assets/site.js: scroll animations, 3D effects, services chip-rail follow
- assets/depth.css: 3D depth styling (must be uploaded, every page links to it)
- send-confirmation.php: emails the visitor a confirmation after the consultation form is submitted (needs PHP hosting; see notes below)

Pages: index, about, services, process, contact, privacy-policy, terms, 404.

## Confirmation email notes
- Create the mailbox noreply@lucnexusgroup.com in your hosting panel (or change FROM_EMAIL at the top of send-confirmation.php to any address on your domain).
- Keep SPF/DKIM enabled for lucnexusgroup.com so the email lands in the inbox, not spam.
- Formspree still receives and notifies you exactly as before; the confirmation is an extra step.

## Update 13 Nov 2026
- New: speed-test.html, assets/consent.js (cookie consent, Google Consent Mode), assets/forms.js (form spam protection + booking calendar), assets/hero-logo.*, .htaccess (HTTPS, security headers, caching, 404).
- Upload everything, keeping the assets/ folder. .htaccess is a hidden file: enable "show hidden files" in your file manager.
- send-confirmation.php: optionally set TOKEN_SECRET (top of file) to any long random string.
- Booking is request-based: visitors pick a slot and you confirm. Edit hours in assets/forms.js (search 9;h<17).

## Update 14 Nov 2026
- Counters (home page): count 0 -> target every time they scroll into view, all over the same 1.8 s (`CDUR` in assets/site.js).
- About page: logo border removed, edges blended into the page with a soft glow.
- Forms (assets/forms.js): confirmation email now shows the visitor's real country; each submission gets a fresh single-use token; booking slot fields clear after a booking; country dropdown resets to South Africa.
- Contact page: labels linked to their fields, single `<h1>`.
- New small logos: assets/logo-96.webp (nav/footer) and assets/logo-640.webp (About). Upload both. The PNG stays for the favicon, social preview and structured data.
- send-confirmation.php: TOKEN_SECRET is now set. Keep this file private; changing the value only invalidates tokens already issued.
- .htaccess: added a Content-Security-Policy. It allows only this site, Google Analytics/Tag Manager, Formspree, Cloudflare speed test and Font Awesome (cdnjs). If you ever add a new external service (maps, chat widget, fonts, video), add its address to the matching directive, or it will be blocked. To trial a change safely, rename the header to Content-Security-Policy-Report-Only.
- site.js and forms.js links carry ?v=20261114. Change that number whenever you edit those files so visitors get the new version straight away.
