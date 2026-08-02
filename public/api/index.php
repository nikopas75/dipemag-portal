<?php
/**
 * Κεντρική Γέφυρα PHP API (PDO) για την Πύλη Εφαρμογών ΔΠΕ Μαγνησίας (sch.gr)
 * Διαχειρίζεται όλα τα αιτήματα /api/* της React εφαρμογής σε περιβάλλον Apache/Nginx.
 * Υποστηρίζει 2 Ενότητες:
 *  1. e-Αίτηση (e-Aitisi / PLINET Magnesia): /api/plinetamag/*
 *  2. Προγραμματισμός (Programmatismos): /api/programmatismos/*
 */

ob_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);

function sendJson($data, $statusCode = 200) {
    if (ob_get_length()) {
        ob_clean();
    }
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (ob_get_length()) ob_clean();
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

session_start();

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Export route pattern after /api
$route = $requestUri;
if (isset($_GET['route']) && !empty($_GET['route'])) {
    $rParam = $_GET['route'];
    $route = (strpos($rParam, '/api') === 0) ? $rParam : '/api/' . ltrim($rParam, '/');
} else if (strpos($route, '/api') !== false) {
    $route = substr($route, strpos($route, '/api'));
}
$routeClean = trim($route, '/');

// Fallback if accessed as /api/index.php without route param
if ($routeClean === 'api/index.php' || $routeClean === 'index.php') {
    $route = '/api/status';
    $routeClean = 'status';
}

$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true) ?? [];

// Helper function mapping health reason fields for e-Aitisi
function mapTeacherRow($row) {
    if (!$row) return $row;
    if (isset($row['ΛόγοιΥγείαςΣυζ'])) $row['ΛόγοιΥγείαςΣυζύγου'] = $row['ΛόγοιΥγείαςΣυζ'];
    if (isset($row['ΛόγοιΥγείαςΤεκν'])) $row['ΛόγοιΥγείαςΤέκνων'] = $row['ΛόγοιΥγείαςΤεκν'];
    if (isset($row['ΛόγοιΥγείαςΓον'])) $row['ΛόγοιΥγείαςΓονέων'] = $row['ΛόγοιΥγείαςΓον'];
    if (isset($row['ΛόγοιΥγείαςΑδερ'])) $row['ΛόγοιΥγείαςΑδερφών'] = $row['ΛόγοιΥγείαςΑδερ'];
    return $row;
}

// Ensure database schema helper for e-Aitisi
function ensureEaitisiSchema($pdo) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS teachers (
                Α_Α INT AUTO_INCREMENT PRIMARY KEY,
                ΑρΜητρ VARCHAR(12) DEFAULT '',
                ΑΦΜ VARCHAR(12) DEFAULT '',
                Επώνυμο VARCHAR(100) DEFAULT '',
                Όνομα VARCHAR(100) DEFAULT '',
                Πατρώνυμο VARCHAR(100) DEFAULT '',
                Ειδικότητα VARCHAR(100) DEFAULT '',
                ΚωδΕιδικότ VARCHAR(20) DEFAULT '',
                Οργανική VARCHAR(255) DEFAULT '',
                ΚωδΟργαν VARCHAR(20) DEFAULT '',
                Έτη INT DEFAULT 0,
                Μήνες INT DEFAULT 0,
                Ημέρες INT DEFAULT 0,
                ΠερΜετάθ VARCHAR(50) DEFAULT '',
                Πόλη VARCHAR(100) DEFAULT NULL,
                ΤαχΚωδ VARCHAR(10) DEFAULT NULL,
                Οδός VARCHAR(100) DEFAULT NULL,
                Αριθμός VARCHAR(10) DEFAULT NULL,
                Σταθερό VARCHAR(20) DEFAULT NULL,
                Κινητό VARCHAR(20) DEFAULT NULL,
                Email VARCHAR(100) DEFAULT NULL,
                ΟικΚατάστ VARCHAR(20) DEFAULT '0',
                ΑρΠαιδιών INT DEFAULT 0,
                Εντοπιότητα VARCHAR(100) DEFAULT NULL,
                Συνυπηρέτηση VARCHAR(100) DEFAULT NULL,
                Ποσοστό INT DEFAULT 0,
                ΛόγοιΥγείαςΙδίου ENUM('0','1','2','3') DEFAULT '0',
                ΛόγοιΥγείαςΣυζ ENUM('0','1','2','3') DEFAULT '0',
                ΛόγοιΥγείαςΤεκν ENUM('0','1','2','3') DEFAULT '0',
                ΛόγοιΥγείαςΓον ENUM('0','1','2','3') DEFAULT '0',
                ΛόγοιΥγείαςΑδερ ENUM('0','1','2','3') DEFAULT '0',
                Παρατηρήσεις TEXT DEFAULT NULL,
                Υπεραριθμία ENUM('0','1','2','3') DEFAULT '0',
                ΑρΠροτιμ INT DEFAULT 0,
                Προτιμήσεις TEXT DEFAULT NULL,
                Χρονοσήμανση TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                Θεραπεία ENUM('0','1') DEFAULT '0',
                Μεταπτυχιακό VARCHAR(50) DEFAULT '0',
                ΕιδικήΚΜ ENUM('0','1') DEFAULT '0',
                ΚατηγορίαΚΠ VARCHAR(255) DEFAULT NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS settings (
                key_name VARCHAR(100) PRIMARY KEY,
                value_data TEXT
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
        ");
    } catch (\Exception $e) {}
}

