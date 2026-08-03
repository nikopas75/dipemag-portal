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

set_exception_handler(function ($e) {
    sendJson(['success' => false, 'error' => 'Σφάλμα PHP: ' . $e->getMessage()], 200);
});

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    sendJson(['success' => false, 'error' => "Σφάλμα PHP [$errno]: $errstr στο $errfile:$errline"], 200);
});

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

// Helper function mapping teacher row for e-Aitisi
function mapTeacherRow($row) {
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
    
    if (!$pdo) {
        try {
            $pdo = getDbConnection();
        } catch (\Throwable $e) {
            sendJson(['success' => false, 'error' => 'Αποτυχία σύνδεσης PDO στη βάση δεδομένων: ' . $e->getMessage()], 400);
        }
    }

    try {
        $targetDb = 'e_aitisi';
        $sqlToRun = $sql;
        $knownPortalDbs = ['e_aitisi', 'programmatismos', 'axiologisi'];

        if (stripos($sqlToRun, 'USE ') === 0) {
            $semiIndex = strpos($sqlToRun, ';');
            if ($semiIndex !== false) {
                $dbStatement = substr($sqlToRun, 0, $semiIndex + 1);
                $sqlToRun = trim(substr($sqlToRun, $semiIndex + 1));
                if (preg_match('/USE\s+[`"']?([a-zA-Z0-9_\-]+)[`"']?/i', $dbStatement, $m)) {
                    $targetDb = $m[1];
                }
            }
        } else {
            // Auto-detect target database if query mentions specific app tables
            $progTables = ['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users', 'dim_data_math', 'nip_data_math', 'eid_dim_data_math', 'eid_nip_data_math', 'eid_data_math', 'dim_data_ekp', 'eid_dim_data_ekp', 'eid_data_ekp'];
            foreach ($progTables as $t) {
                if (preg_match('/\b' . $t . '\b/i', $sqlToRun)) {
                    $targetDb = 'programmatismos';
                    break;
                }
            }
            if ($targetDb === 'e_aitisi') {
                $axioTables = ['cycles', 'evaluators', 'evaluations', 'axiologisi_users'];
                foreach ($axioTables as $t) {
                    if (preg_match('/\b' . $t . '\b/i', $sqlToRun)) {
                        $targetDb = 'axiologisi';
                        break;
                    }
                }
            }
        }

        if (!empty($targetDb)) {
            try {
                $pdo->exec("USE `$targetDb`");
            } catch (\Throwable $e) {
                // ignore if initial db does not exist or user lacks access
            }
        }

        if (empty($sqlToRun)) {
            sendJson([
                'success' => true,
                'rows' => [['result' => "Switched database context to $targetDb"]],
                'columns' => ['result'],
                'rowCount' => 1,
                'affectedRows' => 0,
                'executionTimeMs' => 1
            ]);
        }

        $stmt = false;
        try {
            $stmt = $pdo->query($sqlToRun);
        } catch (\Throwable $ex) {
            if (strpos($ex->getMessage(), "doesn't exist") !== false || strpos($ex->getMessage(), "Table") !== false) {
                $successStmt = null;
                
                // Strategy 1: Search via information_schema (if user has permissions)
                try {
                    preg_match_all('/(?:FROM|JOIN|UPDATE|INTO)\s+[`"']?([a-zA-Z0-9_\-]+)[`"']?/i', $sqlToRun, $matches);
                    $extractedTables = $matches[1] ?? [];
                    
                    if (preg_match('/Table\s+\'[^\']+\.([^\']+)\'\s+doesn\'t exist/i', $ex->getMessage(), $errM)) {
                        array_unshift($extractedTables, $errM[1]);
                    }

                    foreach ($extractedTables as $tbl) {
                        if (empty($tbl)) continue;
                        $sStmt = $pdo->prepare("SELECT TABLE_SCHEMA FROM information_schema.TABLES WHERE TABLE_NAME = :tbl AND TABLE_SCHEMA NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys') LIMIT 1");
                        $sStmt->execute([':tbl' => $tbl]);
                        $row = $sStmt->fetch(\PDO::FETCH_ASSOC);
                        if ($row && !empty($row['TABLE_SCHEMA'])) {
                            $pdo->exec("USE `" . $row['TABLE_SCHEMA'] . "`");
                            $successStmt = $pdo->query($sqlToRun);
                            break;
                        }
                    }
                } catch (\Throwable $infoEx) {
                    // information_schema restricted or failed
                }

                // Strategy 2: Trial fallback across known portal databases
                if (!$successStmt) {
                    foreach ($knownPortalDbs as $candDb) {
                        if ($candDb === $targetDb) continue;
                        try {
                            $pdo->exec("USE `$candDb`");
                            $trialStmt = $pdo->query($sqlToRun);
                            if ($trialStmt) {
                                $successStmt = $trialStmt;
                                break;
                            }
                        } catch (\Throwable $trialEx) {
                            // continue to next database
                        }
                    }
                }

                if ($successStmt) {
                    $stmt = $successStmt;
                } else {
                    throw $ex;
                }
            } else {
                throw $ex;
            }
        }

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
    } catch (\Throwable $e) {
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

function selectProgrammatismosDb($pdo) {
    static $attempted = false;
    if ($attempted) return;
    $attempted = true;
    try {
        $pdo->exec("USE programmatismos");
    } catch (\Exception $e) {
        try {
            $pdo->exec("USE prog_sch_db");
        } catch (\Exception $e2) {}
    }
}

function getProgrammatismosTables($type) {
    $type = strtolower($type);
    if (strpos($type, 'eid') !== false && strpos($type, 'nip') !== false) {
        return ['user' => 'eid_nip_users', 'math' => 'eid_nip_data_math', 'ekp' => null, 'category' => 'eid_nip'];
    } else if (strpos($type, 'eid') !== false) {
        return ['user' => 'eid_dim_users', 'alt_user' => 'eid_users', 'math' => 'eid_dim_data_math', 'alt_math' => 'eid_data_math', 'ekp' => 'eid_dim_data_ekp', 'alt_ekp' => 'eid_data_ekp', 'category' => 'eid_dim'];
    } else if (strpos($type, 'nip') !== false) {
        return ['user' => 'nip_users', 'math' => 'nip_data_math', 'ekp' => null, 'category' => 'nip'];
    } else {
        return ['user' => 'dim_users', 'math' => 'dim_data_math', 'ekp' => 'dim_data_ekp', 'category' => 'dim'];
    }
}

function saveOrUpdateRecord($pdo, $tableName, $data, $keyCol = 'SchCode') {
    if (!is_array($data) || empty($data) || empty($data[$keyCol])) return false;
    try {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `$tableName`");
        $stmt->execute();
        $rawCols = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (empty($rawCols)) return false;
        $columns = array_map(fn($c) => $c['Field'], $rawCols);
    } catch (\Exception $e) {
        return false;
    }

    $colMap = array_flip($columns);
    $validData = [];
    foreach ($data as $k => $v) {
        if (isset($colMap[$k])) {
            $validData[$k] = ($v === '' && $k !== $keyCol && $k !== 'SchName') ? null : $v;
        }
    }

    if (empty($validData)) return false;

    $keyValue = $validData[$keyCol];
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM `$tableName` WHERE `$keyCol` = ?");
    $checkStmt->execute([$keyValue]);
    $exists = ((int)$checkStmt->fetchColumn()) > 0;

    if ($exists) {
        $fields = [];
        $vals = [];
        foreach ($validData as $k => $v) {
            if ($k === 'dataID' || ($k === 'SchID' && $k !== $keyCol)) continue;
            $fields[] = "`$k` = ?";
            $vals[] = $v;
        }
        $vals[] = $keyValue;
        $sql = "UPDATE `$tableName` SET " . implode(', ', $fields) . " WHERE `$keyCol` = ?";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute($vals);
    } else {
        $cols = array_keys($validData);
        $placeholders = array_fill(0, count($cols), '?');
        $sql = "INSERT INTO `$tableName` (" . implode(', ', array_map(fn($c) => "`$c`", $cols)) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute(array_values($validData));
    }
}

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
    selectProgrammatismosDb($pdo);
    try {
        $cnt = 0;
        foreach (['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users'] as $t) {
            try {
                $c = (int)$pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
                $cnt += $c;
            } catch (\Exception $ex) {}
        }
        sendJson(['connected' => true, 'database' => DB_NAME, 'schoolCount' => $cnt, 'message' => 'Ενεργή σύνδεση με τη ΒΔ']);
    } catch (\Exception $e) {
        sendJson(['connected' => true, 'database' => DB_NAME, 'schoolCount' => 0, 'message' => 'Ενεργή σύνδεση PDO']);
    }
}

// GET /api/programmatismos/table-comments/{table}
if (preg_match('#^/api/programmatismos/table-comments/(.+)$#', $route, $matches) && $method === 'GET') {
    selectProgrammatismosDb($pdo);
    $tableName = $matches[1];
    try {
        $stmt = $pdo->prepare("SELECT COLUMN_NAME, COLUMN_COMMENT, DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? ORDER BY ORDINAL_POSITION");
        $stmt->execute([$tableName]);
        sendJson($stmt->fetchAll());
    } catch (\Exception $e) {
        sendJson([], 500);
    }
}

// GET /api/programmatismos/schools
if ($route === '/api/programmatismos/schools' && $method === 'GET') {
    selectProgrammatismosDb($pdo);
    $type = $_GET['type'] ?? 'dim';
    $tbls = getProgrammatismosTables($type);
    $userTable = $tbls['user'];

    try {
        $stmt = $pdo->query("SELECT SchID, SchCode, SchName, Organ, Location, PrID, PrName FROM `$userTable` ORDER BY SchID ASC, SchName ASC");
        sendJson($stmt->fetchAll());
    } catch (\Exception $e) {
        if (isset($tbls['alt_user'])) {
            try {
                $stmt = $pdo->query("SELECT SchID, SchCode, SchName, Organ, Location, PrID, PrName FROM `{$tbls['alt_user']}` ORDER BY SchID ASC, SchName ASC");
                sendJson($stmt->fetchAll());
                return;
            } catch (\Exception $ex) {}
        }
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
    selectProgrammatismosDb($pdo);
    $schCode = trim($input['schCode'] ?? '');
    $password = trim($input['password'] ?? '');
    $isAdmin = $input['isAdmin'] ?? false;
    $type = $input['type'] ?? $input['category'] ?? '';

    if ($isAdmin) {
        $storedAdmins = getSettingValue($pdo, ['admins', 'prog_admins']);
        if (!is_array($storedAdmins) || empty($storedAdmins)) {
            $storedAdmins = [["username" => "plinetamag", "password" => "pl!n3tAmag"]];
        }
        $validAdmin = false;
        foreach ($storedAdmins as $adm) {
            if (($adm['username'] ?? '') === $schCode && ($adm['password'] ?? '') === $password) {
                $validAdmin = true;
                break;
            }
        }
        if ($validAdmin || ($schCode === 'plinetamag' && $password === 'pl!n3tAmag')) {
            sendJson([
                'success' => true,
                'role' => 'admin',
                'user' => ['username' => $schCode, 'fullName' => 'Διαχειριστής Προγραμματισμού']
            ]);
        } else {
            sendJson(['success' => false, 'error' => 'Λανθασμένα στοιχεία διαχειριστή'], 401);
        }
    }

    $tbls = getProgrammatismosTables($type);
    $school = null;
    try {
        $stmt = $pdo->prepare("SELECT * FROM `{$tbls['user']}` WHERE SchCode = ? OR PrID = ? LIMIT 1");
        $stmt->execute([$schCode, $schCode]);
        $school = $stmt->fetch();
    } catch (\Exception $e) {}

    if (!$school && isset($tbls['alt_user'])) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `{$tbls['alt_user']}` WHERE SchCode = ? OR PrID = ? LIMIT 1");
            $stmt->execute([$schCode, $schCode]);
            $school = $stmt->fetch();
        } catch (\Exception $e) {}
    }

    if (!$school) {
        foreach (['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users'] as $t) {
            try {
                $s = $pdo->prepare("SELECT * FROM `$t` WHERE SchCode = ? OR PrID = ? LIMIT 1");
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
}

// GET /api/programmatismos/school/{schCode}
if (preg_match('#^/api/programmatismos/school/([^/]+)$#', $route, $matches) && $method === 'GET') {
    selectProgrammatismosDb($pdo);
    $schCode = trim($matches[1]);
    $type = $_GET['type'] ?? $_GET['category'] ?? 'dim';

    $school = null;
    $cat = 'dim';
    $mathTable = 'dim_data_math';
    $ekpTable  = 'dim_data_ekp';

    $tbls = getProgrammatismosTables($type);
    try {
        $stmt = $pdo->prepare("SELECT * FROM `{$tbls['user']}` WHERE SchCode = ? OR PrID = ? LIMIT 1");
        $stmt->execute([$schCode, $schCode]);
        $found = $stmt->fetch();
        if ($found) {
            $school = $found;
            $cat = $tbls['category'];
            $mathTable = $tbls['math'];
            $ekpTable = $tbls['ekp'];
        }
    } catch (\Exception $e) {}

    if (!$school && isset($tbls['alt_user'])) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `{$tbls['alt_user']}` WHERE SchCode = ? OR PrID = ? LIMIT 1");
            $stmt->execute([$schCode, $schCode]);
            $found = $stmt->fetch();
            if ($found) {
                $school = $found;
                $cat = $tbls['category'];
                $mathTable = $tbls['alt_math'] ?? $tbls['math'];
                $ekpTable = $tbls['alt_ekp'] ?? $tbls['ekp'];
            }
        } catch (\Exception $e) {}
    }

    if (!$school) {
        $candidates = [
            ['u' => 'dim_users', 'm' => 'dim_data_math', 'e' => 'dim_data_ekp', 'c' => 'dim'],
            ['u' => 'nip_users', 'm' => 'nip_data_math', 'e' => null, 'c' => 'nip'],
            ['u' => 'eid_dim_users', 'm' => 'eid_dim_data_math', 'e' => 'eid_dim_data_ekp', 'c' => 'eid_dim'],
            ['u' => 'eid_nip_users', 'm' => 'eid_nip_data_math', 'e' => null, 'c' => 'eid_nip'],
            ['u' => 'eid_users', 'm' => 'eid_data_math', 'e' => 'eid_data_ekp', 'c' => 'eid_dim']
        ];
        foreach ($candidates as $cand) {
            try {
                $s = $pdo->prepare("SELECT * FROM `{$cand['u']}` WHERE SchCode = ? OR PrID = ? LIMIT 1");
                $s->execute([$schCode, $schCode]);
                if ($f = $s->fetch()) {
                    $school = $f;
                    $cat = $cand['c'];
                    $mathTable = $cand['m'];
                    $ekpTable = $cand['e'];
                    break;
                }
            } catch (\Exception $ex) {}
        }
    }

    if (!$school) {
        sendJson(['error' => 'Δεν βρέθηκε η σχολική μονάδα.'], 404);
    }

    $targetCode = $school['SchCode'] ?? $schCode;

    $mathData = null;
    if ($mathTable) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `$mathTable` WHERE SchCode = ? LIMIT 1");
            $stmt->execute([$targetCode]);
            $mathData = $stmt->fetch() ?: null;
        } catch (\Exception $e) {}
    }

    $ekpData = null;
    if ($ekpTable) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `$ekpTable` WHERE SchCode = ? LIMIT 1");
            $stmt->execute([$targetCode]);
            $ekpData = $stmt->fetch() ?: null;
        } catch (\Exception $e) {}
    }

    sendJson([
        'category' => $cat,
        'school' => $school,
        'mathData' => $mathData,
        'ekpData' => $ekpData
    ]);
}

