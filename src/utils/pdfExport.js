import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportStockReportPdf = async (group, sizes) => {
    try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        
        // Load Roboto font to support Vietnamese
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
                // Map the font to multiple styles so they all use the loaded font
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
                doc.setFont('Roboto');
            }
        } catch(e) {
            console.warn("Could not load Vietnamese font, using fallback", e);
        }

        const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;
        
        // Find the maximum size column that has data
        let activeSizes = [];
        let maxIndexWithData = -1;
        sizes.forEach((s, idx) => {
            const hasData = group.rows.some(row => (parseFloat(row[sizeToCol(s)]) || 0) > 0);
            if (hasData) maxIndexWithData = idx;
        });
        activeSizes = sizes.slice(0, maxIndexWithData + 1);
        if (activeSizes.length === 0) activeSizes = [sizes[0]]; // fallback

        // Get dynamic client name
        const firstRow = group.rows[0] || {};
        const clientName = firstRow.client || firstRow.client_name || "-";

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.text("BIỂU GIAO THÀNH PHẨM", 40, 40);
        
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(10);
        doc.text("ĐƠN VỊ CHUYỂN: DD (Long An)", 40, 60);
        doc.text(`ĐƠN VỊ LÃNH: ${clientName.toUpperCase()}`, 600, 60);

        const totalExported = group.rows.reduce((sum, r) => sum + (Number(r.shipped_quantity) || 0), 0);
        doc.text(`Ngày: ${group.date}`, 40, 85);
        doc.text(`Tổng giao: ${totalExported}`, 40, 105);
        doc.text("Kỳ: T1", 280, 85).fill("red");

        doc.setTextColor(0, 51, 204); 
        doc.setFont('Roboto', 'bold');
        // doc.text("HÀNG LỆNH", 40, 125);
        doc.setTextColor(0, 0, 0);

        const head = [
            [
                "STT", "ĐƠN HÀNG", "ART", "MODEL NAME", "SL\nGIAO", 
                "CÒN LẠI", "ĐƠN\nVỊ", 
                ...activeSizes, "GHI\nCHÚ"
            ]
        ];

        const body = group.rows.map((row, i) => {
            const isOk = (Number(row.remaining_quantity) || 0) <= 0;
            return [
                i + 1,
                // row.client || row.client_name || "",
                row.ry_number || "",
                row.model_name || "",
                row.shipped_quantity || 0,
                isOk ? "OK" : row.remaining_quantity,
                "ĐÔI",
                row.article || "",
                ...activeSizes.map(s => {
                    const val = row[sizeToCol(s)];
                    return (val && val !== 0) ? val : "-";
                }),
                row.note || ""
            ];
        });

        autoTable(doc, {
            startY: 135,
            head: head,
            body: body,
            theme: 'grid',
            styles: {
                font: 'Roboto',
                fontStyle: 'normal',
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak', // Allow wrapping
                valign: 'middle',
                halign: 'center',
                lineWidth: 0.2,
                lineColor: [80, 80, 80]
            },
            headStyles: {
                font: 'Roboto',
                fontStyle: 'bold',
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineWidth: 0.5,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 22 }, // STT
                // 1: { cellWidth: 55, halign: 'left' }, // KHÁCH HÀNG
                1: { cellWidth: 65, fontStyle: 'bold' }, // ĐƠN HÀNG
                3: { cellWidth: 'auto', halign: 'center' }, // MODEL NAME
                4: { cellWidth: 30 }, // SL GIAO
                5: { cellWidth: 30 }, // CÒN LẠI
                6: { cellWidth: 30 }, // ĐƠN VỊ
                2: { cellWidth: 45 }, // ART
                [8 + activeSizes.length]: { cellWidth: 40, halign: 'left' } // GHI CHÚ
            },
            margin: { top: 30, right: 20, bottom: 30, left: 20 }
        });

        doc

        doc.save(`Bieu_Giao_${clientName.replace(/\s+/g, '_')}_${group.date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
        console.error("PDF Export error:", error);
        alert("Lỗi xuất PDF: " + error.message);
    }
};
