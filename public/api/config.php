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

    $dsn = "mysql:host=" . $host . ";port=" . $port . ";dbname=" . $dbname . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    return new PDO($dsn, $user, $pass, $options);
}