$pdo = null;
$dbInitError = null;
try {
    $pdo = getDbConnection();
    ensureEaitisiSchema($pdo);
} catch (\Exception $e) {
    $dbInitError = $e->getMessage();
}

// -------------------------------------------------------------
// CORE GENERAL ROUTES
// -------------------------------------------------------------

// 1. GET /api/status
if ($route === '/api/status' || $routeClean === 'status' || $routeClean === '') {
    try {
        if (!$pdo) {
            $pdo = getDbConnection();
            ensureEaitisiSchema($pdo);
        }
        $stmt = $pdo->query("SELECT COUNT(*) FROM teachers");
        $totalTeachers = $stmt ? (int)$stmt->fetchColumn() : 0;
        sendJson([
            'mode' => 'external',
            'host' => DB_HOST,
            'port' => (int)DB_PORT,
            'database' => DB_NAME,
            'user' => DB_USER,
            'isConnected' => true,
            'activeConnectionMessage' => 'Σύνδεση PHP PDO με τη Βάση Δεδομένων sch.gr (' . DB_NAME . ')',
            'stats' => [
                'totalUsers' => 1,
                'totalRecords' => $totalTeachers,
                'totalAuditLogs' => 1
            ]
        ]);
    } catch (\Exception $e) {
        sendJson(['mode' => 'external', 'isConnected' => false, 'error' => 'Αποτυχία αρχικοποίησης PDO: ' . $e->getMessage()], 200);
    }
}

// 2. POST /api/connect
if ($route === '/api/connect' || $routeClean === 'connect') {
    $reqHost = $input['host'] ?? DB_HOST;
    $reqPort = $input['port'] ?? DB_PORT;
    $reqUser = $input['user'] ?? DB_USER;
    $reqPass = isset($input['password']) ? $input['password'] : DB_PASS;
    $reqDb   = $input['database'] ?? DB_NAME;

    try {
        $testPdo = getDbConnection($reqHost, $reqPort, $reqUser, $reqPass, $reqDb);
        sendJson([
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
        ]);
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => 'Αποτυχία σύνδεσης: ' . $e->getMessage()], 400);
    }
}