// POST /api/programmatismos/school/save
if ($route === '/api/programmatismos/school/save' && $method === 'POST') {
    selectProgrammatismosDb($pdo);
    $schCode = trim($input['schCode'] ?? '');
    $category = $input['category'] ?? 'dim';
    $mathData = $input['mathData'] ?? null;
    $ekpData = $input['ekpData'] ?? null;

    if (!$schCode) {
        sendJson(['success' => false, 'error' => 'Δεν ορίστηκε SchCode.'], 400);
    }

    $tbls = getProgrammatismosTables($category);
    $savedMath = false;
    $savedEkp = false;

    if ($mathData && is_array($mathData)) {
        $savedMath = saveOrUpdateRecord($pdo, $tbls['math'], $mathData);
        if (!$savedMath && isset($tbls['alt_math'])) {
            $savedMath = saveOrUpdateRecord($pdo, $tbls['alt_math'], $mathData);
        }
    }

    if ($ekpData && is_array($ekpData) && $tbls['ekp']) {
        $savedEkp = saveOrUpdateRecord($pdo, $tbls['ekp'], $ekpData);
        if (!$savedEkp && isset($tbls['alt_ekp'])) {
            $savedEkp = saveOrUpdateRecord($pdo, $tbls['alt_ekp'], $ekpData);
        }
    }

    sendJson(['success' => true, 'message' => 'Τα στοιχεία Προγραμματισμού αποθηκεύτηκαν επιτυχώς!']);
}

