import * as XLSX from 'xlsx-js-style';

/**
 * Interface pour les données d'export
 */
interface ExportData {
    className: string;
    trimester: number;
    students: { id: string; first_name: string; last_name: string }[];
    evaluations: { title: string; max_value: number }[];
    grades: { student_id: string; evaluation_title: string; grade_value: number | null; max_value: number }[];
    sessions: { id: string; scheduled_time: string }[];
    attendances: { student_id: string; session_id: string; status: string }[];
}

/**
 * Couleurs et styles Ostad
 */
const COLORS = {
    NAVY_DARK: "1A1A2E", // Bleu nuit Ostad
    BLUE_OSTAD: "4F7CFF", // Bleu Ostad
    WHITE: "FFFFFF",
    BLACK: "000000",
    GRAY_LIGHT: "F3F4F6",
    GRAY_TEXT: "9CA3AF",
    GREEN_BG: "D1FAE5",
    GREEN_TEXT: "065F46",
    YELLOW_BG: "FEF3C7",
    YELLOW_TEXT: "92400E",
    RED_BG: "FEE2E2",
    RED_TEXT: "991B1B",
    BLUE_LIGHT_BG: "F0F9FF",
    INDIGO_BG: "E0E7FF", // Lavande pour totaux
};

/**
 * Fonction principale d'export Excel professionnel
 */
