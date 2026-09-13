import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Loader2,
  Trash2,
  Plus,
  Files
} from 'lucide-react';
import { InfrastructureProject } from '../../types';
import { transformMospiRecord } from '../../data/projectParser';
import { RawMospiProject } from '../../data/mospiPdfRecords';

interface DataImportViewProps {
  onImportSuccess: (projects: InfrastructureProject[]) => void;
  onNavigate: (view: string) => void;
}

interface UploadedFileSummary {
  file: File;
  name: string;
  size: number;
  rowCount: number;
}

export function DataImportView({ onImportSuccess, onNavigate }: DataImportViewProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileSummary[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStats, setImportStats] = useState<{
    totalFiles: number;
    totalRows: number;
    validProjects: number;
    missingDates: number;
    invalidIds: number;
  } | null>(null);

  // Unified map of projectCode -> RawMospiProject accumulating all uploaded files
  const [projectsMap, setProjectsMap] = useState<Map<string, RawMospiProject>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseSingleCsv = (file: File): Promise<{
    rows: any[];
    rawProjects: RawMospiProject[];
    missingDates: number;
    invalidIds: number;
  }> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as any[];
          let missingDatesCount = 0;
          let invalidCount = 0;
          const rawProjects: RawMospiProject[] = [];

          rows.forEach((row, idx) => {
            // Robust case-insensitive and punctuation-insensitive column lookup
            const getValue = (candidateKeys: string[]): string => {
              for (const k of candidateKeys) {
                if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                  return String(row[k]).trim();
                }
              }
              const normCandidates = candidateKeys.map((k) =>
                k.toLowerCase().replace(/[^a-z0-9]/g, '')
              );
              for (const rowKey of Object.keys(row)) {
                const normRowKey = rowKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normCandidates.includes(normRowKey)) {
                  if (row[rowKey] !== undefined && row[rowKey] !== null && String(row[rowKey]).trim() !== '') {
                    return String(row[rowKey]).trim();
                  }
                }
              }
              return '';
            };

            const getId = () =>
              getValue(['Project Code', 'ProjectCode', 'Project ID', 'projectCode', 'Code']) ||
              `PRJ-${file.name.replace(/[^a-zA-Z0-9]/g, '')}-${idx + 1}`;
            const getName = () => getValue(['Project Name', 'Name', 'name']) || 'Unnamed Project';
            const getAgency = () => getValue(['Implementing Agency', 'Agency', 'agency']) || 'Central Agency';
            const getMinistry = () => getValue(['Line Ministry', 'Ministry', 'ministry']) || undefined;
            const getSector = () => getValue(['Sector Name', 'Sector', 'sector']) || 'Infrastructure';
            const getState = () => getValue(['State', 'state', 'Location']) || 'Multi State';

            const approvalDate =
              getValue([
                'Sanction Date',
                'Date of Sanction',
                'Sanction',
                'Date of Approval',
                'Approval Date',
                'Start Date',
              ]) || undefined;

            const origComp =
              getValue([
                'Original Date of Commissioning',
                'Original Completion Date',
                'Original Completion',
                'Original Commissioning',
                'Original Target Date',
              ]) || undefined;

            const revComp =
              getValue([
                'Revised Date of Commissioning',
                'Revised Completion Date',
                'Revised Completion',
                'Revised Commissioning',
                'Anticipated Completion',
                'Expected Completion',
              ]) || undefined;

            if (!approvalDate || !origComp) {
              missingDatesCount++;
            }

            const getNum = (candidateKeys: string[]): number => {
              const raw = getValue(candidateKeys);
              if (!raw) return 0;
              const cleaned = raw.replace(/,/g, '').replace(/[^0-9.-]/g, '');
              const val = parseFloat(cleaned);
              return isNaN(val) ? 0 : val;
            };

            const originalCost = getNum([
              'Original Cost (in cr.)',
              'Original Cost (in cr)',
              'Original Cost',
              'Cost Original',
              'Approved Cost',
            ]);
            const anticipatedCost = getNum([
              'Revised Cost (in cr.)',
              'Revised Cost (in cr)',
              'Revised Cost',
              'Anticipated Cost',
              'Cost Anticipated',
            ]);
            const expenditure = getNum([
              'Expenditure (in cr.)',
              'Expenditure (in cr)',
              'Cumulative Expenditure',
              'Expenditure',
            ]);

            const progRaw = getValue([
              'Physical Progress (in %)',
              'Physical Progress (in % )',
              'Physical Progress',
              'Progress',
            ]);
            let physicalProgress = 0;
            if (progRaw) {
              const cleaned = progRaw.replace('%', '').replace(/,/g, '').trim();
              const parsed = parseFloat(cleaned);
              if (!isNaN(parsed)) physicalProgress = parsed;
            }

            if (getId() && getName()) {
              rawProjects.push({
                slNo: idx + 1,
                projectCode: getId(),
                name: getName(),
                agency: getAgency(),
                ministry: getMinistry(),
                state: getState(),
                sector: getSector(),
                dateOfApproval: approvalDate,
                originalCompletionDate: origComp,
                revisedCompletionDate: revComp,
                costOriginal: originalCost,
                costAnticipated: anticipatedCost || originalCost,
                cumulativeExpenditure: expenditure,
                physicalProgress: physicalProgress,
                tableSource: 'Table-7 Ongoing',
              });
            } else {
              invalidCount++;
            }
          });

          resolve({
            rows,
            rawProjects,
            missingDates: missingDatesCount,
            invalidIds: invalidCount,
          });
        },
        error: (err) => reject(err),
      });
    });
  };

  const processIncomingFiles = async (incomingFiles: File[]) => {
    const csvFiles = incomingFiles.filter((f) => f.name.toLowerCase().endsWith('.csv'));
    if (csvFiles.length === 0) return;

    setIsParsing(true);

    try {
      const nextMap = new Map(projectsMap);
      const newSummaries: UploadedFileSummary[] = [];
      let totalNewRows = 0;
      let totalMissingDates = importStats?.missingDates || 0;
      let totalInvalidIds = importStats?.invalidIds || 0;

      for (const file of csvFiles) {
        // Skip duplicate files already in uploadedFiles
        if (uploadedFiles.some((u) => u.name === file.name && u.size === file.size)) {
          continue;
        }

        const parsed = await parseSingleCsv(file);
        totalNewRows += parsed.rows.length;
        totalMissingDates += parsed.missingDates;
        totalInvalidIds += parsed.invalidIds;

        parsed.rawProjects.forEach((p) => {
          nextMap.set(p.projectCode, p);
        });

        newSummaries.push({
          file,
          name: file.name,
          size: file.size,
          rowCount: parsed.rawProjects.length,
        });
      }

      const updatedFilesList = [...uploadedFiles, ...newSummaries];
      setUploadedFiles(updatedFilesList);
      setProjectsMap(nextMap);

      setImportStats({
        totalFiles: updatedFilesList.length,
        totalRows: (importStats?.totalRows || 0) + totalNewRows,
        validProjects: nextMap.size,
        missingDates: totalMissingDates,
        invalidIds: totalInvalidIds,
      });
    } catch (err) {
      console.error('Error parsing uploaded CSV files:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processIncomingFiles(filesArray);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      processIncomingFiles(filesArray);
    }
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setProjectsMap(new Map());
    setImportStats(null);
  };

  const handleRemoveFile = (index: number) => {
    const remaining = uploadedFiles.filter((_, idx) => idx !== index);
    if (remaining.length === 0) {
      handleClearAll();
      return;
    }
    // Rebuild map from remaining files
    setIsParsing(true);
    setUploadedFiles([]);
    setProjectsMap(new Map());
    setImportStats(null);
    processIncomingFiles(remaining.map((u) => u.file));
  };

  const handleProcessData = async () => {
    if (projectsMap.size === 0) return;
    setIsProcessing(true);

    const allRaw = Array.from(projectsMap.values());
    const generatedProjects = allRaw.map((raw, idx) => transformMospiRecord(raw, idx));

    // 1. Try to persist permanently to the backend disk
    try {
      await fetch('/api/projects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: allRaw }),
      });
    } catch (err) {
      console.warn('Backend persistence request failed, keeping in local session:', err);
    }

    // 2. Update frontend application memory
    setTimeout(() => {
      onImportSuccess(generatedProjects);
      setIsProcessing(false);
      onNavigate('dashboard');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-7 w-7 text-purple-600" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Batch Project Data Import</h1>
          </div>
          {uploadedFiles.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm flex items-center space-x-1 text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Upload one or multiple monthly/sectoral CSV reports. All files will be merged and de-duplicated by Project Code, persisting across reloads.
        </p>

        {/* Upload Dropzone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${uploadedFiles.length > 0 ? 'border-purple-300 bg-purple-50/50 dark:bg-purple-950/10' : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".csv"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {isParsing ? (
            <div className="flex flex-col items-center space-y-3 py-4">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Parsing and merging CSV datasets...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                {uploadedFiles.length > 0 ? <Plus className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {uploadedFiles.length > 0
                    ? 'Drag & drop more CSV files here, or click to browse'
                    : 'Drag & drop all your CSV files here (select multiple)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports multiple CSVs simultaneously • Auto-accumulates without losing previous files
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Files Queue List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Files className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Uploaded Files ({uploadedFiles.length})
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {(uploadedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB Total
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {uploadedFiles.map((u, i) => (
                <div
                  key={`${u.name}-${i}`}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-sm"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <FileSpreadsheet className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {u.name}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      ({(u.size / 1024).toFixed(1)} KB • {u.rowCount} projects)
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(i);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aggregated Parse Results */}
        {importStats && !isParsing && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Consolidated Ingestion Metrics
            </h3>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {importStats.validProjects.toLocaleString('en-IN')} unique infrastructure projects detected
                  </span>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 py-1 px-2.5 rounded-full">
                  {importStats.totalFiles} Files Merged
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    Financial costs, physical progress & commissioning dates mapped
                  </span>
                </div>
              </div>

              {importStats.missingDates > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {importStats.missingDates} records have unannounced commissioning dates (calibrated baselines applied)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleProcessData}
                disabled={isProcessing || importStats.validProjects === 0}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Persisting & Engineering Features...</span>
                  </>
                ) : (
                  <>
                    <span>Process All {importStats.validProjects.toLocaleString('en-IN')} Projects & Update Dashboard</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Explanation Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <FileSpreadsheet className="h-64 w-64" />
        </div>
        <h3 className="text-xl font-semibold mb-3 relative z-10">Multi-File Batch Intelligence</h3>
        <p className="text-indigo-200 mb-6 max-w-2xl relative z-10 leading-relaxed">
          Upload all 13 monthly or sectoral CSVs together. The system unifies project codes, cross-references baseline sanctions, and retains the merged records across browser reloads.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">1. Deduplication</h4>
            <p className="text-sm text-slate-300">
              Multiple reports are automatically merged by unique Project Code, keeping the latest expenditure and progress.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">2. Persistent Storage</h4>
            <p className="text-sm text-slate-300">
              Saves both in browser local cache and the backend disk database so your memory stays intact.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">3. Risk Scoring</h4>
            <p className="text-sm text-slate-300">
              Computes schedule slippage, burn divergences, and generates sector-wide early warnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