// 3. POST /api/sql/execute
if (($route === '/api/sql/execute' || $routeClean === 'sql/execute') && $method === 'POST') {
    $sql = trim($input['query'] ?? '');
    if (empty($sql)) {
        sendJson(['success' => false, 'error' => 'Το SQL query είναι κενό.'], 400);
    }
    try {
        $stmt = $pdo->query($sql);
        if ($stmt === false) {
            sendJson(['success' => false, 'error' => 'Αποτυχία εκτέλεσης SQL query.'], 400);
        }
        if ($stmt->columnCount() > 0) {
            $rows = $stmt->fetchAll();
            $fields = !empty($rows) ? array_keys($rows[0]) : [];
            sendJson([
                'success' => true,
                'rows' => $rows,
                'columns' => $fields,
                'rowCount' => count($rows),
                'affectedRows' => count($rows),
                'executionTimeMs' => 5
            ]);
        } else {
            sendJson([
                'success' => true,
                'rows' => [],
                'affectedRows' => $stmt->rowCount(),
                'insertId' => $pdo->lastInsertId(),
                'columns' => []
            ]);
        }
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 400);
    }
}

// -------------------------------------------------------------
// MODULE 1: e-ΑΙΤΗΣΗ (PLINETMAG) ROUTES
// -------------------------------------------------------------

// POST /api/plinetamag/auth/login
if ($route === '/api/plinetamag/auth/login' && $method === 'POST') {
    $afm = trim($input['afm'] ?? '');
    $am = trim($input['am'] ?? '');
    if (!$afm || !$am) {
        sendJson(['success' => false, 'error' => 'Παρακαλώ εισάγετε ΑΦΜ και Αριθμό Μητρώου (ΑΜ).'], 400);
    }
    $stmt = $pdo->prepare("SELECT * FROM teachers WHERE TRIM(ΑΦΜ) = ? AND TRIM(ΑρΜητρ) = ? LIMIT 1");
    $stmt->execute([$afm, $am]);
    $row = $stmt->fetch();
    if (!$row) {
        sendJson(['success' => false, 'error' => 'Αποτυχία σύνδεσης: Λανθασμένο ΑΦΜ ή Αριθμός Μητρώου (ΑΜ).'], 401);
    }
    sendJson(['success' => true, 'teacher' => mapTeacherRow($row)]);
}

