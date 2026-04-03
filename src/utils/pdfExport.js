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
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                doc.setFont('Roboto');
            }
        } catch(e) {
            console.warn("Could not load Vietnamese font, using fallback", e);
        }

        doc.setFontSize(14);
        doc.text("BIỂU GIAO THÀNH PHẨM QUA CÔNG TY LẠC TỶ", 40, 40);
        
        doc.setFontSize(9);
        doc.text("ĐƠN VỊ CHUYỂN: DD (Long An)", 40, 60);
        doc.text("ĐƠN VỊ LÃNH: CÔNG TY LẠC TỶ", 600, 60);

        const totalExported = group.rows.reduce((sum, r) => sum + (Number(r.shipped_quantity) || 0), 0);
        doc.text(`Ngày: ${group.date}`, 40, 80);
        doc.text(`Tổng giao: ${totalExported}`, 40, 100);
        doc.text("Ký: T1", 200, 80);

        doc.setTextColor(0, 51, 204); 
        doc.text("HÀNG LỆNH", 40, 115);
        doc.setTextColor(0, 0, 0);

        const head = [
            [
                "STT", "ĐƠN HÀNG", "MODEL NAME", "SL\nGIAO", 
                "CÒN LẠI", "ĐƠN VỊ", "ART", 
                ...sizes, "Ghi chú"
            ]
        ];

        const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

        const body = group.rows.map((row, i) => {
            const isOk = (Number(row.remaining_quantity) || 0) <= 0;
            return [
                i + 1,
                row.ry_number || "",
                row.model_name || "",
                row.shipped_quantity || 0,
                isOk ? "OK" : row.remaining_quantity,
                "ĐÔI",
                row.article || "",
                ...sizes.map(s => {
                    const val = row[sizeToCol(s)];
                    return (val && val !== 0) ? val : "-";
                }),
                ""
            ];
        });

        autoTable(doc, {
            startY: 125,
            head: head,
            body: body,
            theme: 'grid',
            styles: {
                font: 'Roboto',
                fontSize: 7,
                cellPadding: 2,
                overflow: 'hidden',
                valign: 'middle',
                halign: 'center',
                lineWidth: 0.5,
                lineColor: [0, 0, 0]
            },
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0]
            },
            columnStyles: {
                1: { cellWidth: 70 }, // ĐƠN HÀNG
                2: { cellWidth: 'auto', halign: 'left' } // MODEL NAME
            },
            margin: { top: 30, right: 20, bottom: 30, left: 20 }
        });

        doc.save(`Bieu_Giao_CTY_Lac_Ty_${group.date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
        console.error("PDF Export error:", error);
        alert("Lỗi xuất PDF: " + error.message);
    }
};