export function exportGradesToExcel(data: ExportData) {
    const wb = XLSX.utils.book_new();
    const today = new Date().toLocaleDateString('fr-FR');

    // --- FEUILLE 1 : NOTES ---
    const ws1 = createNotesSheet(data, today);
    XLSX.utils.book_append_sheet(wb, ws1, `Notes Trim.${data.trimester}`);

    // --- FEUILLE 2 : PRÉSENCES ---
    const ws2 = createAttendanceSheet(data, today);
    XLSX.utils.book_append_sheet(wb, ws2, "Présences");

    // --- GÉNÉRATION DU FICHIER ---
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `ostad_${data.className.replace(/\s+/g, '_')}_T${data.trimester}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName, {
        bookType: 'xlsx',
        cellStyles: true
    });
}

/**
 * Création de la feuille des notes
 */
function createNotesSheet(data: ExportData, exportDate: string) {
    const ws: XLSX.WorkSheet = {};
    const range = { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }; // Par défaut A1:G1

    // 1. BLOC TITRE (Lignes 1-3)
    const titleRows = [
        "OSTAD — Carnet de Notes",
        `${data.className} — Trimestre ${data.trimester}`,
        `Exporté le ${exportDate}`
    ];

    titleRows.forEach((title, i) => {
        const addr = XLSX.utils.encode_cell({ r: i, c: 0 });
        ws[addr] = {
            v: title,
            t: 's',
            s: {
                fill: { patternType: "solid", fgColor: { rgb: COLORS.NAVY_DARK } },
                font: { bold: true, color: { rgb: COLORS.WHITE }, sz: i === 0 ? 16 : 12, name: "Calibri" },
                alignment: { horizontal: "center", vertical: "center" }
            }
        };
    });

    // Fusion des titres
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    ];

    // 2. EN-TÊTES DE COLONNES (Ligne 5, index 4)
    const headers = ["N°", "ÉLÈVE", "COMP.", "DEV.1", "DEV.2", "EXAMEN", "MOY. /20"];
    headers.forEach((h, i) => {
        const addr = XLSX.utils.encode_cell({ r: 4, c: i });
        ws[addr] = {
            v: h,
            t: 's',
            s: {
                fill: { patternType: "solid", fgColor: { rgb: COLORS.BLUE_OSTAD } },
                font: { bold: true, color: { rgb: COLORS.WHITE }, sz: 11 },
                alignment: { horizontal: "center", vertical: "center" },
                border: getThinBorder()
            }
        };
    });

    // 3. DONNÉES ÉLÈVES (Lignes 6+, index 5+)
    let currentRow = 5;

    data.students.forEach((student, index) => {
        const rowIdx = currentRow + index;
        const studentName = `${student.last_name.toUpperCase()} ${student.first_name}`;

        // Colonne N°
        setStyledCell(ws, rowIdx, 0, (index + 1).toString(), {
            alignment: { horizontal: "center" },
            font: { color: { rgb: "666666" } },
            border: getThinBorder()
        });

        // Colonne ÉLÈVE
        setStyledCell(ws, rowIdx, 1, studentName, {
            fill: { patternType: "solid", fgColor: { rgb: COLORS.BLUE_LIGHT_BG } },
            font: { bold: true },
            alignment: { horizontal: "left" },
            border: getThinBorder()
        });

        // Mapping des notes par type obligatoire
        const compGrade = findGrade(data, student.id, "Comportement");
        const dev1Grade = findGrade(data, student.id, "Devoir 1");
        const dev2Grade = findGrade(data, student.id, "Devoir 2");
        const examGrade = findGrade(data, student.id, "Examen");

        const gradesArray = [compGrade, dev1Grade, dev2Grade, examGrade];
        let sum = 0;
        let count = 0;

        // Remplissage colonnes notes (index 2 à 5)
        gradesArray.forEach((g, i) => {
            const colIdx = i + 2;
            const style = getGradeStyle(g);
            setStyledCell(ws, rowIdx, colIdx, g === null ? "Abs." : g, { ...style, border: getThinBorder() });

            if (g !== null) {
                sum += g;
                count++;
            }
        });

        // Colonne MOYENNE (index 6)
        const individualAvg = count > 0 ? Number((sum / count).toFixed(2)) : null;
        const avgStyle = getGradeStyle(individualAvg);
        setStyledCell(ws, rowIdx, 6, individualAvg === null ? "-" : individualAvg, {
            ...avgStyle,
            font: { ...avgStyle.font, bold: true },
            border: getThinBorder(),
            fill: { ...avgStyle.fill, fgColor: { rgb: shiftColor(avgStyle.fill.fgColor.rgb, -10) } }
        });
    });

    // 4. LIGNE MOYENNE DE CLASSE
    const totalStudents = data.students.length;
    const finalRowIdx = currentRow + totalStudents;

    setStyledCell(ws, finalRowIdx, 1, "MOY. CLASSE", {
        fill: { patternType: "solid", fgColor: { rgb: COLORS.INDIGO_BG } },
        font: { bold: true, italic: true },
        border: getMediumBorder()
    });

    // Moyennes par colonne de notes
    for (let c = 2; c <= 6; c++) {
        let colSum = 0;
        let colCount = 0;
        for (let r = currentRow; r < finalRowIdx; r++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (cell && typeof cell.v === 'number') {
                colSum += cell.v;
                colCount++;
            }
        }
        const colAvg = colCount > 0 ? Number((colSum / colCount).toFixed(2)) : "-";
        setStyledCell(ws, finalRowIdx, c, colAvg, {
            fill: { patternType: "solid", fgColor: { rgb: COLORS.INDIGO_BG } },
            font: { bold: true },
            alignment: { horizontal: "center" },
            border: getMediumBorder()
        });
    }

    // Paramètres de feuille
    ws['!cols'] = [
        { wch: 6 },  // N°
        { wch: 28 }, // Élève
        { wch: 16 }, // Comportement
        { wch: 12 }, // Devoir 1
        { wch: 12 }, // Devoir 2
        { wch: 12 }, // Examen
        { wch: 14 }  // Moyenne
    ];

    ws['!rows'] = [
        { hpx: 25 }, { hpx: 25 }, { hpx: 25 },
        { hpx: 10 }, // Espacement
        { hpx: 20 }  // En-têtes
    ];
    for (let i = 0; i < totalStudents + 1; i++) {
        ws['!rows'].push({ hpx: 18 });
    }

    range.e.r = finalRowIdx;
    ws['!ref'] = XLSX.utils.encode_range(range);

    return ws;
}

/**
 * Création de la feuille de présence
 */
function createAttendanceSheet(data: ExportData, exportDate: string) {
    const ws: XLSX.WorkSheet = {};
    const totalCols = Math.max(7, data.sessions.length + 4);

    // Titres (identiques)
    const titleRows = [
        "OSTAD — Registre de Présence",
        `${data.className} — Trimestre ${data.trimester}`,
        `Exporté le ${exportDate}`
    ];

    titleRows.forEach((title, i) => {
        const addr = XLSX.utils.encode_cell({ r: i, c: 0 });
        ws[addr] = {
            v: title,
            t: 's',
            s: {
                fill: { patternType: "solid", fgColor: { rgb: COLORS.NAVY_DARK } },
                font: { bold: true, color: { rgb: COLORS.WHITE }, sz: i === 0 ? 16 : 12 },
                alignment: { horizontal: "center", vertical: "center" }
            }
        };
    });

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
    ];

    if (data.sessions.length === 0) {
        const emptyAddr = XLSX.utils.encode_cell({ r: 5, c: 0 });
        ws[emptyAddr] = {
            v: "Aucune séance enregistrée ce trimestre",
            t: 's',
            s: { font: { italic: true }, alignment: { horizontal: "center" } }
        };
        ws['!merges'].push({ s: { r: 5, c: 0 }, e: { r: 5, c: totalCols - 1 } });
    } else {
        // En-têtes
        const attHeaders = ["N°", "ÉLÈVE"];
        data.sessions.forEach(s => {
            const d = new Date(s.scheduled_time);
            attHeaders.push(`${d.getDate()}/${d.getMonth() + 1}`);
        });
        attHeaders.push("TOTAL", "%");

        attHeaders.forEach((h, i) => {
            const addr = XLSX.utils.encode_cell({ r: 4, c: i });
            ws[addr] = {
                v: h,
                t: 's',
                s: {
                    fill: { patternType: "solid", fgColor: { rgb: COLORS.BLUE_OSTAD } },
                    font: { bold: true, color: { rgb: COLORS.WHITE } },
                    alignment: { horizontal: "center" },
                    border: getThinBorder()
                }
            };
        });

        // Données
        data.students.forEach((student, sIdx) => {
            const rowIdx = 5 + sIdx;
            setStyledCell(ws, rowIdx, 0, sIdx + 1, { border: getThinBorder() });
            setStyledCell(ws, rowIdx, 1, `${student.last_name.toUpperCase()} ${student.first_name}`, { border: getThinBorder(), font: { bold: true } });

            let pCount = 0;
            data.sessions.forEach((session, sessIdx) => {
                const att = data.attendances.find(a => a.student_id === student.id && a.session_id === session.id);
                const status = att?.status || "-";
                const style = getAttendanceStyle(status);
                setStyledCell(ws, rowIdx, 2 + sessIdx, status, { ...style, border: getThinBorder(), alignment: { horizontal: "center" } });
                if (status === "P") pCount++;
            });

            // Totaux
            const totalSess = data.sessions.length;
            setStyledCell(ws, rowIdx, 2 + totalSess, pCount, { border: getThinBorder(), font: { bold: true } });
            setStyledCell(ws, rowIdx, 3 + totalSess, `${Math.round((pCount / totalSess) * 100)}%`, { border: getThinBorder() });
        });
    }

    ws['!cols'] = [{ wch: 6 }, { wch: 28 }, ...data.sessions.map(() => ({ wch: 6 })), { wch: 8 }, { wch: 8 }];
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 5 + data.students.length, c: totalCols - 1 } });

    return ws;
}

// --- HELPERS ---

function setStyledCell(ws: XLSX.WorkSheet, r: number, c: number, v: any, s: any) {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { v, t: typeof v === 'number' ? 'n' : 's', s };
}

function findGrade(data: ExportData, studentId: string, title: string): number | null {
    const g = data.grades.find(g => g.student_id === studentId && g.evaluation_title === title);
    return g ? g.grade_value : null;
}

function getGradeStyle(val: number | null) {
    if (val === null) return { fill: { patternType: "solid", fgColor: { rgb: COLORS.GRAY_LIGHT } }, font: { color: { rgb: COLORS.GRAY_TEXT } }, alignment: { horizontal: "center" } };
    if (val >= 15) return { fill: { patternType: "solid", fgColor: { rgb: COLORS.GREEN_BG } }, font: { color: { rgb: COLORS.GREEN_TEXT } }, alignment: { horizontal: "center" } };
    if (val >= 10) return { fill: { patternType: "solid", fgColor: { rgb: COLORS.YELLOW_BG } }, font: { color: { rgb: COLORS.YELLOW_TEXT } }, alignment: { horizontal: "center" } };
    return { fill: { patternType: "solid", fgColor: { rgb: COLORS.RED_BG } }, font: { color: { rgb: COLORS.RED_TEXT } }, alignment: { horizontal: "center" } };
}

function getAttendanceStyle(status: string) {
    if (status === "P") return { fill: { patternType: "solid", fgColor: { rgb: COLORS.GREEN_BG } } };
    if (status === "A") return { fill: { patternType: "solid", fgColor: { rgb: COLORS.RED_BG } } };
    if (status === "R") return { fill: { patternType: "solid", fgColor: { rgb: COLORS.YELLOW_BG } } };
    return {};
}

function getThinBorder() {
    const b = { style: "thin", color: { rgb: COLORS.BLACK } };
    return { top: b, bottom: b, left: b, right: b };
}

function getMediumBorder() {
    const b = { style: "medium", color: { rgb: COLORS.BLACK } };
    return { top: b, bottom: b, left: b, right: b };
}

/**
 * Assombrit ou éclaircit un hexadécimal (simple version)
 */
function shiftColor(hex: string, amount: number) {
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
}
