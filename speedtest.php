<?php
/**
 * Luc Nexus Group: speed-test endpoint on your own hosting (fallback when Cloudflare cannot be reached).
 *   ?ping=1  tiny reply     ?d=BYTES  download (max 25 MB)     POST ?up=1  upload (reply = bytes received)
 */
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Robots-Tag: noindex');
@ini_set('zlib.output_compression', '0');
if (function_exists('apache_setenv')) @apache_setenv('no-gzip', '1');

function lim($key, $win, $max) {            // sliding-window limiter, file-locked
  $fp = @fopen(sys_get_temp_dir() . '/lng_st_' . md5($key), 'c+'); if (!$fp) return true;
  flock($fp, LOCK_EX); $now = time();
  $h = array_values(array_filter(array_map('intval', explode("\n", (string)stream_get_contents($fp))), fn($x) => $x && $now - $x < $win));
  $ok = count($h) < $max; if ($ok) $h[] = $now;
  ftruncate($fp, 0); rewind($fp); fwrite($fp, implode("\n", $h)); flock($fp, LOCK_UN); fclose($fp);
  return $ok;
}
$o = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($o !== '') { $h = strtolower((string)parse_url($o, PHP_URL_HOST)); if ($h !== 'lucnexusgroup.com' && $h !== 'www.lucnexusgroup.com') { http_response_code(403); exit; } }
if (!lim('st' . ($_SERVER['REMOTE_ADDR'] ?? 'x'), 600, 240)) { http_response_code(429); exit; }

if (isset($_GET['ping'])) { header('Content-Type: text/plain'); echo 'ok'; exit; }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $n = 0; $in = fopen('php://input', 'rb');
  while ($in && !feof($in)) { $c = fread($in, 65536); if ($c === false) break; $n += strlen($c); if ($n > 4000000) break; }
  header('Content-Type: application/json'); echo json_encode(['ok' => true, 'bytes' => $n]); exit;
}

$n = max(0, min((int)($_GET['d'] ?? 0), 25000000));
header('Content-Type: application/octet-stream');
header('Content-Encoding: identity');
header('Content-Length: ' . $n);
while (ob_get_level()) ob_end_clean();
$chunk = random_bytes(65536); $left = $n;
while ($left > 0 && !connection_aborted()) { $k = min($left, 65536); echo $k === 65536 ? $chunk : substr($chunk, 0, $k); $left -= $k; flush(); }