// GET /api/plinetamag/records
if ($route === '/api/plinetamag/records' && $method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, (int)($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;

    $whereClause = "";
    $params = [];
    if (!empty($search)) {
        $whereClause = "WHERE Επώνυμο LIKE ? OR Όνομα LIKE ? OR ΑρΜητρ LIKE ? OR ΑΦΜ LIKE ?";
        $likeStr = "%$search%";
        $params = [$likeStr, $likeStr, $likeStr, $likeStr];
    }
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM teachers $whereClause");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $dataStmt = $pdo->prepare("SELECT * FROM teachers $whereClause ORDER BY Επώνυμο, Όνομα LIMIT $limit OFFSET $offset");
    $dataStmt->execute($params);
    $rows = $dataStmt->fetchAll();

    sendJson([
        'records' => array_map('mapTeacherRow', $rows),
        'total' => $total,
        'page' => $page,
        'totalPages' => ceil($total / $limit),
        'tableName' => 'teachers'
    ]);
}

// PUT /api/plinetamag/records/{id}
if (preg_match('#^/api/plinetamag/records/(\d+)$#', $route, $matches) && $method === 'PUT') {
    $id = $matches[1];
    $body = $input;
    if (isset($body['ΛόγοιΥγείαςΣυζύγου'])) $body['ΛόγοιΥγείαςΣυζ'] = $body['ΛόγοιΥγείαςΣυζύγου'];
    if (isset($body['ΛόγοιΥγείαςΤέκνων'])) $body['ΛόγοιΥγείαςΤεκν'] = $body['ΛόγοιΥγείαςΤέκνων'];
    if (isset($body['ΛόγοιΥγείαςΓονέων'])) $body['ΛόγοιΥγείαςΓον'] = $body['ΛόγοιΥγείαςΓονέων'];
    if (isset($body['ΛόγοιΥγείαςΑδερφών'])) $body['ΛόγοιΥγείαςΑδερ'] = $body['ΛόγοιΥγείαςΑδερφών'];

    $allowedFields = [
        'Πόλη', 'ΤαχΚωδ', 'Οδός', 'Αριθμός', 'Σταθερό', 'Κινητό', 'Email',
        'ΟικΚατάστ', 'ΑρΠαιδιών', 'Εντοπιότητα', 'Συνυπηρέτηση',
        'ΛόγοιΥγείαςΙδίου', 'ΛόγοιΥγείαςΣυζ', 'ΛόγοιΥγείαςΤεκν', 'ΛόγοιΥγείαςΓον', 'ΛόγοιΥγείαςΑδερ', 'Παρατηρήσεις',
        'Υπεραριθμία', 'ΑρΠροτιμ', 'Προτιμήσεις', 'Θεραπεία', 'Μεταπτυχιακό', 'ΕιδικήΚΜ', 'ΚατηγορίαΚΠ'
    ];
    $updates = [];
    $values = [];
    foreach ($allowedFields as $f) {
        if (array_key_exists($f, $body)) {
            $updates[] = "$f = ?";
            $values[] = ($body[$f] === '') ? null : $body[$f];
        }
    }
    if (empty($updates)) {
        sendJson(['error' => 'No valid editable fields provided'], 400);
    }
    $values[] = $id;
    $stmt = $pdo->prepare("UPDATE teachers SET " . implode(', ', $updates) . " WHERE Α_Α = ?");
    $stmt->execute($values);
    sendJson(['success' => true]);
}

// GET & POST /api/plinetamag/settings
if ($route === '/api/plinetamag/settings') {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT value_data FROM settings WHERE key_name = 'phases'");
        $stmt->execute();
        $row = $stmt->fetch();
        sendJson(['success' => true, 'phases' => $row ? json_decode($row['value_data'], true) : []]);
    } else if ($method === 'POST') {
        $phases = $input['phases'] ?? null;
        if (!is_array($phases)) sendJson(['success' => false, 'error' => 'Invalid phases'], 400);
        $json = json_encode($phases, JSON_UNESCAPED_UNICODE);
        $stmt = $pdo->prepare("INSERT INTO settings (key_name, value_data) VALUES ('phases', ?) ON DUPLICATE KEY UPDATE value_data = ?");
        $stmt->execute([$json, $json]);
        sendJson(['success' => true, 'message' => 'Οι φάσεις αποθηκεύτηκαν!']);
    }
}

// Helper to read setting key safely
function getSettingValue($pdo, $keyNames) {
    if (!is_array($keyNames)) $keyNames = [$keyNames];
    try {
        foreach ($keyNames as $key) {
            $stmt = $pdo->prepare("SELECT value_data FROM settings WHERE key_name = ?");
            $stmt->execute([$key]);
            $row = $stmt->fetch();
            if ($row && !empty($row['value_data'])) {
                $decoded = json_decode($row['value_data'], true);
                if ($decoded !== null) return $decoded;
                // Fallback for legacy PHP serialized data
                $unserialized = @unserialize($row['value_data']);
                if ($unserialized !== false) return $unserialized;
            }
        }
    } catch (\Exception $e) {}
    return null;
}

function saveSettingValue($pdo, $keyName, $val) {
    try {
        $json = json_encode($val, JSON_UNESCAPED_UNICODE);
        $stmt = $pdo->prepare("INSERT INTO settings (key_name, value_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_data = ?");
        $stmt->execute([$keyName, $json, $json]);
        return true;
    } catch (\Exception $e) {
        return false;
    }
}

// GET & POST /api/plinetamag/admins
if ($route === '/api/plinetamag/admins') {
    if ($method === 'GET') {
        $admins = getSettingValue($pdo, ['admins', 'prog_admins']);
        sendJson(['success' => true, 'admins' => is_array($admins) ? $admins : []]);
    } else if ($method === 'POST') {
        $admins = $input['admins'] ?? null;
        if (!is_array($admins)) sendJson(['success' => false, 'error' => 'Invalid admins'], 400);
        saveSettingValue($pdo, 'admins', $admins);
        sendJson(['success' => true, 'message' => 'Οι διαχειριστές αποθηκεύτηκαν!']);
    }
}

