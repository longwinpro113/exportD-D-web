import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportStockReportPdf = async (group, sizes) => {
    // A4 Landscape: 842 x 595 points
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    
    // Load Roboto font to support Vietnamese
    try {
        const res = await fetch("https://unpkg.com/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf");
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            const arr = new Uint8Array(buffer);
            let binary = '';
            const len = arr.byteLength;
            for (let i = 0; i < len; i++) {
                 binary += String.fromCharCode(arr[i]);
            }
            const base64Font = btoa(binary);
            doc.addFileToVFS('Roboto-Regular.ttf', base64Font);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
        }
    } catch(e) {
        console.warn("Could not load font, default will be used", e);
    }

    // Colors and Fonts setup
    doc.setFontSize(12);
    doc.setFont("Roboto", "bold");
    doc.text("BIỂU GIAO THÀNH PHẨM QUA CÔNG TY LẠC TỶ", 40, 40);
    
    doc.setFontSize(9);
    doc.setFont("Roboto", "normal");
    doc.text("ĐƠN VỊ CHUYỂN: DD (Long An)", 40, 60);
    doc.text("ĐƠN VỊ LÃNH: CÔNG TY LẠC TỶ", 600, 60);

    const totalExported = group.rows.reduce((sum, r) => sum + (Number(r.shipped_quantity) || 0), 0);
    doc.text(`Ngày: ${group.date}`, 40, 80);
    doc.text(`Tổng giao: ${totalExported}`, 40, 100);
    doc.text("Ký: T1", 200, 80);

    doc.setTextColor(0, 51, 204); // Blue text for "HÀNG LỆNH"
    doc.text("HÀNG LỆNH", 40, 115);
    doc.setTextColor(0, 0, 0);

    const head = [
        [
            "STT", "ĐƠN HÀNG", "MODEL NAME", "SL\nGIAO\nHÀNG", 
            "CÒN LẠI\nCHƯA GIAO", "ĐƠN VỊ", "ART", 
            ...sizes, "Ghi chú"
        ]
    ];

    const sizeToCol = (size) => `s${size.toString().replace('.', '_')}`;

    const body = group.rows.map((row, i) => {
        const isOk = (Number(row.remaining_quantity) || 0) <= 0;
        const rowData = [
            i + 1,
            row.ry_number,
            row.model_name || "",
            row.shipped_quantity || 0,
            isOk ? "OK" : row.remaining_quantity,
            "ĐÔI",
            row.article || "",
            ...sizes.map(s => {
                const val = row[sizeToCol(s)];
                return val > 0 ? val : "-";
            }),
            "" // Ghi chú
        ];
        return rowData;
    });

    doc.autoTable({
        startY: 125,
        head: head,
        body: body,
        theme: 'grid',
        styles: {
            font: 'Roboto',
            fontSize: 7,
            cellPadding: 2,
            overflow: 'hidden', // Forces no wrap as requested
            valign: 'middle',
            halign: 'center',
            lineWidth: 0.5,
            lineColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        columnStyles: {
            1: { fontStyle: 'bold' } // ĐƠN HÀNG
        },
        margin: { top: 40, right: 20, bottom: 40, left: 20 }
    });

    doc.save(`Bieu_Giao_CTY_Lac_Ty_${group.date.replace(/\//g, '-')}.pdf`);
};
