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
  Layers,
  Database,
  RefreshCw,
  PlusCircle,
  FileCheck,
  Trash2
} from 'lucide-react';
import { InfrastructureProject } from '../../types';
import { transformMospiRecord } from '../../data/projectParser';
import { RawMospiProject } from '../../data/mospiPdfRecords';

interface DataImportViewProps {
  onImportSuccess: (projects: InfrastructureProject[], mode?: 'append' | 'replace') => void;
  onNavigate: (view: string) => void;
}

interface FileStats {
  name: string;
  sizeKb: number;
  rowCount: number;
  validCount: number;
}

export function DataImportView({ onImportSuccess, onNavigate }: DataImportViewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatsList, setFileStatsList] = useState<FileStats[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  
  const [importStats, setImportStats] = useState<{
    totalFiles: number;
    totalRows: number;
    validProjects: number;
    missingDates: number;
    invalidIds: number;
  } | null>(null);
  
  const [parsedRawData, setParsedRawData] = useState<RawMospiProject[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(f => f.name.toLowerCase().endsWith('.csv'));
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      parseMultipleCSVs(selectedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(f => f.name.toLowerCase().endsWith('.csv'));
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      parseMultipleCSVs(droppedFiles);
    }
  };

  const parseMultipleCSVs = async (uploadedFiles: File[]) => {
    setIsParsing(true);
    setImportStats(null);
    setParsedRawData([]);
    setFileStatsList([]);

    const aggregatedProjects: RawMospiProject[] = [];
    const statsPerFile: FileStats[] = [];
    let globalTotalRows = 0;
    let globalValid = 0;
    let globalMissingDates = 0;
    let globalInvalid = 0;

    for (let fIdx = 0; fIdx < uploadedFiles.length; fIdx++) {
      const currentFile = uploadedFiles[fIdx];

      await new Promise<void>((resolve) => {
        Papa.parse(currentFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = (results.data as any[]) || [];
            let fileValidCount = 0;

            rows.forEach((row, rIdx) => {
              // Extract field variations commonly present in MoSPI & PMG CSVs
              const getId = () => {
                const code = row['Project ID'] || row['ProjectCode'] || row['projectCode'] || row['PROJECT_CODE'] || row['ID'];
                if (code && String(code).trim()) return String(code).trim();
                return `PRJ-IMP-${fIdx + 1}-${rIdx + 1}-${Date.now().toString(36).slice(-4)}`;
              };

              const getName = () => row['Project Name'] || row['Name'] || row['name'] || row['PROJECT_NAME'] || 'Infrastructure Project';
              const getAgency = () => row['Agency'] || row['Implementing Agency'] || row['AGENCY'] || 'Executing Agency';
              const getSector = () => row['Sector'] || row['SECTOR'] || 'Infrastructure';
              const getState = () => row['State'] || row['STATE'] || 'Multi State';

              const getDate = (keys: string[]) => {
                for (const key of keys) {
                  if (row[key] && String(row[key]).trim()) return String(row[key]).trim();
                }
                return undefined;
              };

              const approvalDate = getDate(['Start Date', 'Approval Date', 'Date of Approval', 'APPROVAL_DATE']);
              const origComp = getDate(['Original Completion Date', 'Original Completion', 'ORIG_COMP_DATE']);
              const revComp = getDate(['Revised Completion Date', 'Revised Completion', 'Anticipated Completion', 'Expected Completion', 'REV_COMP_DATE']);

              if (!approvalDate || !origComp) {
                globalMissingDates++;
              }

              const getNum = (keys: string[]) => {
                for (const key of keys) {
                  if (row[key] !== undefined && row[key] !== '') {
                    const val = parseFloat(String(row[key]).replace(/,/g, ''));
                    if (!isNaN(val)) return val;
                  }
                }
                return 0;
              };

              const originalCost = getNum(['Original Cost', 'Cost Original', 'Approved Cost', 'COST_ORIGINAL']);
              const anticipatedCost = getNum(['Anticipated Cost', 'Revised Cost', 'Cost Anticipated', 'COST_ANTICIPATED']) || originalCost;
              const expenditure = getNum(['Cumulative Expenditure', 'Expenditure', 'CUMULATIVE_EXPENDITURE']);

              let physicalProgress = 0;
              const progStr = row['Physical Progress'] || row['Progress'] || row['PHYSICAL_PROGRESS'];
              if (progStr) {
                physicalProgress = parseFloat(String(progStr).replace('%', ''));
                if (isNaN(physicalProgress)) physicalProgress = 0;
              }

              const projectId = getId();
              const projectName = getName();

              if (projectId && projectName) {
                globalValid++;
                fileValidCount++;
                aggregatedProjects.push({
                  slNo: aggregatedProjects.length + 1,
                  projectCode: projectId,
                  name: projectName,
                  agency: getAgency(),
                  state: getState(),
                  sector: getSector(),
                  dateOfApproval: approvalDate,
                  originalCompletionDate: origComp,
                  revisedCompletionDate: revComp,
                  costOriginal: originalCost,
                  costAnticipated: anticipatedCost,
                  cumulativeExpenditure: expenditure,
                  physicalProgress: Math.min(100, Math.max(0, physicalProgress)),
                  tableSource: 'Table-7 Ongoing'
                });
              } else {
                globalInvalid++;
              }
            });

            globalTotalRows += rows.length;
            statsPerFile.push({
              name: currentFile.name,
              sizeKb: Number((currentFile.size / 1024).toFixed(1)),
              rowCount: rows.length,
              validCount: fileValidCount,
            });

            resolve();
          },
          error: (error) => {
            console.error(`Error parsing ${currentFile.name}:`, error);
            resolve();
          }
        });
      });
    }

    setFileStatsList(statsPerFile);
    setImportStats({
      totalFiles: uploadedFiles.length,
      totalRows: globalTotalRows,
      validProjects: globalValid,
      missingDates: globalMissingDates,
      invalidIds: globalInvalid
    });
    setParsedRawData(aggregatedProjects);
    setIsParsing(false);
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (updated.length > 0) {
      parseMultipleCSVs(updated);
    } else {
      setImportStats(null);
      setParsedRawData([]);
      setFileStatsList([]);
    }
  };

  const handleProcessData = () => {
    if (parsedRawData.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const generatedProjects = parsedRawData.map((raw, idx) => transformMospiRecord(raw, idx));
      onImportSuccess(generatedProjects, importMode);
      setIsProcessing(false);
      onNavigate('projects');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-2">
          <FileSpreadsheet className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Multi-File Project Data Import</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
          Upload one or multiple monthly MoSPI / PMG monitoring CSV files. The platform parses multi-file datasets simultaneously, computes ML risk profiles, schedule delays, and seamlessly synchronizes your database.
        </p>

        {/* Upload Dropzone with Multi-File Support */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            files.length > 0 
              ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' 
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          
          {isParsing ? (
            <div className="flex flex-col items-center space-y-3 py-4">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300 font-semibold">Parsing CSV Data Files in Batch...</p>
            </div>
          ) : files.length > 0 ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                  {files.length} {files.length === 1 ? 'CSV File' : 'CSV Files'} Selected
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click or drag additional files to replace or update selection
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 py-4">
              <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-1">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Drag &amp; drop multiple CSV files here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or click to select multiple files from your computer (batch upload supported)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Files Chip List */}
        {fileStatsList.length > 0 && !isParsing && (
          <div className="mt-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Uploaded Files ({fileStatsList.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fileStatsList.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{stat.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{stat.sizeKb} KB • {stat.validCount} valid rows</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Mode Selection Card: Append vs Replace */}
        {importStats && !isParsing && (
          <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Import Integration Mode:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Append (Recommended) */}
              <div 
                onClick={() => setImportMode('append')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'append'
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${importMode === 'append' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'}`}>
                    {importMode === 'append' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Append to Existing Database (Recommended)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  Preserves existing projects and merges new records. Existing projects with matching project codes are updated with new progress.
                </p>
              </div>

              {/* Option 2: Replace */}
              <div 
                onClick={() => setImportMode('replace')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'replace'
                    ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-xs ring-2 ring-rose-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${importMode === 'replace' ? 'border-rose-600 bg-rose-600' : 'border-slate-400'}`}>
                    {importMode === 'replace' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                    Replace Entire Database
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  Clears the existing project registry and replaces it exclusively with records from the uploaded CSV files.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aggregated Parse Results */}
        {importStats && !isParsing && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">
              Aggregated Extraction Results ({importStats.totalFiles} Files)
            </h3>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {importStats.validProjects} projects successfully identified across all files
                  </span>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 py-1 px-2.5 rounded-full">
                  Valid Dataset
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                    Date &amp; cost columns automatically mapped to MoSPI Schema
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {importStats.totalRows} total rows
                </span>
              </div>

              {importStats.invalidIds > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {importStats.invalidIds} empty or corrupted header rows excluded
                    </span>
                  </div>
                </div>
              )}

              {importStats.missingDates > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {importStats.missingDates} projects missing completion dates (defaults generated)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleProcessData}
                disabled={isProcessing || importStats.validProjects === 0}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-xs shadow-sm transition-all hover:shadow"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing &amp; Engineering Features...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {importMode === 'append' ? 'Append Data & Update Dashboard' : 'Replace Data & Update Dashboard'} ({importStats.validProjects} Projects)
                    </span>
                    <ChevronRight className="h-4 w-4" />
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
        <h3 className="text-lg font-bold mb-2 relative z-10">What happens during multi-file processing?</h3>
        <p className="text-indigo-200 mb-6 max-w-2xl relative z-10 text-xs leading-relaxed">
          The NirmaanX engine ingests your records, merges multiple data streams, and automatically computes predictive machine learning risk indices.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
            <h4 className="font-semibold text-indigo-300 mb-1 text-xs">1. Cross-File De-duplication</h4>
            <p className="text-[11px] text-slate-300">Merges records across multiple uploaded CSV sheets using normalized project codes as persistent primary keys.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
            <h4 className="font-semibold text-indigo-300 mb-1 text-xs">2. Dynamic Risk Re-scoring</h4>
            <p className="text-[11px] text-slate-300">Calculates updated schedule slippage, expenditure-progress divergence, and 4-factor ML risk weights.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl">
            <h4 className="font-semibold text-indigo-300 mb-1 text-xs">3. Persistent Portfolio Cache</h4>
            <p className="text-[11px] text-slate-300">Saves your portfolio to browser local cache so changes remain active across sessions and refreshes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
