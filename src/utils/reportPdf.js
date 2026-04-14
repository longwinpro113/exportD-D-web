import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const buildFileName = (prefix, clientName, dateLabel) => {
  const safeClient = (clientName || 'Khach_Hang').replace(/[^\w-]+/g, '_');
  const safeDate = (dateLabel || 'report').replace(/[^\w-]+/g, '_');
  return `${prefix}_${safeClient}_${safeDate}.pdf`;
};

const loadRobotoFont = async (doc) => {
  try {
    const fontUrl = 'https://unpkg.com/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf';
    const res = await fetch(fontUrl);
    if (!res.ok) return;

    const blob = await res.blob();
    const base64Font = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');
  } catch (error) {
    console.warn('Font error', error);
  }
};

const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

const getActiveSizes = (group, sizes) => {
  let maxIndexWithData = -1;
  sizes.forEach((size, idx) => {
    const hasData = group.rows.some((row) => (parseFloat(row[sizeToCol(size)]) || 0) > 0);
    if (hasData) maxIndexWithData = idx;
  });

  const activeSizes = sizes.slice(0, maxIndexWithData + 1);
  return activeSizes.length > 0 ? activeSizes : [sizes[0]];
};

const exportReportPdf = async ({
  group,
  sizes,
  title,
  filePrefix,
  format = 'a4',
  fontSize = 7,
  horizontalPageBreak = false
}) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format });
    await loadRobotoFont(doc);

    const activeSizes = getActiveSizes(group, sizes);
    const firstRow = group.rows[0] || {};
    const clientName = firstRow.client || firstRow.client_name || '-';
    const totalExported = group.rows.reduce((sum, row) => sum + (Number(row.shipped_quantity) || 0), 0);

    const pageWidth = doc.internal.pageSize.getWidth();
    const tableColumnWidths = [25, 70, 60, 35, 35, 30, 50, ...activeSizes.map(() => 22), 45];
    const desiredTableWidth = tableColumnWidths.reduce((sum, width) => sum + width, 0);
    const maxTableWidth = pageWidth - 40;
    const tableWidth = Math.min(desiredTableWidth, maxTableWidth);
    const tableMargin = Math.max(20, (pageWidth - tableWidth) / 2);
    const tableLeft = tableMargin;
    const tableRight = tableLeft + tableWidth;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text(title, tableLeft, 40);

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text('ĐƠN VỊ CHUYỂN: DD (Long An)', tableLeft, 60);
    doc.text(`ĐƠN VỊ LÃNH: ${String(clientName).toUpperCase()}`, tableRight, 60, { align: 'right' });

    const summaryY = 85;
    doc.text(`Ngày: ${group.date}`, tableLeft, summaryY);
    doc.text('Kỳ: T1', tableLeft + (tableWidth / 2), summaryY, { align: 'center' });

    const totalLabel = `Tổng giao: ${totalExported}`;
    const rectWidth = doc.getTextWidth(totalLabel) + 15;
    doc.setFillColor(255, 255, 0);
    doc.rect(tableLeft, 93, rectWidth, 18, 'F');

    doc.setFont('Roboto', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(totalLabel, tableLeft + 7, 105);

    const head = [[
      'STT',
      'ĐƠN HÀNG',
      'MODEL NAME',
      'SL GIAO',
      'CÒN LẠI',
      'ĐƠN VỊ',
      'ART',
      ...activeSizes,
      'GHI CHÚ'
    ]];

    const body = group.rows.map((row, index) => {
      const isOk = (Number(row.remaining_quantity) || 0) <= 0;
      return [
        index + 1,
        row.ry_number || '',
        row.model_name || '',
        row.shipped_quantity || 0,
        isOk ? 'OK' : row.remaining_quantity,
        'ĐÔI',
        row.article || '',
        ...activeSizes.map((size) => {
          const val = row[sizeToCol(size)];
          return (val && val !== 0) ? val : '-';
        }),
        row.note || ''
      ];
    });

    const footerTotals = [
      '',
      '',
      'Tổng',
      totalExported,
      '',
      '',
      '',
      ...activeSizes.map(() => ''),
      ''
    ];

    const sizeStyles = {};
    activeSizes.forEach((_, index) => {
      sizeStyles[7 + index] = { cellWidth: 22 };
    });

    autoTable(doc, {
      startY: 125,
      head,
      body,
      foot: [footerTotals],
      theme: 'grid',
      styles: {
        font: 'Roboto',
        fontSize,
        cellPadding: 3,
        valign: 'middle',
        halign: 'center',
        lineColor: [80, 80, 80]
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.5
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: fontSize + 1,
        lineWidth: { top: 0.5, bottom: 0, left: 0, right: 0 }
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 70, fontStyle: 'bold' },
        2: { cellWidth: 60, halign: 'center' },
        3: { cellWidth: 35, fontStyle: 'bold' },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
        6: { cellWidth: 50 },
        ...sizeStyles,
        [7 + activeSizes.length]: { cellWidth: 45, halign: 'center' }
      },
      didParseCell(data) {
        if (data.column.index === 4 && data.cell.text[0] === 'OK') {
          data.cell.styles.textColor = [0, 128, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: tableMargin, right: tableMargin },
      tableWidth,
      ...(horizontalPageBreak ? {
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: [0, 1, 2, 3, 4, 5, 6]
      } : {})
    });

    doc.save(buildFileName(filePrefix, clientName, group.date));
  } catch (error) {
    console.error('PDF Export error:', error);
    alert('Lỗi xuất PDF: ' + error.message);
  }
};

export const exportStockReportPdf = (group, sizes, title = 'BIỂU GIAO THÀNH PHẨM') =>
  exportReportPdf({
    group,
    sizes,
    title,
    filePrefix: 'Bieu_Giao'
  });

export const exportRemainingReportPdf = (group, sizes, title = 'CHI TIẾT HÀNG CÒN LẠI') =>
  exportReportPdf({
    group,
    sizes,
    title,
    filePrefix: 'Hang_Con_Lai',
    format: 'a3',
    fontSize: 6,
    horizontalPageBreak: true
  });

export const exportMonthlyReportPdf = (group, sizes, title = 'BÁO CÁO CÔNG NỢ') =>
  exportReportPdf({
    group,
    sizes,
    title,
    filePrefix: 'Bao_Cao_Cong_No',
    format: 'a3',
    fontSize: 6,
    horizontalPageBreak: true
  });
