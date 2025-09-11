<?php
declare(strict_types=1);

// Hardened contact endpoint for Angular frontend
// Place this file at your web root (same host as the built app)

// -------- CORS (restrict to your domains) --------
$allowedOrigins = [
  'http://localhost:4200',
  'https://debreczi.com',
  'https://www.debreczi.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
  header("Access-Control-Allow-Origin: $origin");
  header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  header('Allow: POST, OPTIONS');
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

// -------- Content-Type + size guard --------
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') === false) {
  http_response_code(415);
  echo json_encode(['error' => 'Unsupported content type']);
  exit;
}

$maxBytes = 10 * 1024; // 10 KB
$len = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($len <= 0 || $len > $maxBytes) {
  http_response_code(413);
  echo json_encode(['error' => 'Payload too large']);
  exit;
}

// -------- Read and parse JSON --------
$raw = file_get_contents('php://input');
try {
  $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['error' => 'Bad JSON']);
  exit;
}

// -------- Honeypot (bots) --------
if (!empty($data['company'] ?? '')) {
  // Silently accept to not tip off bots
  http_response_code(204);
  exit;
}

// -------- Validation --------
$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$message = trim((string)($data['message'] ?? ''));

// Name: letters + spaces/'-
if ($name === '' || !preg_match('/^[\p{L}]+(?:[ \'-][\p{L}]+)*$/u', $name)) {
  http_response_code(422);
  echo json_encode(['error' => 'Invalid name']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['error' => 'Invalid email']);
  exit;
}
if (mb_strlen($message) < 14) {
  http_response_code(422);
  echo json_encode(['error' => 'Message too short']);
  exit;
}

// -------- Compose email --------
$to = 'janos@debreczi.com';
$subject = 'Portfolio Contact from ' . $name;
$textBody = "Name: {$name}\nEmail: {$email}\n\nMessage:\n{$message}\n";
$fromEmail = 'no-reply@debreczi.com';
$fromName = mb_encode_mimeheader($name . ' via Portfolio', 'UTF-8');

// Try provider API (Resend) first if API key is configured
$resendApiKey = getenv('RESEND_API_KEY');
if ($resendApiKey) {
  $payload = [
    // Sender must be your verified domain; name shows the user
    'from' => $fromName . ' <' . $fromEmail . '>',
    'to' => [$to],
    'subject' => $subject,
    'text' => $textBody,
    'reply_to' => $email,
  ];

  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
      'Authorization: Bearer ' . $resendApiKey,
      'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 10,
  ]);
  $resp = curl_exec($ch);
  $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);

  if ($http >= 200 && $http < 300 && $resp) {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
  }

  // Log provider error and fall back to mail()
  @file_put_contents(__DIR__ . '/contact.log',
    date('c') . " Resend failed: HTTP $http Resp: $resp Err: $err\n",
    FILE_APPEND
  );
}

// Fallback: native mail() (requires server MTA, may be unreliable)
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
// Show user's name, but keep sender on your domain (DMARC/SPF safe)
$headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'X-Portfolio-Contact: 1';
$envelopeFrom = '-f ' . $fromEmail;

$ok = @mail($to, mb_encode_mimeheader($subject, 'UTF-8'), $textBody, implode("\r\n", $headers), $envelopeFrom);

if ($ok) {
  http_response_code(200);
  echo json_encode(['ok' => true, 'via' => 'mail()']);
} else {
  http_response_code(500);
  @file_put_contents(__DIR__ . '/contact.log',
    date('c') . " mail() failed\nHeaders: " . implode(' | ', $headers) . "\n" .
    'Error: ' . json_encode(error_get_last()) . "\n\n",
    FILE_APPEND
  );
  echo json_encode(['error' => 'Send failed']);
}

