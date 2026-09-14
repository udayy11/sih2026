import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { InfrastructureProject } from '../../types';
import { transformMospiRecord } from '../../data/projectParser';
import { RawMospiProject } from '../../data/mospiPdfRecords';

interface DataImportViewProps {
  onImportSuccess: (projects: InfrastructureProject[]) => void;
  onNavigate: (view: string) => void;
}

export function DataImportView({ onImportSuccess, onNavigate }: DataImportViewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    const selectedFiles = e.target.files ? Array.from(e.target.files).filter(f => f.name.endsWith('.csv')) : [];
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
    const droppedFiles = e.dataTransfer.files ? Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv')) : [];
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      parseMultipleCSVs(droppedFiles);
    }
  };

  const parseMultipleCSVs = async (uploadedFiles: File[]) => {
    setIsParsing(true);
    setImportStats(null);
    setParsedRawData([]);

    let totalRowsCount = 0;
    let missingDatesCount = 0;
    let invalidCount = 0;
    const projectMap = new Map<string, RawMospiProject>();

    for (let fIdx = 0; fIdx < uploadedFiles.length; fIdx++) {
      const currentFile = uploadedFiles[fIdx];
      await new Promise<void>((resolve) => {
        Papa.parse(currentFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data as any[];
            totalRowsCount += rows.length;

            // Helper to find a value from row by checking normalized column keys
            const getField = (rowObj: Record<string, any>, candidates: string[]): string | undefined => {
              const keys = Object.keys(rowObj);
              // 1. Exact match pass
              for (const cand of candidates) {
                if (rowObj[cand] !== undefined && rowObj[cand] !== null) {
                  const val = String(rowObj[cand]).trim();
                  if (val !== '' && val !== '-' && val !== 'N.A.') return val;
                }
              }
              // 2. Normalized match pass (ignoring case, spaces, symbols)
              for (const cand of candidates) {
                const cleanCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
                const foundKey = keys.find(k => {
                  const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return cleanK === cleanCand || cleanK.startsWith(cleanCand) || cleanK.includes(cleanCand);
                });
                if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
                  const val = String(rowObj[foundKey]).trim();
                  if (val !== '' && val !== '-' && val !== 'N.A.') return val;
                }
              }
              return undefined;
            };

            const parseNumber = (val: any): number => {
              if (val === undefined || val === null || val === '' || val === '-') return 0;
              const cleaned = String(val).replace(/,/g, '').replace(/%/g, '').replace(/[^\d.-]/g, '').trim();
              const num = parseFloat(cleaned);
              return isNaN(num) ? 0 : num;
            };

            rows.forEach((row, idx) => {
              const code = getField(row, [
                'Project Code', 'Project Co', 'ProjectCode', 'Project ID', 'ProjectId', 'Code', 'Sr. No.', 'Sr No'
              ]) || `PRJ-NEW-${fIdx + 1}-${idx + 1}`;

              const name = getField(row, [
                'Project Name', 'Project Na', 'ProjectName', 'Name', 'Title', 'Description'
              ]) || 'Unnamed Project';

              const agency = getField(row, [
                'Implementing Agency', 'Implemen', 'Agency', 'ImplementingAgency', 'PSU', 'Organisation'
              ]) || 'MoSPI Implementing Agency';

              const sector = getField(row, [
                'Sector Name', 'Sector Nai', 'Sector', 'SectorName', 'Industry'
              ]) || 'Infrastructure';

              const ministry = getField(row, [
                'Line Ministry', 'Line Minis', 'Ministry', 'LineMinistry', 'Department'
              ]);

              const state = getField(row, [
                'State', 'State/UT', 'Location', 'Region', 'State Name'
              ]) || 'Multi State';

              const approvalDate = getField(row, [
                'Sanction Date', 'SanctionDate', 'Date of Sanction', 'Date of Approval', 'Approval Date', 'Start Date', 'DoA', 'ApprovalDate'
              ]);

              const origComp = getField(row, [
                'Original Date of Commissioning', 'Original Date', 'Original Completion Date', 'Original Completion', 'Original DoC', 'Date of Commissioning (Original)', 'OriginalDate'
              ]);

              const revComp = getField(row, [
                'Revised Date of Commissioning', 'Revised Date', 'Revised Completion Date', 'Revised Completion', 'Anticipated Date of Commissioning', 'Anticipated Completion', 'Revised DoC', 'Anticipated DoC', 'RevisedDate'
              ]);

              const hasCompletionDate = Boolean(origComp || revComp);
              if (!hasCompletionDate) {
                missingDatesCount++;
              }

              const originalCost = parseNumber(getField(row, [
                'Original Cost (in cr.)', 'Original Cost (in cr)', 'Original Cost', 'Cost Original', 'Approved Cost', 'Sanctioned Cost', 'OriginalCost'
              ]));

              const anticipatedCost = parseNumber(getField(row, [
                'Revised Cost (in cr.)', 'Revised Cost (in cr)', 'Revised Cost', 'Anticipated Cost (in cr.)', 'Anticipated Cost', 'Cost Anticipated', 'RevisedCost', 'AnticipatedCost'
              ]));

              const expenditure = parseNumber(getField(row, [
                'Expenditure (in cr.)', 'Expenditure (in cr)', 'Expenditure', 'Cumulative Expenditure', 'Cumulative Expenditure (in cr.)', 'CumulativeExpenditure', 'Exp'
              ]));

              const physicalProgress = parseNumber(getField(row, [
                'Physical Progress (in %)', 'Physical Progress (in %)', 'Physical Progress', 'Progress (in %)', 'Progress (%)', 'Progress', 'PhysicalProgress'
              ]));

              if (code && name) {
                projectMap.set(code, {
                  slNo: projectMap.size + 1,
                  projectCode: code,
                  name: name,
                  agency: agency,
                  ministry: ministry,
                  state: state,
                  sector: sector,
                  dateOfApproval: approvalDate,
                  originalCompletionDate: origComp,
                  revisedCompletionDate: revComp,
                  costOriginal: originalCost,
                  costAnticipated: anticipatedCost,
                  costRevised: anticipatedCost,
                  cumulativeExpenditure: expenditure,
                  physicalProgress: physicalProgress,
                  tableSource: 'Table-7 Ongoing'
                });
              } else {
                invalidCount++;
              }
            });
            resolve();
          },
          error: (err) => {
            console.error('Error parsing CSV:', err);
            resolve();
          }
        });
      });
    }

    const aggregatedProjects = Array.from(projectMap.values());
    setImportStats({
      totalFiles: uploadedFiles.length,
      totalRows: totalRowsCount,
      validProjects: aggregatedProjects.length,
      missingDates: missingDatesCount,
      invalidIds: invalidCount
    });
    setParsedRawData(aggregatedProjects);
    setIsParsing(false);
  };

  const handleProcessData = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedProjects = parsedRawData.map((raw, idx) => transformMospiRecord(raw, idx));
      onImportSuccess(generatedProjects);
      setIsProcessing(false);
      onNavigate('dashboard');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-2">
          <FileSpreadsheet className="h-7 w-7 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-800">Project Data Import</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Upload one or more MoSPI monitoring report CSV files simultaneously. New records are merged and upserted by Project Code without deleting existing database records.
        </p>

        {/* Upload Dropzone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${files.length > 0 ? 'border-purple-300 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'}`}
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
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
              <p className="text-slate-600 font-medium">Parsing {files.length} CSV File{files.length > 1 ? 's' : ''}...</p>
            </div>
          ) : files.length > 0 ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-700">
                {files.length} CSV File{files.length > 1 ? 's' : ''} Selected
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md my-1">
                {files.map((f, i) => (
                  <span key={i} className="text-xs bg-purple-100 text-purple-800 font-mono px-2 py-0.5 rounded border border-purple-200">
                    {f.name} ({(f.size / 1024).toFixed(1)} KB)
                  </span>
                ))}
              </div>
              <p className="text-sm text-purple-600 mt-2 hover:underline">Click or drag to add or replace files</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-14 w-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-2">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">Drag & drop your CSV file(s) here</p>
                <p className="text-sm text-slate-500 mt-1">Supports multi-file select and upload</p>
              </div>
            </div>
          )}
        </div>

        {/* Parse Results */}
        {importStats && !isParsing && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Parsing Results</h3>
            
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 font-medium">
                    {importStats.validProjects} unique projects detected across {importStats.totalFiles} file{importStats.totalFiles > 1 ? 's' : ''} ({importStats.totalRows} raw rows)
                  </span>
                </div>
                <span className="text-sm font-semibold bg-emerald-100 text-emerald-700 py-1 px-2.5 rounded-full">Ready to Merge</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-slate-700 font-medium">Date & Cost fields mapped successfully</span>
                </div>
              </div>

              {importStats.invalidIds > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <span className="text-slate-700 font-medium">{importStats.invalidIds} invalid or empty rows ignored</span>
                  </div>
                </div>
              )}

              {importStats.missingDates > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="text-slate-700 font-medium">{importStats.missingDates} projects missing commissioning dates (fallback estimated)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-700 font-medium">All projects have verified commissioning & sanction dates mapped</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleProcessData}
                disabled={isProcessing || importStats.validProjects === 0}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all hover:shadow"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing & Engineering Features...</span>
                  </>
                ) : (
                  <>
                    <span>Process Data & Update Dashboard</span>
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
        <h3 className="text-xl font-semibold mb-3 relative z-10">What happens during processing?</h3>
        <p className="text-indigo-200 mb-6 max-w-2xl relative z-10 leading-relaxed">
          The NirmaanX engine doesn't just display your data. It automatically engineers complex AI features by analyzing historical patterns.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">1. Date Intelligence</h4>
            <p className="text-sm text-slate-300">Automatically calculates original vs revised durations, schedule extensions, and predicts structural completion lags.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">2. Risk Profiling</h4>
            <p className="text-sm text-slate-300">Generates 4 distinct ML risk scores (Schedule, Cost, Progress, Divergence) and aggregates them into a critical risk level.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-xl">
            <h4 className="font-medium text-indigo-300 mb-2">3. Early Warnings</h4>
            <p className="text-sm text-slate-300">Flags anomalies such as progress-expenditure divergence and triggers automated intervention recommendations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
