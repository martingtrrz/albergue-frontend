import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Cambio en la importación

export const exportToPDF = (data, title, filename) => {
  if (!data || !data.length) {
    console.error("No hay datos para exportar");
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.setTextColor(8, 37, 34);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(110, 140, 137);
  const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
  doc.text(`Generado el: ${fecha}`, 14, 28);

  const tableColumn = ["Nombre", "Edad", "Sexo", "Nacionalidad", "Familia", "Ingreso", "Condición"];
  
  const tableRows = [];
  data.forEach(resident => {
    const rowData = [
      resident.nombre,
      resident.edad,
      resident.sexo,
      resident.nacionalidad,
      resident.familiaId || 'Individual',
      resident.fechaIngreso,
      resident.condicion || 'Sin observaciones'
    ];
    tableRows.push(rowData);
  });

  // <-- Cambio aquí: Llamamos a autoTable pasándole el 'doc' como primer parámetro
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 3,
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [0, 150, 143], 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 250, 249]
    }
  });

  doc.save(`${filename}.pdf`);
};