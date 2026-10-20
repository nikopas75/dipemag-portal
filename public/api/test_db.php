<?php
/**
 * Εργαλείο Πλήρους Διάγνωσης & Ελέγχου MySQL & API για το ΠΣΔ (sch.gr)
 * Προσπελάστε το απευθείας στον φυλλομετρητή: /api/test_db.php
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>Διαγνωστικά Συστήματος - ΔΠΕ Μαγνησίας</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; line-height: 1.6; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    h2, h3 { color: #38bdf8; margin-top: 0; }
    .success { color: #4ade80; font-weight: bold; }
    .error { color: #f87171; font-weight: bold; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .badge-ok { background: #064e3b; color: #34d399; }
    .badge-err { background: #7f1d1d; color: #fca5a5; }
    ul { padding-left: 20px; }
    code, pre { background: #090d16; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #a5f3fc; }
    pre { padding: 12px; overflow-x: auto; font-size: 13px; border: 1px solid #1e293b; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>

<div class="card">
  <h2>Διαγνωστικά Σύνδεσης & Περιβάλλοντος Web/MySQL - ΔΠΕ Μαγνησίας</h2>
  <p><strong>PHP Version:</strong> <?= phpversion() ?></p>
  <p><strong>PDO MySQL Extension:</strong> <?= extension_loaded('pdo_mysql') ? '<span class="badge badge-ok">Ενεργό</span>' : '<span class="badge badge-err">ΑΝΕΝΕΡΓΟ!</span>' ?></p>
  <p><strong>MySQLi Extension:</strong> <?= extension_loaded('mysqli') ? '<span class="badge badge-ok">Ενεργό</span>' : '<span class="badge badge-err">ΑΝΕΝΕΡΓΟ</span>' ?></p>
  <p><strong>Display Errors:</strong> <?= ini_get('display_errors') ? 'On' : 'Off (Suppressed by Server php.ini)' ?></p>
  <p><strong>Memory Limit:</strong> <?= ini_get('memory_limit') ?></p>
  <p><strong>Server Software:</strong> <?= htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') ?></p>
</div>

<?php
require_once __DIR__ . '/config.php';

$databasesToTest = [
    'e_aitisi' => 'Η-Αίτηση (e-aitisi)',
    'programmatismos' => 'Προγραμματισμός Σχολικών Μονάδων',
    'axiologisi' => 'Αξιολόγηση Εκπαιδευτικών'
];
?>

<div class="card">
  <h3>1. Έλεγχος Σύνδεσης στις 3 Βάσεις Δεδομένων (Host: <?= htmlspecialchars(DB_HOST) ?>:<?= htmlspecialchars(DB_PORT) ?>)</h3>
  <ul>
  <?php foreach ($databasesToTest as $dbName => $label): ?>
    <li>
      <strong>Βάση <?= htmlspecialchars($dbName) ?> (<?= htmlspecialchars($label) ?>):</strong> 
      <?php
      try {
          $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . $dbName . ";charset=utf8mb4";
          $pdo = new PDO($dsn, DB_USER, DB_PASS, [
              PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
              PDO::ATTR_TIMEOUT => 4
          ]);
          echo '<span class="badge badge-ok">ΕΠΙΤΥΧΙΑ</span>';

          $stmt = $pdo->query("SHOW TABLES");
          $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
          echo " &mdash; Βρέθηκαν <strong>" . count($tables) . "</strong> πίνακες: <code>" . htmlspecialchars(implode(', ', array_slice($tables, 0, 15))) . (count($tables) > 15 ? ', ...' : '') . "</code>";

          // If programmatismos, test dim_users count
          if ($dbName === 'programmatismos') {
              try {
                  $c1 = $pdo->query("SELECT COUNT(*) FROM dim_users")->fetchColumn();
                  echo "<br>&nbsp;&nbsp;&nbsp;&nbsp;↳ <em>Εγγραφές dim_users: " . (int)$c1 . "</em>";
              } catch (\Throwable $e) {
                  echo "<br>&nbsp;&nbsp;&nbsp;&nbsp;↳ <span class='error'>dim_users: " . htmlspecialchars($e->getMessage()) . "</span>";
              }
          }
          // If e_aitisi, test teachers count
          if ($dbName === 'e_aitisi') {
              try {
                  $c1 = $pdo->query("SELECT COUNT(*) FROM teachers")->fetchColumn();
                  echo "<br>&nbsp;&nbsp;&nbsp;&nbsp;↳ <em>Εγγραφές teachers: " . (int)$c1 . "</em>";
              } catch (\Throwable $e) {
                  echo "<br>&nbsp;&nbsp;&nbsp;&nbsp;↳ <span class='error'>teachers: " . htmlspecialchars($e->getMessage()) . "</span>";
              }
          }
      } catch (\Throwable $e) {
          echo '<span class="badge badge-err">ΑΠΟΤΥΧΙΑ</span> &mdash; <span class="error">' . htmlspecialchars($e->getMessage()) . '</span>';
      }
      ?>
    </li>
  <?php endforeach; ?>
  </ul>
</div>

<div class="card">
  <h3>2. Άμεσοι Σύνδεσμοι Ελέγχου PHP API (Κάντε κλικ για έλεγχο επιστροφής JSON):</h3>
  <ul>
    <li><a href="index.php?route=status" target="_blank">index.php?route=status (Έλεγχος /api/status)</a></li>
    <li><a href="index.php?route=programmatismos/schools&type=dim" target="_blank">index.php?route=programmatismos/schools&type=dim (Σχολεία Δημοτικών)</a></li>
    <li><a href="index.php?route=plinetamag/admins" target="_blank">index.php?route=plinetamag/admins (Διαχειριστές e-aitisi)</a></li>
    <li><a href="index.php?route=logs" target="_blank">index.php?route=logs (Ιστορικό Audit Logs)</a></li>
  </ul>
</div>

<div class="card">
  <h3>3. Επιστροφή στην Εφαρμογή:</h3>
  <p><a href="../" style="font-weight: bold; font-size: 15px;">&larr; Μετάβαση στην Κεντρική Πύλη (index.html)</a></p>
</div>

</body>
</html>
