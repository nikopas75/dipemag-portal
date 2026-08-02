<?php
/**
 * Κεντρική Γέφυρα PHP API για Φιλοξενία σε Web Server (Apache/Nginx + PHP)
 * Διευκολύνει την επικοινωνία της React SPA εφαρμογής με τη MySQL / MariaDB (10.2.49.42).
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Προεπιλεγμένες σταθερές σύνδεσης
define('DB_HOST_DEFAULT', '10.2.49.42');
define('DB_PORT_DEFAULT', 3306);
define('DB_USER_DEFAULT', 'plinetamag');
define('DB_PASS_DEFAULT', 'Fr9KC7$c4e');
define('DB_NAME_DEFAULT', 'e_aitisi');

// Ανάγνωση εισερχόμενων δεδομένων JSON
$inputRaw = file_get_contents('php://input');
$inputData = json_decode($inputRaw, true) ?? [];

// Προσδιορισμός διαδρομής (route)
$uri = $_SERVER['REQUEST_URI'] ?? '';
$route = $_GET['route'] ?? '';

if (empty($route)) {
    $parsedPath = parse_url($uri, PHP_URL_PATH);
    $route = preg_replace('/^\/api\/?/', '', $parsedPath);
}

session_start();

// Ανάγνωση αποθηκευμένων ρυθμίσεων σύνδεσης από το session (αν υπάρχουν)
$host = $_SESSION['db_host'] ?? DB_HOST_DEFAULT;
$port = $_SESSION['db_port'] ?? DB_PORT_DEFAULT;
$user = $_SESSION['db_user'] ?? DB_USER_DEFAULT;
$pass = $_SESSION['db_pass'] ?? DB_PASS_DEFAULT;
$db   = $_SESSION['db_name'] ?? DB_NAME_DEFAULT;

// Συνάρτηση δημιουργίας σύνδεσης mysqli
function getDbConnection($h, $p, $u, $pwd, $d) {
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = @new mysqli($h, $u, $pwd, $d, (int)$p);
    if ($conn->connect_error) {
        return [null, $conn->connect_error];
    }
    $conn->set_charset("utf8mb4");
    return [$conn, null];
}

// Δρομολόγηση αιτημάτων

// 1. /api/status - Έλεγχος κατάστασης σύνδεσης
if ($route === 'status' || $route === 'status/') {
    list($conn, $err) = getDbConnection($host, $port, $user, $pass, $db);
    if ($conn) {
        echo json_encode([
            'success' => true,
            'connected' => true,
            'mode' => 'external',
            'host' => $host,
            'port' => (int)$port,
            'user' => $user,
            'database' => $db,
            'message' => 'Επιτυχής σύνδεση στη βάση δεδομένων MySQL (' . $host . ')'
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
    } else {
        echo json_encode([
            'success' => false,
            'connected' => false,
            'mode' => 'external',
            'host' => $host,
            'port' => (int)$port,
            'user' => $user,
            'database' => $db,
            'message' => 'Αποτυχία σύνδεσης: ' . $err
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// 2. /api/connect - Αλλαγή παραμέτρων σύνδεσης
if ($route === 'connect' || $route === 'connect/') {
    $reqHost = $inputData['host'] ?? DB_HOST_DEFAULT;
    $reqPort = $inputData['port'] ?? DB_PORT_DEFAULT;
    $reqUser = $inputData['user'] ?? DB_USER_DEFAULT;
    $reqPass = isset($inputData['password']) ? $inputData['password'] : DB_PASS_DEFAULT;
    $reqDb   = $inputData['database'] ?? DB_NAME_DEFAULT;

    list($conn, $err) = getDbConnection($reqHost, $reqPort, $reqUser, $reqPass, $reqDb);

    if ($conn) {
        $_SESSION['db_host'] = $reqHost;
        $_SESSION['db_port'] = $reqPort;
        $_SESSION['db_user'] = $reqUser;
        $_SESSION['db_pass'] = $reqPass;
        $_SESSION['db_name'] = $reqDb;

        echo json_encode([
            'success' => true,
            'message' => 'Επιτυχής σύνδεση στη βάση δεδομένων ' . $reqHost,
            'config' => [
                'host' => $reqHost,
                'port' => (int)$reqPort,
                'user' => $reqUser,
                'database' => $reqDb,
                'mode' => 'external',
                'isConnected' => true
            ]
        ], JSON_UNESCAPED_UNICODE);
        $conn->close();
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Αποτυχία σύνδεσης: ' . $err
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// 3. /api/sql/execute - Εκτέλεση SQL Query
if ($route === 'sql/execute' || $route === 'sql/execute/') {
    $sql = trim($inputData['query'] ?? '');
    $customDb = $inputData['database'] ?? $db;

    if (empty($sql)) {
        echo json_encode(['success' => false, 'error' => 'Το SQL query είναι κενό.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    list($conn, $err) = getDbConnection($host, $port, $user, $pass, $customDb);
    if (!$conn) {
        echo json_encode(['success' => false, 'error' => 'Σφάλμα σύνδεσης: ' . $err], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $result = $conn->query($sql);
    if ($result === true) {
        echo json_encode([
            'success' => true,
            'rows' => [],
            'affectedRows' => $conn->affected_rows,
            'insertId' => $conn->insert_id,
            'fields' => []
        ], JSON_UNESCAPED_UNICODE);
    } elseif ($result instanceof mysqli_result) {
        $rows = [];
        $fields = [];
        while ($fInfo = $result->fetch_field()) {
            $fields[] = $fInfo->name;
        }
        while ($r = $result->fetch_assoc()) {
            $rows[] = $r;
        }
        $result->free();
        echo json_encode([
            'success' => true,
            'rows' => $rows,
            'fields' => $fields,
            'rowCount' => count($rows)
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'error' => $conn->error
        ], JSON_UNESCAPED_UNICODE);
    }
    $conn->close();
    exit;
}

// Γενική προεπιλεγμένη απόκριση για λοιπές διαδρομές API
echo json_encode([
    'success' => true,
    'message' => 'PHP API Proxy active on PHP ' . PHP_VERSION,
    'route' => $route
], JSON_UNESCAPED_UNICODE);
