const fs = require('fs');
const csv = require('csv-parser');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const path = require('path');

// Configuración
const TEMPLATE_PATH = './ENTREGA DE CLAVE DE ACCESO.docx';
const CSV_PATH = './usuarios.csv';
const OUTPUT_DIR = './documentos-generados';

// Campos del sistema que se llenarán manualmente
const systemData = {
    sistema: '',
    ip: '',
    fecha: new Date().toLocaleDateString('es-ES')
};

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Leer el archivo CSV
const users = [];

fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
        users.push({
            primer_apellido: row.primer_apellido,
            segundo_apellido: row.segundo_apellido,
            nombres: row.nombres,
            usuario: row.usuario,
            contraseña: row.contraseña,
            ...systemData
        });
    })
    .on('end', () => {
        console.log(`Se encontraron ${users.length} usuarios en el CSV`);
        generateDocuments(users);
    });

function generateDocuments(users) {
    // Leer la plantilla Word
    const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
    const zip = new PizZip(content);
    
    users.forEach((user, index) => {
        try {
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            
            // Reemplazar los campos en la plantilla
            doc.render({
                primer_apellido: user.primer_apellido,
                segundo_apellido: user.segundo_apellido,
                nombres: user.nombres,
                usuario: user.usuario,
                contraseña: user.contraseña,
                sistema: user.sistema,
                ip: user.ip,
                fecha: user.fecha
            });
            
            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });
            
            // Generar nombre del archivo
            const fileName = `${user.primer_apellido}_${user.nombres}_clave_acceso.docx`;
            const outputPath = path.join(OUTPUT_DIR, fileName);
            
            fs.writeFileSync(outputPath, buf);
            console.log(`Documento generado: ${fileName}`);
            
        } catch (error) {
            console.error(`Error generando documento para usuario ${index + 1}:`, error.message);
        }
    });
    
    console.log('Proceso completado. Los documentos están en la carpeta:', OUTPUT_DIR);
}
