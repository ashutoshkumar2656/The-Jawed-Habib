/**
 * Data Exporter Utility for The Jawed Habib Salon – Lalganj
 * Supports standard RFC 4180 CSV with UTF-8 BOM and Microsoft Excel XML Spreadsheet format.
 */

/**
 * Escapes a cell value for CSV to prevent formula injection and handle delimiters.
 */
function sanitizeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  let str = String(value);

  // Prevent CSV injection in spreadsheet software
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If contains commas, double quotes, or newlines, wrap in quotes and escape existing quotes
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 Byte Order Mark (BOM).
 */
export function generateCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvValue).join(",");
  const rowLines = rows.map((row) => row.map(sanitizeCsvValue).join(","));
  // \uFEFF ensures Excel automatically recognizes UTF-8 (e.g. ₹ rupee symbol)
  return `\uFEFF${[headerLine, ...rowLines].join("\r\n")}`;
}

/**
 * Escapes characters for XML.
 */
function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates an Excel SpreadsheetML XML document that opens natively in Microsoft Excel,
 * Google Sheets, Apple Numbers, and LibreOffice with styling, bold headers, and column widths.
 */
export function generateExcelXml(
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  columnTypes?: ("String" | "Number")[]
): string {
  const safeSheetName = escapeXml(sheetName.substring(0, 31) || "Report");

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>The Jawed Habib Salon - Lalganj</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>The Jawed Habib Salon</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#111111"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#C6A56B"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
   </Borders>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1A1A1A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataRow">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
   </Borders>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
   </Borders>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="CurrencyCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E5E5"/>
   </Borders>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#111111"/>
   <NumberFormat ss:Format="&quot;₹&quot;\ #,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${safeSheetName}">
  <Table ss:ExpandedColumnCount="${headers.length}" ss:ExpandedRowCount="${rows.length + 1}" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="20">
`;

  // Define columns with generous width
  for (let i = 0; i < headers.length; i++) {
    xml += `   <Column ss:AutoFitWidth="1" ss:Width="130"/>\n`;
  }

  // Header Row
  xml += `   <Row ss:Height="26" ss:StyleID="HeaderStyle">\n`;
  for (const header of headers) {
    xml += `    <Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
  }
  xml += `   </Row>\n`;

  // Data Rows
  for (const row of rows) {
    xml += `   <Row ss:Height="20">\n`;
    for (let c = 0; c < headers.length; c++) {
      const val = row[c];
      const isNumber = typeof val === "number" || (columnTypes && columnTypes[c] === "Number");
      
      if (val === null || val === undefined || val === "") {
        xml += `    <Cell ss:StyleID="DataRow"><Data ss:Type="String"></Data></Cell>\n`;
      } else if (isNumber && !isNaN(Number(val))) {
        xml += `    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${Number(val)}</Data></Cell>\n`;
      } else {
        xml += `    <Cell ss:StyleID="DataRow"><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>\n`;
      }
    }
    xml += `   </Row>\n`;
  }

  xml += `  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <Selected/>
   <Panes>
    <Pane>
     <Number>3</Number>
     <ActiveRow>1</ActiveRow>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  return xml;
}
