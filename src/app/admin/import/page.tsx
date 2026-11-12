"use client";

import * as React from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calendar,
  Scissors,
  PackageCheck,
  Layers,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileUp,
  ArrowRight,
  Database,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ImportType = "services" | "categories" | "packages" | "calendar" | "historical";

interface ValidationError {
  row: number;
  error: string;
  severity?: "error" | "warning";
}

interface ImportSummary {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: ValidationError[];
}

export default function AdminImportPage() {
  const [selectedType, setSelectedType] = React.useState<ImportType>("services");
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const [overwrite, setOverwrite] = React.useState<boolean>(false);
  
  // Status states
  const [isValidating, setIsValidating] = React.useState<boolean>(false);
  const [isCommitting, setIsCommitting] = React.useState<boolean>(false);
  const [validationResult, setValidationResult] = React.useState<{
    valid: boolean;
    errors: ValidationError[];
    preview: any[];
  } | null>(null);
  const [commitResult, setCommitResult] = React.useState<ImportSummary | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // Parse CSV text safely
  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      alert("CSV file must contain at least a header row and one data row.");
      return;
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    setCsvHeaders(headers);

    // Simple regex for CSV line splitting
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex handling commas inside quotes
      const values: string[] = [];
      let inQuote = false;
      let currentVal = "";

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === "," && !inQuote) {
          values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : "";
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setValidationResult(null);
    setCommitResult(null);
    setStatusMessage(`Loaded ${rows.length} rows from CSV. Ready for Step 5: Dry-Run Validation.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseCsvText(content);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Download Template
  const downloadTemplate = () => {
    if (selectedType === "services" || selectedType === "categories" || selectedType === "packages") {
      window.open(`/api/admin/import/services?type=${selectedType}`, "_blank");
    } else if (selectedType === "calendar") {
      window.open("/api/admin/import/calendar", "_blank");
    } else if (selectedType === "historical") {
      window.open("/api/admin/import/historical", "_blank");
    }
  };

  // Dry Run Validation
  const runDryRunValidation = async () => {
    if (parsedRows.length === 0) return;
    try {
      setIsValidating(true);
      setStatusMessage("Validating records against schema and constraints...");

      let endpoint = "/api/admin/import/services";
      let payload: any = { type: selectedType, records: parsedRows, dryRun: true, overwrite };

      if (selectedType === "calendar") {
        endpoint = "/api/admin/import/calendar";
        payload = { records: parsedRows, dryRun: true, overwrite };
      } else if (selectedType === "historical") {
        endpoint = "/api/admin/import/historical";
        payload = { records: parsedRows, dryRun: true };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setValidationResult({
          valid: data.valid,
          errors: data.errors || [],
          preview: data.preview || parsedRows.slice(0, 10),
        });
        setStatusMessage(
          data.valid
            ? "Validation Passed! All rows are compliant. You may now confirm and commit."
            : `Validation complete with ${data.errors.length} issue(s). Review below before committing.`
        );
      } else {
        alert(data.error || "Validation failed");
      }
    } catch (e: any) {
      alert("Validation failed: " + e.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Commit Import
  const commitImport = async () => {
    if (parsedRows.length === 0) return;
    try {
      setIsCommitting(true);
      setStatusMessage("Executing commit to database...");

      let endpoint = "/api/admin/import/services";
      let payload: any = { type: selectedType, records: parsedRows, dryRun: false, overwrite };

      if (selectedType === "calendar") {
        endpoint = "/api/admin/import/calendar";
        payload = { records: parsedRows, dryRun: false, overwrite };
      } else if (selectedType === "historical") {
        endpoint = "/api/admin/import/historical";
        payload = { records: parsedRows, dryRun: false };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setCommitResult(data.result);
        setStatusMessage(data.message || "Import successfully committed to database!");
      } else {
        alert(data.error || "Failed to commit import");
      }
    } catch (e: any) {
      alert("Commit failed: " + e.message);
    } finally {
      setIsCommitting(false);
    }
  };

  // Reset
  const resetForm = () => {
    setFile(null);
    setParsedRows([]);
    setCsvHeaders([]);
    setValidationResult(null);
    setCommitResult(null);
    setStatusMessage(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack/60 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-salon-gold/20 text-salon-gold border border-salon-gold/30">
              Bulk Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Data Import & Migration Center
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            The Jawed Habib Salon – Lalganj &bull; 9-Step Verification & Payment-Safe Bulk Ingestion
          </p>
        </div>

        {/* Target Selector */}
        <div className="flex flex-wrap items-center bg-zinc-900/80 p-1 rounded-xl border border-salon-borderBlack">
          <button
            onClick={() => {
              setSelectedType("services");
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === "services"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => {
              setSelectedType("categories");
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === "categories"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => {
              setSelectedType("packages");
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === "packages"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Packages
          </button>
          <button
            onClick={() => {
              setSelectedType("calendar");
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === "calendar"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Calendar Overrides
          </button>
          <button
            onClick={() => {
              setSelectedType("historical");
              resetForm();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedType === "historical"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Historical Bookings
          </button>
        </div>
      </div>

      {/* Safety Notice for Historical Bookings */}
      {selectedType === "historical" && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-600/30 flex items-start space-x-3 text-xs text-amber-200">
          <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Phase 7: Payment Safety Guarantee Active</div>
            <p className="mt-0.5 text-zinc-300">
              Imported historical appointments are permanently marked with gateway{" "}
              <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">MANUAL_IMPORT</code>. They will{" "}
              <strong>NEVER</strong> be counted as verified Razorpay transactions or trigger webhook receipts,
              preserving your real financial ledger and audit integrity.
            </p>
          </div>
        </div>
      )}

      {/* 9-Step Visual Flow Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 & 2: Template */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-salon-borderBlack flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-salon-gold">
              Steps 1 & 2
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">Download & Fill Template</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Download the standardized CSV template matching our Lalganj salon schema.
            </p>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              onClick={downloadTemplate}
              className="w-full text-xs bg-salon-gold hover:bg-salon-goldLight text-salon-richBlack font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Step 3 & 4: Upload & Parse */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-salon-borderBlack flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-salon-gold">
              Steps 3 & 4
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">Upload CSV File</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select your populated CSV file. In-browser parser extracts rows safely.
            </p>
          </div>
          <div className="mt-4">
            <label className="flex items-center justify-center px-3 py-2 border border-dashed border-zinc-700 hover:border-salon-gold rounded-lg text-xs text-zinc-300 hover:text-white cursor-pointer bg-zinc-950 transition-colors">
              <Upload className="h-3.5 w-3.5 mr-1.5 text-salon-gold" />
              <span>{file ? file.name : "Select CSV File"}</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Step 5 & 6: Dry Run Validate */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-salon-borderBlack flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-salon-gold">
              Steps 5 & 6
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">Dry-Run Validation</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Runs deep type-checks, category lookups, and detects conflicts prior to saving.
            </p>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={parsedRows.length === 0 || isValidating}
              onClick={runDryRunValidation}
              className="w-full text-xs border-salon-gold/50 text-salon-goldLight hover:bg-salon-gold/10"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Validate ({parsedRows.length} rows)
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step 7, 8 & 9: Confirm & Commit */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-salon-borderBlack flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-salon-gold">
              Steps 7, 8 & 9
            </div>
            <h3 className="text-sm font-semibold text-white mt-1">Confirm & Commit</h3>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="overwriteCheck"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="rounded border-zinc-700 text-salon-gold focus:ring-0"
              />
              <label htmlFor="overwriteCheck" className="text-[11px] text-zinc-300 cursor-pointer">
                Overwrite existing records
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              disabled={parsedRows.length === 0 || isCommitting || Boolean(validationResult && !validationResult.valid)}
              onClick={commitImport}
              className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {isCommitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Committing...
                </>
              ) : (
                <>
                  <Database className="h-3.5 w-3.5 mr-1.5" />
                  Commit to Database
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-salon-borderBlack flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-salon-gold animate-pulse" />
            <span>{statusMessage}</span>
          </div>
          {parsedRows.length > 0 && (
            <button onClick={resetForm} className="text-zinc-500 hover:text-white underline text-[11px]">
              Clear / Reset
            </button>
          )}
        </div>
      )}

      {/* Validation Result Box */}
      {validationResult && (
        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {validationResult.valid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400" />
              )}
              <h3 className="text-sm font-semibold text-white">
                {validationResult.valid ? "Validation Succeeded" : "Validation Errors Detected"}
              </h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                validationResult.valid
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-red-950 text-red-400 border border-red-800"
              }`}
            >
              {validationResult.errors.length} Issue(s)
            </span>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="space-y-1.5 max-h-40 overflow-y-auto bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
              {validationResult.errors.map((err, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong>Row {err.row}:</strong> {err.error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Commit Result Summary Modal / Card */}
      {commitResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/40 space-y-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Step 9: Import Summary Report</h3>
              <p className="text-xs text-zinc-300">
                The database records have been successfully updated for The Jawed Habib Salon – Lalganj.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800">
              <div className="text-zinc-500">Total Rows</div>
              <div className="text-xl font-bold text-white mt-1">{commitResult.total}</div>
            </div>
            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800">
              <div className="text-zinc-500">Newly Inserted</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{commitResult.inserted}</div>
            </div>
            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800">
              <div className="text-zinc-500">Updated / Overwritten</div>
              <div className="text-xl font-bold text-amber-300 mt-1">{commitResult.updated}</div>
            </div>
            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800">
              <div className="text-zinc-500">Skipped Records</div>
              <div className="text-xl font-bold text-zinc-400 mt-1">{commitResult.skipped}</div>
            </div>
          </div>
        </div>
      )}

      {/* Parsed CSV Preview Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              Previewing first {Math.min(10, parsedRows.length)} of {parsedRows.length} uploaded records
            </span>
          </div>

          <div className="rounded-2xl border border-salon-borderBlack bg-zinc-950/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-salon-borderBlack uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    {csvHeaders.map((h) => (
                      <th key={h} className="p-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 text-center text-zinc-500 font-mono">{idx + 1}</td>
                      {csvHeaders.map((h) => (
                        <td key={h} className="p-3 truncate max-w-xs">
                          {String(row[h] || "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
