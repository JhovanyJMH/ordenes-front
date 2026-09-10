# Generador de Documentos de Clave de Acceso

## Descripción
Este sistema genera un solo documento Word con múltiples páginas (una por cada usuario) basándose en una plantilla y un archivo CSV. Está integrado en la aplicación React como una página accesible desde el sidebar.

## Instalación de Dependencias
Las dependencias ya están instaladas en el proyecto:
- docxtemplater
- pizzip
- file-saver

## Estructura del CSV
El archivo CSV debe tener el siguiente formato:
```csv
primer_apellido,segundo_apellido,nombres,usuario,contraseña
Garcia,Lopez,Juan,juan.garcia,pass123
Rodriguez,Martinez,Maria,maria.rodriguez,pass456
```

## Plantilla Word
La plantilla `ENTREGA DE CLAVE DE ACCESO.docx` debe estar ubicada en la carpeta `public/` del proyecto y debe usar la sintaxis de loop de docxtemplater:

### Sintaxis de la Plantilla
Para generar múltiples páginas en un solo documento, la plantilla debe usar la siguiente estructura con saltos de página:

```
{#usuarios}
  {primer_apellido}
  {segundo_apellido}
  {nombres}
  {usuario}
  {contraseña}
  {sistema}
  {ip}
  {fecha}
  
  <!-- Salto de página manual en Word: Ctrl + Enter -->
{/usuarios}
```

**Importante:** Para que cada usuario esté en su propia página, debes:
1. Colocar todo el contenido de una página dentro del loop `{#usuarios}...{/usuarios}`
2. Agregar un salto de página manual al final del contenido (presiona Ctrl + Enter en Word)
3. El salto de página se repetirá para cada usuario excepto el último

### Variables Disponibles
- `{primer_apellido}` - Primer apellido del usuario
- `{segundo_apellido}` - Segundo apellido del usuario
- `{nombres}` - Nombres del usuario
- `{usuario}` - Nombre de usuario para login
- `{contraseña}` - Contraseña del usuario
- `{sistema}` - Nombre del sistema (se llena en el formulario)
- `{ip}` - Dirección IP (se llena en el formulario)
- `{fecha}` - Fecha de generación (se llena en el formulario)

## Uso desde la Aplicación
1. Accede a la sección "Generador Documentos" en el sidebar (solo visible para administradores)
2. Completa los campos del sistema:
   - **Sistema**: Nombre del sistema
   - **IP**: Dirección IP
   - **Fecha**: Fecha de generación (se llena automáticamente)
3. Carga el archivo CSV con los usuarios
4. Haz clic en "Generar Documentos"
5. Se descargará un solo documento con el nombre: `ENTREGA DE CLAVE DE ACCESO {sistema}.docx`

## Notas
- Asegúrate de que el archivo CSV esté codificado en UTF-8
- La plantilla Word debe estar en la carpeta `public/` para ser accesible
- La plantilla debe usar la sintaxis de loop `{#usuarios}...{/usuarios}` para generar múltiples páginas
- Se genera un solo documento con todas las páginas de los usuarios
- El nombre del archivo incluye el nombre del sistema configurado
