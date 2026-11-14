<?php
/**
 * Luc Nexus Group: consultation confirmation email.
 * Called by contact.html AFTER Formspree has accepted the submission.
 * Sends the visitor a copy of what they submitted and a "we'll be in touch" note.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
date_default_timezone_set('Africa/Johannesburg');

const SITE_HOST   = 'lucnexusgroup.com';
const FROM_EMAIL  = 'noreply@lucnexusgroup.com';   // must be a mailbox/domain on your own hosting
const REPLY_EMAIL = 'luxnexusgroup@gmail.com';
const PHONE_TEXT  = '+27 (82) 472 0050';
const LOGO_URL    = 'https://lucnexusgroup.com/assets/luc-nexus-logo-transparent.png';
const SERVICES    = [
  'Basic Network Troubleshooting','Basic Connectivity Check','Device Configuration Support',
  'Network Assessment & Design','Network Implementation or Deployment',
  'Network Security, Optimization, & Cloud Integration','Discovery call'
];
const TOKEN_SECRET = 'c9e597ff152396f126fabed41949ab548ddfb3b45e1008352b404d6ac3fad582';   // keep private; any long random string (changing it only invalidates tokens already issued)

function out($ok, $code = 200, $err = null) {
  http_response_code($code);
  echo json_encode($err ? ['ok' => $ok, 'error' => $err] : ['ok' => $ok]);
  exit;
}
function clean($v, $max) {                        // single-line, no header injection
  $v = trim((string)$v);
  $v = preg_replace('/[\r\n\t]+/', ' ', $v);
  return mb_substr($v, 0, $max);
}
function esc($v) { return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function secret() {
  if (TOKEN_SECRET !== 'CHANGE_ME') return TOKEN_SECRET;
  $f = sys_get_temp_dir() . '/lng_secret'; $s = @file_get_contents($f);
  if (!$s) { $s = bin2hex(random_bytes(32)); @file_put_contents($f, $s, LOCK_EX); @chmod($f, 0600); }
  return $s;
}
function sign($t) { return hash_hmac('sha256', (string)$t, secret()); }
function hit($key, $win, $max) {            // sliding-window limiter with file locking
  $fp = @fopen(sys_get_temp_dir() . '/lng_' . md5($key), 'c+'); if (!$fp) return true;
  flock($fp, LOCK_EX); $now = time();
  $h = array_values(array_filter(array_map('intval', explode("\n", (string)stream_get_contents($fp))), fn($x) => $x && $now - $x < $win));
  $ok = count($h) < $max; if ($ok) $h[] = $now;
  ftruncate($fp, 0); rewind($fp); fwrite($fp, implode("\n", $h)); flock($fp, LOCK_UN); fclose($fp);
  return $ok;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['token'])) { $t = time(); echo json_encode(['t' => $t, 's' => sign($t)]); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 405, 'method');

// Only accept requests from our own site (Origin is required on POST)
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$host = strtolower((string)parse_url($origin, PHP_URL_HOST));
if ($origin === '' || ($host !== SITE_HOST && $host !== 'www.' . SITE_HOST)) out(false, 403, 'origin');

// Per-IP limit: 5 emails per hour
if (!hit('ip' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 3600, 5)) out(false, 429, 'rate');

// Collect + validate
$name    = clean($_POST['name'] ?? '', 120);
$email   = clean($_POST['email'] ?? '', 190);
$country = clean($_POST['country_name'] ?? '', 80);
$code    = clean($_POST['country_code'] ?? '', 8);
$phone   = clean($_POST['phone'] ?? '', 40);
$service = clean($_POST['service_required'] ?? '', 120);
$message = trim((string)($_POST['message'] ?? ''));
$message = mb_substr(str_replace("\r", '', $message), 0, 4000);

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 422, 'invalid');
// Anti-abuse: honeypot, signed single-use token (3s to 2h old), link cap, real mail domain, per-recipient and daily caps
if (($_POST['_gotcha'] ?? '') !== '') out(true);
$t = (int)($_POST['t'] ?? 0); $s = (string)($_POST['s'] ?? '');
if ($t < 1 || !hash_equals(sign($t), $s) || time() - $t < 3 || time() - $t > 7200) out(false, 403, 'token');
$used = sys_get_temp_dir() . '/lng_tok_' . md5($s);
if (file_exists($used)) out(false, 403, 'token');
@touch($used);
if (preg_match_all('~https?://|www\.~i', $message) > 2) out(false, 422, 'links');
$dom = substr(strrchr($email, '@'), 1);
if (function_exists('checkdnsrr') && !checkdnsrr($dom, 'MX') && !checkdnsrr($dom, 'A')) out(false, 422, 'domain');
if (!hit('em' . strtolower($email), 86400, 2) || !hit('all', 86400, 300)) out(false, 429, 'rate');
if (!in_array($service, SERVICES, true)) $service = 'Not specified';

$phoneFull = trim($code . ' ' . $phone);
$submitted = date('j F Y, H:i') . ' (SAST)';
$first     = explode(' ', $name)[0];
$message = trim(preg_replace('~(https?://|www\.)\S+~i', '[link removed]', $message));
if ($message === '') $message = '(No message provided)';

$rows = [
  'Full name'        => $name,
  'Email address'    => $email,
  'Country / region' => $country !== '' ? $country : 'Not specified',
  'Phone number'     => $phoneFull,
  'Service required' => $service,
  'Submitted'        => $submitted,
];
$slot = clean($_POST['preferred_slot'] ?? '', 200);
if ($slot !== '') $rows = ['Preferred call time' => $slot] + $rows;

// ---------- plain text ----------
$text  = "Hi {$first},\n\nThank you for contacting Luc Nexus Group. We have received your consultation request and will be in touch soon.\n\n";
$text .= "WHAT YOU SUBMITTED\n------------------\n";
foreach ($rows as $k => $v) $text .= "{$k}: {$v}\n";
$text .= "\nProject details / message:\n{$message}\n\n";
$text .= "Need to add something? Simply reply to this email, or reach us on WhatsApp / phone: " . PHONE_TEXT . "\n\n";
$text .= "Kind regards,\nLuc Nexus Group\nBegin Your Transformation\nhttps://" . SITE_HOST . "\n";

// ---------- HTML ----------
$tr = '';
foreach ($rows as $k => $v) {
  $tr .= '<tr><td style="padding:10px 14px;border-bottom:1px solid #1f293d;color:#8fa3c4;font-size:12px;text-transform:uppercase;letter-spacing:.06em;width:38%;vertical-align:top">' . esc($k) .
         '</td><td style="padding:10px 14px;border-bottom:1px solid #1f293d;color:#f1f5f9;font-size:14px;vertical-align:top">' . esc($v) . '</td></tr>';
}
$html = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#060a14;font-family:Segoe UI,Helvetica,Arial,sans-serif">'
 . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060a14;padding:24px 12px"><tr><td align="center">'
 . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0a0f1d;border:1px solid #1f293d;border-radius:16px;overflow:hidden">'
 . '<tr><td align="center" style="padding:32px 24px 8px;background:#0a0f1d"><img src="' . LOGO_URL . '" width="84" height="84" alt="Luc Nexus Group" style="display:block;border-radius:50%;border:1px solid #0e7490"></td></tr>'
 . '<tr><td align="center" style="padding:8px 24px 0"><div style="color:#22d3ee;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:600">Luc Nexus Group</div></td></tr>'
 . '<tr><td style="padding:20px 32px 4px"><h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3">Request received, ' . esc($first) . '.</h1></td></tr>'
 . '<tr><td style="padding:8px 32px 20px;color:#cbd5e1;font-size:15px;line-height:1.65">Thank you for contacting Luc Nexus Group. We have received your consultation request and <strong style="color:#ffffff">we will be in touch soon</strong>. Here is a copy of what you submitted:</td></tr>'
 . '<tr><td style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1f293d;border-radius:12px">' . $tr . '</table></td></tr>'
 . '<tr><td style="padding:18px 32px 0"><div style="color:#8fa3c4;font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Project details / message</div>'
 . '<div style="background:#111827;border:1px solid #1f293d;border-radius:12px;padding:14px;color:#f1f5f9;font-size:14px;line-height:1.6">' . nl2br(esc($message)) . '</div></td></tr>'
 . '<tr><td style="padding:24px 32px 8px;color:#cbd5e1;font-size:14px;line-height:1.65">Need to add something? Just reply to this email, or reach us on WhatsApp or phone at <a href="https://wa.me/27824720050" style="color:#22d3ee;text-decoration:none">' . PHONE_TEXT . '</a>.</td></tr>'
 . '<tr><td style="padding:16px 32px 32px;color:#cbd5e1;font-size:14px">Kind regards,<br><strong style="color:#ffffff">Luc Nexus Group</strong><br><span style="color:#22d3ee;font-size:12px">Begin Your Transformation</span></td></tr>'
 . '<tr><td align="center" style="padding:16px;background:#060a14;border-top:1px solid #1f293d;color:#64748b;font-size:12px">' . '<a href="https://' . SITE_HOST . '" style="color:#64748b;text-decoration:none">' . SITE_HOST . '</a> &middot; Serving South Africa &amp; international clients</td></tr>'
 . '</table></td></tr></table></body></html>';

// ---------- send ----------
$b = 'lng_' . bin2hex(random_bytes(8));
$headers  = 'From: Luc Nexus Group <' . FROM_EMAIL . ">\r\n";
$headers .= 'Reply-To: Luc Nexus Group <' . REPLY_EMAIL . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"{$b}\"\r\n";
$headers .= "X-Auto-Response-Suppress: OOF, AutoReply\r\n";

$body  = "--{$b}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text)) . "\r\n";
$body .= "--{$b}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "\r\n";
$body .= "--{$b}--";

$subject = '=?UTF-8?B?' . base64_encode('We have received your consultation request | Luc Nexus Group') . '?=';

$sent = @mail($email, $subject, $body, $headers, '-f' . FROM_EMAIL);
if (!$sent) error_log('Luc Nexus confirmation mail failed');
out((bool)$sent, $sent ? 200 : 500, $sent ? null : 'mail');
