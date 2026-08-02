import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile, DataRecord, SqlAuditLog } from '../types';
import { loadGreekFontToDoc } from '../../../utils/pdfFontLoader';

export async function generateUserDossierPdf(user: UserProfile, records: DataRecord[]) {
  const doc = new jsPDF();
  const hasFont = await loadGreekFontToDoc(doc);
  const activeFont = hasFont ? 'Roboto' : 'helvetica';

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(activeFont, 'bold');
  doc.text('ENTERPRISE MYSQL DATA PORTAL', 14, 18);
  
  doc.setFontSize(10);
  doc.setFont(activeFont, 'normal');
  doc.text('OFFICIAL USER DOSSIER & RELATIONAL RECORD SUMMARY', 14, 26);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  // User Profile Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont(activeFont, 'bold');
  doc.text('Personnel Profile & Database Access Permissions', 14, 50);

  autoTable(doc, {
    startY: 54,
    head: [['Attribute', 'Stored Value', 'Attribute', 'Stored Value']],
    body: [
      ['Personnel ID', `#${user.id}`, 'Username', user.username],
      ['Full Name', user.fullName, 'Account Role', user.role],
      ['Department', user.departmentName, 'Account Status', user.status],
      ['Contact Email', user.email, 'Phone Direct', user.phone],
      ['Office Location', user.location, 'Salary / Budget Cap', `$${user.salaryBudget.toLocaleString()}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, font: activeFont },
    styles: { fontSize: 9, font: activeFont }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 100;

  // Data Records Table
  doc.setFontSize(14);
  doc.setFont(activeFont, 'bold');
  doc.text(`Assigned Database Records (${records.length} Total)`, 14, finalY + 14);

  const tableRows = records.map(r => [
    `#${r.id}`,
    r.category,
    r.title,
    r.clientOrProject,
    `$${r.amount.toLocaleString()}`,
    r.status,
    r.recordDate
  ]);

  autoTable(doc, {
    startY: finalY + 18,
    head: [['ID', 'Category', 'Title', 'Client / Project', 'Amount', 'Status', 'Date']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [14, 116, 144], textColor: 255, font: activeFont }, // Cyan 700
    styles: { fontSize: 8, font: activeFont },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 26 },
      2: { cellWidth: 48 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22 },
      5: { cellWidth: 24 },
      6: { cellWidth: 20 }
    }
  });

  // Footer / Signature
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont(activeFont, 'normal');
  doc.text('Certified by e_aitisi Portal • Confidential Report', 14, pageHeight - 12);
  doc.text(`Page 1 of 1`, 180, pageHeight - 12);

  doc.save(`MySQL_Dossier_${user.username}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function generateCustomDataTablePdf(records: DataRecord[], title = 'Relational Database Export') {
  const doc = new jsPDF('landscape');
  const hasFont = await loadGreekFontToDoc(doc);
  const activeFont = hasFont ? 'Roboto' : 'helvetica';

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 297, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(activeFont, 'bold');
  doc.text(title.toUpperCase(), 14, 16);
  doc.setFontSize(10);
  doc.setFont(activeFont, 'normal');
  doc.text(`Exported from MySQL DataPortal Studio • ${records.length} records selected`, 14, 24);

  const tableRows = records.map(r => [
    `#${r.id}`,
    r.ownerName,
    r.category,
    r.title,
    r.clientOrProject,
    `$${r.amount.toLocaleString()}`,
    r.priority,
    r.status,
    r.recordDate
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['ID', 'Owner', 'Category', 'Title', 'Client / Project', 'Amount', 'Priority', 'Status', 'Record Date']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255, font: activeFont },
    styles: { fontSize: 9, font: activeFont }
  });

  doc.save(`MySQL_Records_Export_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function generateSqlAuditPdf(logs: SqlAuditLog[]) {
  const doc = new jsPDF('landscape');
  const hasFont = await loadGreekFontToDoc(doc);
  const activeFont = hasFont ? 'Roboto' : 'helvetica';

  doc.setFillColor(88, 28, 135); // Purple 900
  doc.rect(0, 0, 297, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(activeFont, 'bold');
  doc.text('MYSQL TRANSACTION AUDIT LOG & QUERY HISTORY', 14, 18);
  doc.setFontSize(10);
  doc.setFont(activeFont, 'normal');
  doc.text(`Recorded ${logs.length} database executions`, 14, 25);

  const rows = logs.map(l => [
    new Date(l.timestamp).toLocaleTimeString(),
    l.username,
    l.actionType,
    `${l.affectedRows} rows`,
    `${l.executionTimeMs} ms`,
    l.query
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['Time', 'User / Actor', 'Action', 'Affected', 'Latency', 'SQL Query Statement']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [107, 33, 168], textColor: 255, font: activeFont },
    styles: { fontSize: 8, font: activeFont },
    columnStyles: {
      5: { cellWidth: 140 }
    }
  });

  doc.save(`MySQL_Audit_Logs_${new Date().toISOString().slice(0, 10)}.pdf`);
}

