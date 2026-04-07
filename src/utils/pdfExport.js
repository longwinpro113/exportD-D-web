import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportStockReportPdf = async (group, sizes) => {
    try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        
        // --- 1. Load Font (Giữ nguyên phần load font của bạn) ---
        try {
            const fontUrl = "https://unpkg.com/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf";
            const res = await fetch(fontUrl);
            if (res.ok) {
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
            }
        } catch(e) { console.warn("Font error", e); }

        const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;
        
        // Xác định các cột size có dữ liệu
        let activeSizes = [];
        let maxIndexWithData = -1;
        sizes.forEach((s, idx) => {
            const hasData = group.rows.some(row => (parseFloat(row[sizeToCol(s)]) || 0) > 0);
            if (hasData) maxIndexWithData = idx;
        });
        activeSizes = sizes.slice(0, maxIndexWithData + 1);
        if (activeSizes.length === 0) activeSizes = [sizes[0]];

        const firstRow = group.rows[0] || {};
        const clientName = firstRow.client || firstRow.client_name || "-";
        const totalExported = group.rows.reduce((sum, r) => sum + (Number(r.shipped_quantity) || 0), 0);

        const pageWidth = doc.internal.pageSize.getWidth();
        const tableColumnWidths = [
            25,
            70,
            60,
            35,
            35,
            30,
            50,
            ...activeSizes.map(() => 22),
            45
        ];
        const desiredTableWidth = tableColumnWidths.reduce((sum, width) => sum + width, 0);
        const maxTableWidth = pageWidth - 40;
        const tableWidth = Math.min(desiredTableWidth, maxTableWidth);
        const tableMargin = Math.max(20, (pageWidth - tableWidth) / 2);
        const tableLeft = tableMargin;
        const tableRight = tableLeft + tableWidth;

        // --- 2. Header & Top Summary (Giữ nguyên) ---
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.text("BIỂU GIAO THÀNH PHẨM", tableLeft, 40);
        
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(10);
        doc.text("ĐƠN VỊ CHUYỂN: DD (Long An)", tableLeft, 60);
        doc.text(`ĐƠN VỊ LÃNH: ${clientName.toUpperCase()}`, tableRight, 60, { align: "right" });
        const summaryY = 85;
        doc.text(`Ngày: ${group.date}`, tableLeft, summaryY);
        doc.text("Kỳ: T1", tableLeft + (tableWidth / 2), summaryY, { align: "center" });

        // Nổi bật Tổng giao phía trên [Màu đỏ]
        const totalLabel = `Tổng giao: ${totalExported}`;
        const labelWidth = doc.getTextWidth(totalLabel);
        const rectWidth = labelWidth + 15; 
        doc.setFillColor(255, 255, 0); 
        doc.rect(tableLeft, 93, rectWidth, 18, 'F'); 

        doc.setFont('Roboto', 'bold');
        doc.setTextColor(0, 0, 0); 
        doc.text(totalLabel, tableLeft + 7, 105);
        doc.setTextColor(0, 0, 0);

        // --- 3. Cấu trúc Table Data (Đã chuyển cột ART) ---
        // VỊ TRÍ 1: Thay đổi tiêu đề bảng
        const head = [[
            "STT", "ĐƠN HÀNG", "MODEL NAME", "SL GIAO", 
            "CÒN LẠI", "ĐƠN VỊ", "ART", ...activeSizes, "GHI CHÚ"
        ]];

        // VỊ TRÍ 2: Thay đổi dữ liệu trong từng dòng
        const body = group.rows.map((row, i) => {
            const isOk = (Number(row.remaining_quantity) || 0) <= 0;
            return [
                i + 1,
                row.ry_number || "",
                row.model_name || "", // Chuyển model_name lên trước ART
                row.shipped_quantity || 0,
                isOk ? "OK" : row.remaining_quantity,
                "ĐÔI",
                row.article || "", // Chuyển article ra sau ĐƠN VỊ
                ...activeSizes.map(s => {
                    const val = row[sizeToCol(s)];
                    return (val && val !== 0) ? val : "-";
                }),
                row.note || ""
            ];
        });

        // Tính toán dòng Tổng Cộng (Footer) (Điều chỉnh thứ tự cột)
        const footerTotals = [
            "",             // STT
            "",             // ĐƠN HÀNG
            "Tổng",         // MODEL NAME (Vị trí chữ "Tổng")
            totalExported,  // SL GIAO (Giá trị tổng duy nhất)
            "",             // CÒN LẠI
            "",             // ĐƠN VỊ
            "",             // ART
            ...activeSizes.map(() => ""), // Các cột size để trống
            ""              // GHI CHÚ
        ];

        const sizeColumnCount = activeSizes.length;

        const sizeStyles = {};
        activeSizes.forEach((_, index) => {
            sizeStyles[7 + index] = { cellWidth: 22 };
        });



        // --- 4. Render Table (Điều chỉnh chiều rộng cột ART) ---
        autoTable(doc, {
            startY: 125,
            head: head,
            body: body,
            foot: [footerTotals], 
            theme: 'grid',
            styles: {
                font: 'Roboto',
                fontSize: 7,
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
                fontSize: 8,
                lineWidth: { top: 0.5, bottom: 0, left: 0, right: 0 }     
            },
            columnStyles: {
                0: { cellWidth: 25 }, // STT
                1: { cellWidth: 70, fontStyle: 'bold' }, // ĐƠN HÀNG
                2: { cellWidth: 60, halign: 'center' }, // MODEL NAME 
                3: { cellWidth: 35, fontStyle: 'bold' }, // SL GIAO
                4: { cellWidth: 35 }, // CÒN LẠI
                5: { cellWidth: 30 }, // ĐÔI
                6: { cellWidth: 50 }, // ART 
                ...sizeStyles,
                [7 + sizeColumnCount]: { cellWidth: 45, halign: 'center' } // GHI CHÚ
            },
            didParseCell: function (data) {
                if (data.column.index === 4 && data.cell.text[0] === 'OK') {
                    data.cell.styles.textColor = [0, 128, 0];
                    data.cell.styles.fontStyle = 'bold';
                }
            },
            margin: { left: tableMargin, right: tableMargin },
            tableWidth
        });

        doc.save(`Bieu_Giao_${clientName.replace(/\s+/g, '_')}_${group.date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
        console.error("PDF Export error:", error);
        alert("Lỗi xuất PDF: " + error.message);
    }
};
