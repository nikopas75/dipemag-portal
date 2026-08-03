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

    $host   = '10.2.49.42';
    $port   = '3306';
    $user   = 'plinetamag';
    $pass   = 'Fr9KC7$c4e';
    $dbname = 'e_aitisi';

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    if ($pdo === null) {
        $dsn = "mysql:host=10.2.49.42;port=3306;dbname=e_aitisi;charset=utf8mb4";
        $pdo = new PDO($dsn, 'plinetamag', 'Fr9KC7$c4e', $options);
    }
    return $pdo;
}



