<?php
/**
 * Configuration for MySQL database on Panhellenic School Network (sch.gr)
 *
 * Ρυθμίσεις σύνδεσης στη Βάση Δεδομένων MySQL του Πανελλήνιου Σχολικού Δικτύου.
 * Τροποποιήστε τα παρακάτω στοιχεία σύμφωνα με τα διαπιστευτήρια που σας δόθηκαν από το sch.gr.
 */

define('DB_HOST', '10.2.49.42'); // Συνήθως localhost στο sch.gr
define('DB_PORT', '3306');
define('DB_NAME', 'e_aitisi');   // Όνομα Βάσης Δεδομένων
define('DB_USER', 'plinetamag'); // Όνομα χρήστη Βάσης (MySQL Username)
define('DB_PASS', 'Fr9KC7$c4e'); // Κωδικός πρόσβασης Βάσης (MySQL Password)
define('DB_CHARSET', 'utf8mb4');

function getDbConnection($customHost = null, $customPort = null, $customUser = null, $customPass = null, $customDb = null) {
    static $pdo = null;

    $host   = !empty($customHost) ? $customHost : DB_HOST;
    $port   = !empty($customPort) ? $customPort : DB_PORT;
    $user   = !empty($customUser) ? $customUser : DB_USER;
    $pass   = ($customPass !== null && $customPass !== '') ? $customPass : DB_PASS;
    $dbname = !empty($customDb)   ? $customDb   : DB_NAME;

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    if ($customHost !== null || $customUser !== null || $customDb !== null) {
        $dsn = "mysql:host=" . $host . ";port=" . $port . ";dbname=" . $dbname . ";charset=" . DB_CHARSET;
        return new PDO($dsn, $user, $pass, $options);
    }

    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (\PDOException $e) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Αποτυχία σύνδεσης στη βάση δεδομένων MySQL: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    return $pdo;
}