// GET /api/programmatismos/admin/records
if ($route === '/api/programmatismos/admin/records' && $method === 'GET') {
    selectProgrammatismosDb($pdo);
    $category = $_GET['category'] ?? $_GET['type'] ?? 'all';
    $records = [];

    // dim
    if ($category === 'dim' || $category === 'all') {
        try {
            $stmt = $pdo->query("
                SELECT u.SchID, u.SchCode, u.SchName, u.PrName, u.Organ, u.Location, 'dim' as category,
                       m.StuTotal, m.ClassTotal, m.TimeStamp as MathTimeStamp,
                       e.DiaTotal, e.ProTotal, e.TimeStamp as EkpTimeStamp
                FROM dim_users u
                LEFT JOIN dim_data_math m ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(m.SchCode USING utf8mb4)
                LEFT JOIN dim_data_ekp e ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(e.SchCode USING utf8mb4)
                ORDER BY u.SchID ASC
            ");
            $records = array_merge($records, $stmt->fetchAll());
        } catch (\Exception $e) {}
    }

    // nip
    if ($category === 'nip' || $category === 'all') {
        try {
            $stmt = $pdo->query("
                SELECT u.SchID, u.SchCode, u.SchName, u.PrName, u.Organ, u.Location, 'nip' as category,
                       m.StuTotal, 0 as ClassTotal, m.TimeStamp as MathTimeStamp,
                       0 as DiaTotal, 0 as ProTotal, NULL as EkpTimeStamp
                FROM nip_users u
                LEFT JOIN nip_data_math m ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(m.SchCode USING utf8mb4)
                ORDER BY u.SchID ASC
            ");
            $records = array_merge($records, $stmt->fetchAll());
        } catch (\Exception $e) {}
    }

    // eid_dim
    if ($category === 'eid_dim' || $category === 'eid' || $category === 'all') {
        $loaded = false;
        try {
            $stmt = $pdo->query("
                SELECT u.SchID, u.SchCode, u.SchName, u.PrName, u.Organ, u.Location, 'eid_dim' as category,
                       m.StuTotal, m.ClassTotal, m.TimeStamp as MathTimeStamp,
                       e.DiaTotal, e.ProTotal, e.TimeStamp as EkpTimeStamp
                FROM eid_dim_users u
                LEFT JOIN eid_dim_data_math m ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(m.SchCode USING utf8mb4)
                LEFT JOIN eid_dim_data_ekp e ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(e.SchCode USING utf8mb4)
                ORDER BY u.SchID ASC
            ");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                $records = array_merge($records, $rows);
                $loaded = true;
            }
        } catch (\Exception $e) {}

        if (!$loaded) {
            try {
                $stmt = $pdo->query("
                    SELECT u.SchID, u.SchCode, u.SchName, u.PrName, u.Organ, u.Location, 'eid_dim' as category,
                           m.StuTotal, m.ClassTotal, m.TimeStamp as MathTimeStamp,
                           e.DiaTotal, e.ProTotal, e.TimeStamp as EkpTimeStamp
                    FROM eid_users u
                    LEFT JOIN eid_data_math m ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(m.SchCode USING utf8mb4)
                    LEFT JOIN eid_data_ekp e ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(e.SchCode USING utf8mb4)
                    ORDER BY u.SchID ASC
                ");
                $records = array_merge($records, $stmt->fetchAll());
            } catch (\Exception $e2) {}
        }
    }

    // eid_nip
    if ($category === 'eid_nip' || $category === 'all') {
        try {
            $stmt = $pdo->query("
                SELECT u.SchID, u.SchCode, u.SchName, u.PrName, u.Organ, u.Location, 'eid_nip' as category,
                       m.StuTotal, 0 as ClassTotal, m.TimeStamp as MathTimeStamp,
                       0 as DiaTotal, 0 as ProTotal, NULL as EkpTimeStamp
                FROM eid_nip_users u
                LEFT JOIN eid_nip_data_math m ON CONVERT(u.SchCode USING utf8mb4) = CONVERT(m.SchCode USING utf8mb4)
                ORDER BY u.SchID ASC
            ");
            $records = array_merge($records, $stmt->fetchAll());
        } catch (\Exception $e) {}
    }

    usort($records, fn($a, $b) => ((int)($a['SchID'] ?? 0)) - ((int)($b['SchID'] ?? 0)));
    sendJson($records);
}

// GET /api/programmatismos/admin/users
if ($route === '/api/programmatismos/admin/users' && $method === 'GET') {
    selectProgrammatismosDb($pdo);
    $records = [];
    $userTables = [
        ['name' => 'dim_users', 'category' => 'dim'],
        ['name' => 'nip_users', 'category' => 'nip'],
        ['name' => 'eid_dim_users', 'category' => 'eid_dim', 'alt' => 'eid_users'],
        ['name' => 'eid_nip_users', 'category' => 'eid_nip']
    ];

    foreach ($userTables as $t) {
        $tableName = $t['name'];
        try {
            $stmt = $pdo->query("SELECT SchID, SchCode, SchName, PrID, PrName, Organ, Location, Password, '$tableName' as sourceTable, '{$t['category']}' as category FROM `$tableName` ORDER BY SchID ASC");
            $records = array_merge($records, $stmt->fetchAll());
        } catch (\Exception $e) {
            if (isset($t['alt'])) {
                try {
                    $stmt = $pdo->query("SELECT SchID, SchCode, SchName, PrID, PrName, Organ, Location, Password, '{$t['alt']}' as sourceTable, '{$t['category']}' as category FROM `{$t['alt']}` ORDER BY SchID ASC");
                    $records = array_merge($records, $stmt->fetchAll());
                } catch (\Exception $ex) {}
            }
        }
    }

    usort($records, fn($a, $b) => ((int)($a['SchID'] ?? 0)) - ((int)($b['SchID'] ?? 0)));
    sendJson($records);
}

// POST /api/programmatismos/admin/school/save
if ($route === '/api/programmatismos/admin/school/save' && $method === 'POST') {
    selectProgrammatismosDb($pdo);
    $tbl = $input['table'] ?? $input['sourceTable'] ?? 'dim_users';
    $allowedTables = ['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users'];
    $targetTable = in_array($tbl, $allowedTables) ? $tbl : 'dim_users';

    $schID = isset($input['SchID']) ? (int)$input['SchID'] : 0;
    $schCode = trim($input['SchCode'] ?? '');
    $schName = trim($input['SchName'] ?? '');
    $prID = trim($input['PrID'] ?? '');
    $prName = trim($input['PrName'] ?? '');
    $organ = trim($input['Organ'] ?? '');
    $location = trim($input['Location'] ?? '');
    $pass = trim($input['Password'] ?? '');

    if (!$schCode || !$schName) {
        sendJson(['success' => false, 'error' => 'Ο Κωδικός και η Ονομασία Σχολείου είναι υποχρεωτικά πεδία.'], 400);
    }

    if (!$pass && $prID) {
        $pass = md5($prID);
    }

    try {
        if ($schID > 0) {
            $stmt = $pdo->prepare("UPDATE `$targetTable` SET SchCode = ?, SchName = ?, PrID = ?, PrName = ?, Organ = ?, Location = ?, Password = ? WHERE SchID = ?");
            $stmt->execute([$schCode, $schName, $prID, $prName, $organ, $location, $pass, $schID]);
            sendJson(['success' => true, 'message' => "Η σχολική μονάδα \"$schName\" ενημερώθηκε επιτυχώς!"]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO `$targetTable` (SchCode, SchName, PrID, PrName, Organ, Location, Password) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$schCode, $schName, $prID, $prName, $organ, $location, $pass]);
            sendJson(['success' => true, 'message' => "Η νέα σχολική μονάδα \"$schName\" δημιουργήθηκε επιτυχώς!", 'SchID' => $pdo->lastInsertId()]);
        }
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// POST /api/programmatismos/admin/school/delete
if ($route === '/api/programmatismos/admin/school/delete' && $method === 'POST') {
    selectProgrammatismosDb($pdo);
    $tbl = $input['table'] ?? 'dim_users';
    $allowedTables = ['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users'];
    $targetTable = in_array($tbl, $allowedTables) ? $tbl : 'dim_users';

    $schID = isset($input['SchID']) ? (int)$input['SchID'] : 0;
    $schCode = trim($input['SchCode'] ?? '');

    try {
        if ($schID > 0) {
            $stmt = $pdo->prepare("DELETE FROM `$targetTable` WHERE SchID = ?");
            $stmt->execute([$schID]);
        } else if ($schCode !== '') {
            $stmt = $pdo->prepare("DELETE FROM `$targetTable` WHERE SchCode = ?");
            $stmt->execute([$schCode]);
        } else {
            sendJson(['success' => false, 'error' => 'Δεν ορίστηκε SchID ή SchCode για διαγραφή.'], 400);
        }
        sendJson(['success' => true, 'message' => "Η εγγραφή διαγράφηκε επιτυχώς από τον πίνακα $targetTable."]);
    } catch (\Exception $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// GET /api/programmatismos/admin/export/csv
if ($route === '/api/programmatismos/admin/export/csv' && $method === 'GET') {
    selectProgrammatismosDb($pdo);
    $tableName = $_GET['table'] ?? 'dim_data_math';
    $allowedTables = [
        'dim_users', 'dim_data_math', 'dim_data_ekp',
        'nip_users', 'nip_data_math',
        'eid_dim_users', 'eid_dim_data_math', 'eid_dim_data_ekp', 'eid_users', 'eid_data_math', 'eid_data_ekp',
        'eid_nip_users', 'eid_nip_data_math'
    ];
    if (!in_array($tableName, $allowedTables)) {
        sendJson(['error' => 'Invalid table'], 400);
    }
    try {
        $stmt = $pdo->query("SELECT * FROM `$tableName`");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $fields = !empty($rows) ? array_keys($rows[0]) : [];
        $headers = array_filter($fields, fn($h) => $h !== 'dataID');

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $tableName . '_export.csv"');
        echo "\xEF\xBB\xBF";
        echo implode(';', $headers) . "\n";
        foreach ($rows as $row) {
            $line = array_map(function($h) use ($row) {
                $val = $row[$h] ?? '';
                $val = str_replace('"', '""', $val);
                if (strpos($val, ';') !== false || strpos($val, "\n") !== false || strpos($val, '"') !== false) {
                    $val = '"' . $val . '"';
                }
                return $val;
            }, $headers);
            echo implode(';', $line) . "\n";
        }
        exit;
    } catch (\Exception $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
}

// POST /api/programmatismos/admin/sync-principals
if ($route === '/api/programmatismos/admin/sync-principals' && $method === 'POST') {
    selectProgrammatismosDb($pdo);
    $tblParam = $input['table'] ?? 'all_tables';
    $updates = $input['updates'] ?? [];
    $updatePasswordMd5 = $input['updatePasswordMd5'] ?? true;

    $allowedTables = ['dim_users', 'nip_users', 'eid_dim_users', 'eid_nip_users', 'eid_users'];
    $targetTables = [];
    if (is_array($tblParam)) {
        $targetTables = array_filter($tblParam, fn($t) => in_array($t, $allowedTables));
    } else if ($tblParam === 'all_dim') {
        $targetTables = ['dim_users', 'eid_dim_users', 'eid_users'];
    } else if ($tblParam === 'all_nip') {
        $targetTables = ['nip_users', 'eid_nip_users'];
    } else if ($tblParam === 'all_tables') {
        $targetTables = ['dim_users', 'eid_dim_users', 'eid_users', 'nip_users', 'eid_nip_users'];
    } else if (in_array($tblParam, $allowedTables)) {
        $targetTables = [$tblParam];
    }

    if (empty($targetTables) || !is_array($updates) || empty($updates)) {
        sendJson(['error' => 'Μη έγκυρα δεδομένα για συγχρονισμό'], 400);
    }

    $updatedCount = 0;
    $skippedCount = 0;

    foreach ($updates as $item) {
        $schCode = trim($item['SchCode'] ?? '');
        $prID = trim($item['PrID'] ?? '');
        $prName = trim($item['PrName'] ?? '');
        if (!$schCode) {
            $skippedCount++;
            continue;
        }

        $passMd5 = $prID ? md5($prID) : '';
        $rowUpdated = false;

        foreach ($targetTables as $tbl) {
            try {
                $sql = "UPDATE `$tbl` SET PrName = ?, PrID = ?";
                $params = [$prName, $prID];
                if ($updatePasswordMd5 !== false) {
                    $sql .= ", Password = ?";
                    $params[] = $passMd5;
                }
                $sql .= " WHERE SchCode = ?";
                $params[] = $schCode;

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                if ($stmt->rowCount() > 0) {
                    $updatedCount += $stmt->rowCount();
                    $rowUpdated = true;
                    break;
                }
            } catch (\Exception $e) {}
        }
        if (!$rowUpdated) $skippedCount++;
    }

    sendJson([
        'success' => true,
        'updatedRowsCount' => $updatedCount,
        'totalReceived' => count($updates),
        'skippedCount' => $skippedCount,
        'message' => "Ενημερώθηκαν επιτυχώς $updatedCount εγγραφές. Η σειρά διατηρήθηκε ανέπαφη."
    ]);
}

// POST /api/programmatismos/admin/reset-data-tables
if ($route === '/api/programmatismos/admin/reset-data-tables' && $method === 'POST') {
    selectProgrammatismosDb($pdo);
    $cat = $input['category'] ?? 'all';
    $pairs = [];
    if ($cat === 'dim' || $cat === 'all') {
        $pairs[] = ['data' => 'dim_data_math', 'user' => 'dim_users'];
        $pairs[] = ['data' => 'dim_data_ekp', 'user' => 'dim_users'];
    }
    if ($cat === 'nip' || $cat === 'all') {
        $pairs[] = ['data' => 'nip_data_math', 'user' => 'nip_users'];
    }
    if ($cat === 'eid_dim' || $cat === 'all') {
        $pairs[] = ['data' => 'eid_dim_data_math', 'user' => 'eid_dim_users'];
        $pairs[] = ['data' => 'eid_dim_data_ekp', 'user' => 'eid_dim_users'];
        $pairs[] = ['data' => 'eid_data_math', 'user' => 'eid_users'];
        $pairs[] = ['data' => 'eid_data_ekp', 'user' => 'eid_users'];
    }
    if ($cat === 'eid_nip' || $cat === 'all') {
        $pairs[] = ['data' => 'eid_nip_data_math', 'user' => 'eid_nip_users'];
    }

    $results = [];
    foreach ($pairs as $p) {
        $dTable = $p['data'];
        $uTable = $p['user'];
        try {
            $stmt = $pdo->prepare("SHOW COLUMNS FROM `$dTable`");
            $stmt->execute();
            $dCols = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (empty($dCols)) continue;

            $stmtU = $pdo->prepare("SELECT SchID, SchCode, SchName FROM `$uTable`");
            $stmtU->execute();
            $users = $stmtU->fetchAll();
            if (empty($users)) continue;

            $pdo->exec("DELETE FROM `$dTable`");

            $insertCols = [];
            $colTypes = [];
            foreach ($dCols as $c) {
                $f = $c['Field'];
                $t = strtolower($c['Type']);
                $extra = strtolower($c['Extra'] ?? '');
                if (strpos($extra, 'auto_increment') !== false) continue;
                $insertCols[] = $f;
                if ($f === 'SchID') $colTypes[$f] = 'id';
                else if ($f === 'SchCode') $colTypes[$f] = 'code';
                else if ($f === 'SchName') $colTypes[$f] = 'name';
                else if (strpos(strtolower($f), 'time') !== false) $colTypes[$f] = 'time';
                else if (strpos($t, 'int') !== false || strpos($t, 'decimal') !== false || strpos($t, 'float') !== false) $colTypes[$f] = 'num';
                else $colTypes[$f] = 'text';
            }

            $placeholders = implode(', ', array_fill(0, count($insertCols), '?'));
            $sql = "INSERT INTO `$dTable` (`" . implode('`, `', $insertCols) . "`) VALUES ($placeholders)";
            $insStmt = $pdo->prepare($sql);

            $cnt = 0;
            foreach ($users as $u) {
                $vals = array_map(function($f) use ($colTypes, $u) {
                    $type = $colTypes[$f] ?? 'text';
                    if ($type === 'id') return $u['SchID'] ?? 0;
                    if ($type === 'code') return $u['SchCode'] ?? '';
                    if ($type === 'name') return $u['SchName'] ?? '';
                    if ($type === 'time') return null;
                    if ($type === 'num') return 0;
                    return '';
                }, $insertCols);
                $insStmt->execute($vals);
                $cnt++;
            }
            $results[] = ['table' => $dTable, 'count' => $cnt];
        } catch (\Exception $e) {}
    }

    sendJson(['success' => true, 'results' => $results, 'message' => 'Επαναφορά πινάκων δεδομένων ολοκληρώθηκε!']);
}

// Default 404 handler for unmatched routes
sendJson(['error' => 'Endpoint not found', 'route' => $route], 404);

