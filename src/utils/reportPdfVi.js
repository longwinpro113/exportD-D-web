import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const buildFileName = (prefix, clientName, dateLabel) => {
  const sanitize = (value) => String(value || '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  return `${sanitize(prefix)}_${sanitize(clientName || 'Khách Hàng')}_${sanitize(dateLabel || 'report')}.pdf`;
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

const getRowShippedTotal = (row, activeSizes) => {
  const candidates = [row.pdf_shipped_total, row.projected_accumulated_total, row.accumulated_total];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
  }

  return activeSizes.reduce((sum, size) => {
    const sc = sizeToCol(size);
    const originalQty = parseFloat(row[`o${sc}`]) || 0;
    const remainingQty = parseFloat(row[sc]) || 0;
    return sum + Math.max(originalQty - remainingQty, 0);
  }, 0);
};

const getRowRemainingTotal = (row, shippedTotal) => {
  const candidates = [row.pdf_remaining_quantity, row.remaining_quantity];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  const totalQuantity = Number(row.total_quantity) || 0;
  return Math.max(totalQuantity - shippedTotal, 0);
};

const exportReportPdf = async ({
  group,
  sizes,
  title,
  filePrefix,
  format = 'a4',
  fontSize = 7,
  horizontalPageBreak = false,
  clientName = ''
}) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format });
    await loadRobotoFont(doc);

    const activeSizes = getActiveSizes(group, sizes);
    const firstRow = group.rows[0] || {};
    const resolvedClientName = clientName || firstRow.client || firstRow.client_name || '-';
    const rowShippedTotals = group.rows.map((row) => getRowShippedTotal(row, activeSizes));
    const rowRemainingTotals = group.rows.map((row, index) => getRowRemainingTotal(row, rowShippedTotals[index]));
    const totalExported = rowShippedTotals.reduce((sum, value) => sum + value, 0);

    const pageWidth = doc.internal.pageSize.getWidth();
    const tableColumnWidths = [25, 70, 60, 35, 35, 30, 50, ...activeSizes.map(() => 22), 45];
    const desiredTableWidth = tableColumnWidths.reduce((sum, width) => sum + width, 0);
    const maxTableWidth = pageWidth - 40;
    const tableWidth = Math.min(desiredTableWidth, maxTableWidth);
    const tableMargin = Math.max(20, (pageWidth - tableWidth) / 2);

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text(title, tableMargin, 40);

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text('ĐƠN VỊ CHUYỂN: DD (Long An)', tableMargin, 60);
    doc.text(`ĐƠN VỊ LÃNH: ${String(resolvedClientName).toUpperCase()}`, pageWidth - tableMargin, 60, { align: 'right' });

    const summaryY = 85;
    doc.text(`Ngày: ${group.date}`, tableMargin, summaryY);
    doc.text('Kỳ: T1', tableMargin + (tableWidth / 2), summaryY, { align: 'center' });

    const head = [[
      'STT',
      'ĐƠN HÀNG',
      'ĐỢT GIAO HÀNG',
      'SL GIAO',
      'CÒN LẠI',
      'ĐƠN VỊ',
      'ART',
      ...activeSizes,
      'GHI CHÚ'
    ]];

    const body = group.rows.map((row, index) => {
      const shippedTotal = rowShippedTotals[index] || 0;
      const remainingTotal = rowRemainingTotals[index] || 0;
      const isOk = remainingTotal <= 0;

      return [
        index + 1,
        row.ry_number || '',
        row.delivery_round || '',
        shippedTotal,
        isOk ? 'OK' : remainingTotal,
        'ĐÔI',
        row.article || '',
        ...activeSizes.map((size) => {
          const val = row[sizeToCol(size)];
          return (val && val !== 0) ? val : '-';
        }),
        row.note || ''
      ];
    });

    const sizeStyles = {};
    activeSizes.forEach((_, index) => {
      sizeStyles[7 + index] = { cellWidth: 22 };
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

    autoTable(doc, {
      startY: 110,
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
      showFoot: 'lastPage',
      margin: { left: tableMargin, right: tableMargin },
      tableWidth,
      ...(horizontalPageBreak ? {
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: [0, 1, 2, 3, 4, 5, 6]
      } : {})
    });

    doc.save(buildFileName(filePrefix, resolvedClientName, group.date));
  } catch (error) {
    console.error('PDF Export error:', error);
    alert('Lỗi xuất PDF: ' + error.message);
  }
};

export const exportStockReportPdf = (group, sizes, title = 'BIỂU GIAO THÀNH PHẨM', clientName = '') =>
  exportReportPdf({
    group,
    sizes,
    title,
    filePrefix: 'Biểu_Giao',
    clientName
  });

export const exportRemainingReportPdf = (group, sizes, title = 'CHI TIẾT HÀNG CÒN LẠI', clientName = '') =>
  exportReportPdf({
    group,
    sizes,
    title,
    filePrefix: 'Hàng_Còn_Lại',
    format: 'a3',
    fontSize: 7,
    horizontalPageBreak: true,
    clientName
  });

export const exportMonthlyReportPdf = (group, sizes, title = 'BÁO CÁO CÔNG NỢ', clientName = '') =>
  exportReportPdf({
    group,
    sizes,
    title,
    filePrefix: 'Báo_Cáo_Công_Nợ',
    format: 'a3',
    fontSize: 7,
    horizontalPageBreak: true,
    clientName
  });