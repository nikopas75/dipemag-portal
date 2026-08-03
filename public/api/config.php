<?php
/**
 * Configuration for MySQL database on Panhellenic School Network (sch.gr)
 *
 * Ρυθμίσεις σύνδεσης στη Βάση Δεδομένων MySQL του Πανελλήνιου Σχολικού Δικτύου μέσω PDO.
 */

define('DB_HOST', '10.2.49.42');
define('DB_PORT', '3306');
define('DB_NAME', 'e_aitisi');
define('DB_USER', 'plinetamag');
define('DB_PASS', 'Fr9KC7$c4e');
define('DB_CHARSET', 'utf8mb4');

function getDbConnection($customHost = null, $customPort = null, $customUser = null, $customPass = null, $customDb = null) {
    $host = $customHost ?: DB_HOST;
    $port = $customPort ?: DB_PORT;
    $user = $customUser ?: DB_USER;
    $pass = ($customPass !== null && $customPass !== '') ? $customPass : DB_PASS;
    $dbname = $customDb ?: DB_NAME;

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $dsn = "mysql:host=" . $host . ";port=" . $port . ";dbname=" . $dbname . ";charset=" . DB_CHARSET;
        return new PDO($dsn, $user, $pass, $options);
    } catch (\Throwable $e) {
        // Fallback: connect to MySQL server without forcing dbname in DSN
        try {
            $dsnNoDb = "mysql:host=" . $host . ";port=" . $port . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsnNoDb, $user, $pass, $options);
            
            if (!empty($dbname)) {
                try {
                    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
                } catch (\Throwable $ce) {}
                try {
                    $pdo->exec("USE `$dbname`");
                } catch (\Throwable $ue) {}
            }
            return $pdo;
        } catch (\Throwable $fallbackErr) {
            throw new \Exception("Αποτυχία σύνδεσης στη βάση δεδομένων ($host:$port, χρήστης $user): " . $e->getMessage());
        }
    }
}
