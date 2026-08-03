<?php
/**
 * Εργαλείο Διαγνωστικών Σύνδεσης MySQL για το ΠΣΔ (sch.gr)
 * Προσπελάστε το απευθείας στον φυλλομετρητή: /api/test_db.php
 */
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Διαγνωστικά Σύνδεσης MySQL - ΔΠΕ Μαγνησίας (sch.gr)</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>PDO MySQL Extension:</strong> " . (extension_loaded('pdo_mysql') ? '<span style="color:green">Ενεργό</span>' : '<span style="color:red">ΑΝΕΝΕΡΓΟ!</span>') . "</p>";
echo "<p><strong>MySQLi Extension:</strong> " . (extension_loaded('mysqli') ? '<span style="color:green">Ενεργό</span>' : '<span style="color:red">ΑΝΕΝΕΡΓΟ</span>') . "</p>";

require_once __DIR__ . '/config.php';

$hostsToTest = [
    DB_HOST => 'Ορισμένο στο config.php (10.2.49.42)',
    'localhost' => 'Localhost (Unix Socket)',
    '127.0.0.1' => 'Loopback IPv4'
];

echo "<h3>Δοκιμές Σύνδεσης PDO:</h3><ul>";

foreach ($hostsToTest as $host => $label) {
    echo "<li><strong>Δοκιμή σε $host ($label):</strong> ";
    try {
        $dsn = "mysql:host=$host;port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        echo "<span style='color:green'>ΕΠΙΤΥΧΙΑ! (Σύνδεση $host OK)</span>";
        
        $stmt = $pdo->query("SELECT VERSION() as v");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<br><em>MySQL Version: " . htmlspecialchars($row['v'] ?? 'Unknown') . "</em>";
    } catch (\PDOException $e) {
        echo "<span style='color:red'>ΑΠΟΤΥΧΙΑ: " . htmlspecialchars($e->getMessage()) . " (Code: " . $e->getCode() . ")</span>";
    }
    echo "</li><br>";
}

echo "</ul>";

echo "<h3>Έλεγχος Δικαιωμάτων & Πινάκων στη ΒΔ " . DB_NAME . ":</h3>";
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<p style='color:green'>Επιτυχής ανάγνωση πινάκων! Βρέθηκαν " . count($tables) . " πίνακες:</p>";
    echo "<ul>";
    foreach ($tables as $t) {
        echo "<li>" . htmlspecialchars($t) . "</li>";
    }
    echo "</ul>";
} catch (\Throwable $e) {
    echo "<p style='color:red'>Σφάλμα κατά την ανάγνωση πινάκων: " . htmlspecialchars($e->getMessage()) . "</p>";
}
