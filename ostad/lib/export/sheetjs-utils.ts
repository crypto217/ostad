import * as XLSX from 'xlsx';

interface ExportData {
    className: string;
    trimester: number;
    students: { id: string; first_name: string; last_name: string }[];
    evaluations: { title: string; max_value: number }[];
    grades: { student_id: string; evaluation_title: string; grade_value: number | null; max_value: number }[];
    sessions: { id: string; scheduled_time: string }[];
    attendances: { student_id: string; session_id: string; status: string }[];
}

export function exportGradesToExcel(data: ExportData) {
    const wb = XLSX.utils.book_new();

    // --- SHEET 1: Notes ---
    const worksheet1Data: any[] = [];

    // Line 1: Title
    worksheet1Data.push([`Carnet de Notes — ${data.className} — Trimestre ${data.trimester}`]);

    // Line 2: Empty
    worksheet1Data.push([]);

    // Line 3: Headers
    const headers = ['Élève', ...data.evaluations.map(e => e.title), 'Moyenne /20'];
    worksheet1Data.push(headers);

    // Dynamic data rows
    data.students.forEach(student => {
        const row: any[] = [`${student.last_name} ${student.first_name}`];
        let totalPoints = 0;
        let totalMax = 0;

        data.evaluations.forEach(evalu => {
            const grade = data.grades.find(g => g.student_id === student.id && g.evaluation_title === evalu.title);
            const val = grade?.grade_value;
            row.push(val !== null && val !== undefined ? val : '-');

            if (val !== null && val !== undefined) {
                // Normalize to /20 for average calculation if needed, or just sum?
                // The prompt says "Moyenne /20"
                totalPoints += (val / evalu.max_value) * 20;
                totalMax += 20;
            }
        });

        const average = totalMax > 0 ? (totalPoints / (totalMax / 20)).toFixed(2) : '-';
        row.push(average);
        worksheet1Data.push(row);
    });

    // Class Average
    const lastRow = ['Moyenne de classe'];
    const colAverages = [];
    for (let i = 1; i < headers.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = 3; j < worksheet1Data.length; j++) {
            const val = worksheet1Data[j][i];
            if (val !== '-' && !isNaN(parseFloat(val))) {
                sum += parseFloat(val);
                count++;
            }
        }
        lastRow.push(count > 0 ? (sum / count).toFixed(2) : '-');
    }
    worksheet1Data.push(lastRow);

    const ws1 = XLSX.utils.aoa_to_sheet(worksheet1Data);

    // Column widths
    ws1['!cols'] = [
        { wch: 25 }, // Élève
        ...data.evaluations.map(() => ({ wch: 12 })), // Notes
        { wch: 15 } // Moyenne
    ];

    XLSX.utils.book_append_sheet(wb, ws1, `Notes Trim.${data.trimester}`);

    // --- SHEET 2: Présences ---
    const worksheet2Data: any[] = [];

    // Format dates for headers
    const sessionDates = data.sessions.map(s => {
        const d = new Date(s.scheduled_time);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    const attendanceHeaders = ['Élève', ...sessionDates, 'Total Présences', '% Présence'];
    worksheet2Data.push(attendanceHeaders);

    data.students.forEach(student => {
        const name = `${student.last_name} ${student.first_name}`;
        const row: any[] = [name];
        let presentCount = 0;

        data.sessions.forEach(session => {
            const att = data.attendances.find(a => a.student_id === student.id && a.session_id === session.id);
            const status = att?.status || '-';
            row.push(status);
            if (status === 'P') presentCount++;
        });

        row.push(presentCount);
        const percent = data.sessions.length > 0 ? ((presentCount / data.sessions.length) * 100).toFixed(0) + '%' : '0%';
        row.push(percent);
        worksheet2Data.push(row);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(worksheet2Data);

    // Basic widths for Sheet 2
    ws2['!cols'] = [
        { wch: 25 },
        ...data.sessions.map(() => ({ wch: 8 })),
        { wch: 15 },
        { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, ws2, "Présences");

    // --- DOWNLOAD ---
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `ostad_${data.className.replace(/\s+/g, '_')}_T${data.trimester}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
}
