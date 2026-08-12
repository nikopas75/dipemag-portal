<?php
/**
 * Configuration for MySQL database on Panhellenic School Network (sch.gr)
 *
 * Ρυθμίσεις σύνδεσης στη Βάση Δεδομένων MySQL του Πανελλήνιου Σχολικού Δικτύου.
 * Τροποποιήστε τα παρακάτω στοιχεία σύμφωνα με τα διαπιστευτήρια που σας δόθηκαν από το sch.gr.
 */

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: '10.2.49.42');
if (!defined('DB_PORT')) define('DB_PORT', getenv('DB_PORT') ?: '3306');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_AITISI_NAME') ?: (getenv('DB_NAME') ?: 'e_aitisi'));
if (!defined('DB_AITISI_NAME')) define('DB_AITISI_NAME', 'e_aitisi');
if (!defined('DB_PROGRAMMATISMOS_NAME')) define('DB_PROGRAMMATISMOS_NAME', 'programmatismos');
if (!defined('DB_AXIOLOGISI_NAME')) define('DB_AXIOLOGISI_NAME', 'axiologisi');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'plinetamag');
if (!defined('DB_PASS')) define('DB_PASS', (getenv('DB_PASSWORD') !== false && getenv('DB_PASSWORD') !== '') ? getenv('DB_PASSWORD') : ((getenv('DB_PASS') !== false && getenv('DB_PASS') !== '') ? getenv('DB_PASS') : 'Fr9KC7$c4e'));
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

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
        PDO::ATTR_TIMEOUT            => 4,
    ];

    if ($customHost !== null || $customUser !== null || $customDb !== null) {
        $dsn = "mysql:host=" . $host . ";port=" . $port . ";dbname=" . $dbname . ";charset=" . DB_CHARSET;
        return new PDO($dsn, $user, $pass, $options);
    }

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            return $pdo;
        } catch (\PDOException $e1) {
            if (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1') {
                try {
                    $dsn = "mysql:host=localhost;port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
                    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                    return $pdo;
                } catch (\PDOException $e2) {
                    throw $e1;
                }
            }
            throw $e1;
        }
    }
    return $pdo;
}