// Backup & Sync routes for e-Aitisi
if ($route === '/api/plinetamag/backup-status' && $method === 'GET') {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'teachers_full_backup'");
        $exists = ($stmt && $stmt->fetch() !== false);
        $count = $exists ? (int)$pdo->query("SELECT COUNT(*) FROM teachers_full_backup")->fetchColumn() : 0;
        sendJson(['success' => true, 'exists' => $exists, 'count' => $count, 'updatedAt' => date('Y-m-d H:i:s')]);
    } catch (\Exception $e) {
        sendJson(['success' => true, 'exists' => false, 'count' => 0]);
    }
}

if ($route === '/api/plinetamag/clone-sync' && $method === 'POST') {
    try {
        $pdo->exec("DROP TABLE IF EXISTS teachers_full_backup");
        $pdo->exec("CREATE TABLE teachers_full_backup LIKE teachers");
        $stmt = $pdo->exec("INSERT INTO teachers_full_backup SELECT * FROM teachers");
        sendJson(['success' => true, 'table' => 'teachers', 'count' => (int)$stmt, 'message' => "Δημιουργήθηκε Αντίγραφο Ασφαλείας ($stmt εγγραφές)"]);
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

if ($route === '/api/plinetamag/restore-sync' && $method === 'POST') {
    try {
        $pdo->exec("TRUNCATE TABLE teachers");
        $cnt = $pdo->exec("INSERT INTO teachers SELECT * FROM teachers_full_backup");
        sendJson(['success' => true, 'count' => (int)$cnt, 'message' => "Επαναφορά ολοκληρώθηκε ($cnt εγγραφές)"]);
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// -------------------------------------------------------------
// MODULE 2: ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΣ (PROGRAMMATISMOS) ROUTES
// -------------------------------------------------------------

// GET /api/programmatismos/admins & POST
if ($route === '/api/programmatismos/admins') {
    if ($method === 'GET') {
        $admins = getSettingValue($pdo, ['admins', 'prog_admins']);
        if (!is_array($admins) || count($admins) === 0) {
            $admins = [["username" => "plinetamag", "password" => "pl!n3tAmag"]];
        }
        sendJson(['success' => true, 'admins' => $admins]);
    } else if ($method === 'POST') {
        $admins = $input['admins'] ?? null;
        if (!is_array($admins)) sendJson(['success' => false, 'error' => 'Invalid admins'], 400);
        saveSettingValue($pdo, 'admins', $admins);
        sendJson(['success' => true, 'message' => 'Οι διαχειριστές αποθηκεύτηκαν!']);
    }
}

// GET /api/programmatismos/status
if ($route === '/api/programmatismos/status' && $method === 'GET') {
    try {
        $cnt = (int)$pdo->query("SELECT COUNT(*) FROM dim_users")->fetchColumn();
        sendJson(['connected' => true, 'database' => DB_NAME, 'schoolCount' => $cnt, 'message' => 'Ενεργή σύνδεση με τη ΒΔ']);
    } catch (\Exception $e) {
        sendJson(['connected' => true, 'database' => DB_NAME, 'schoolCount' => 0, 'message' => 'Ενεργή σύνδεση PDO']);
    }
}

// GET /api/programmatismos/schools
if ($route === '/api/programmatismos/schools' && $method === 'GET') {
    $type = $_GET['type'] ?? '';
    $tableName = 'dim_users';
    if ($type === 'eidika_nip' || $type === 'eid_nip') $tableName = 'eid_nip_users';
    else if ($type === 'eidika_dim' || $type === 'eid_dim' || $type === 'eidika') $tableName = 'eid_dim_users';
    else if ($type === 'nipagogeia' || $type === 'nip') $tableName = 'nip_users';

    try {
        $stmt = $pdo->query("SELECT SchID, SchCode, SchName, Organ, Location, PrID, PrName FROM $tableName ORDER BY SchID ASC, SchName ASC");
        sendJson($stmt->fetchAll());
    } catch (\Exception $e) {
        try {
            $stmt = $pdo->query("SELECT SchID, SchCode, SchName, Organ, Location, PrID, PrName FROM dim_users ORDER BY SchID ASC, SchName ASC");
            sendJson($stmt->fetchAll());
        } catch (\Exception $ex) {
            sendJson([]);
        }
    }
}

// POST /api/programmatismos/auth/login
if ($route === '/api/programmatismos/auth/login' && $method === 'POST') {
    $schCode = trim($input['schCode'] ?? '');
    $password = trim($input['password'] ?? '');
    $isAdmin = $input['isAdmin'] ?? false;
    $type = $input['type'] ?? $input['category'] ?? '';

    if ($isAdmin) {
        if ($schCode === 'plinetamag' && $password === 'pl!n3tAmag') {
            sendJson([
                'success' => true,
                'role' => 'admin',
                'user' => ['username' => 'plinetamag', 'fullName' => 'Διαχειριστής Προγραμματισμού']
            ]);
        } else {
            sendJson(['success' => false, 'error' => 'Λανθασμένα στοιχεία διαχειριστή'], 401);
        }
    }

    $tableName = 'dim_users';
    if (strpos($type, 'eid') !== false && strpos($type, 'nip') !== false) $tableName = 'eid_nip_users';
    else if (strpos($type, 'eid') !== false) $tableName = 'eid_dim_users';
    else if (strpos($type, 'nip') === 0) $tableName = 'nip_users';

    try {
        $stmt = $pdo->prepare("SELECT * FROM $tableName WHERE SchCode = ? OR PrID = ? LIMIT 1");
        $stmt->execute([$schCode, $schCode]);
        $school = $stmt->fetch();

        if (!$school) {
            // Search alternative tables
            foreach (['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users'] as $t) {
                try {
                    $s = $pdo->prepare("SELECT * FROM $t WHERE SchCode = ? OR PrID = ? LIMIT 1");
                    $s->execute([$schCode, $schCode]);
                    if ($found = $s->fetch()) {
                        $school = $found;
                        break;
                    }
                } catch (\Exception $ex) {}
            }
        }

        if (!$school) {
            sendJson(['success' => false, 'error' => 'Δεν βρέθηκε η σχολική μονάδα με αυτόν τον κωδικό/ΑΜ'], 404);
        }

        sendJson([
            'success' => true,
            'role' => 'director',
            'school' => [
                'SchID' => $school['SchID'],
                'SchCode' => $school['SchCode'],
                'SchName' => $school['SchName'],
                'Organ' => $school['Organ'],
                'Location' => $school['Location'],
                'PrID' => $school['PrID'],
                'PrName' => $school['PrName']
            ]
        ]);
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// GET /api/programmatismos/school/{schCode}
if (preg_match('#^/api/programmatismos/school/([^/]+)$#', $route, $matches) && $method === 'GET') {
    $schCode = $matches[1];
    try {
        $stmt = $pdo->prepare("SELECT * FROM dim_users WHERE SchCode = ? LIMIT 1");
        $stmt->execute([$schCode]);
        $school = $stmt->fetch();

        $mathStmt = $pdo->prepare("SELECT * FROM dim_data_math WHERE SchCode = ? LIMIT 1");
        $mathStmt->execute([$schCode]);
        $mathData = $mathStmt ? $mathStmt->fetch() : null;

        $ekpStmt = $pdo->prepare("SELECT * FROM dim_data_ekp WHERE SchCode = ? LIMIT 1");
        $ekpStmt->execute([$schCode]);
        $ekpData = $ekpStmt ? $ekpStmt->fetch() : null;

        sendJson([
            'category' => 'dim',
            'school' => $school,
            'mathData' => $mathData,
            'ekpData' => $ekpData
        ]);
    } catch (\Exception $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

// Default 404 handler for unmatched routes
sendJson(['error' => 'Endpoint not found', 'route' => $route], 404);
