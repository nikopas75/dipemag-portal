import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SqlAuditLog } from '../types';
import { loadGreekFontToDoc } from '../../../utils/pdfFontLoader';

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

