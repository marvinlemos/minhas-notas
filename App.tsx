import React, { useState, useRef, useEffect, useCallback } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Upload, AlertCircle, Menu } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ControlBar from './components/ControlBar';
import EditToolbar from './components/EditToolbar';
import DrawingCanvas from './components/DrawingCanvas';
import { ScrollSettings, PDFFile, AppMode, DrawingPath, PenSettings, EraserSettings, DrawingTool } from './types';
import { saveNote, loadNote } from './services/storageService';
import { exportPDF } from './services/pdfExportService';

// Configure PDF.js worker - MATCHING VERSION 4.8.69
pdfjs.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

const pdfOptions = {
  cMapUrl: 'https://aistudiocdn.com/pdfjs-dist@4.8.69/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://aistudiocdn.com/pdfjs-dist@4.8.69/standard_fonts/',
};

function App() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.2);
  const [showSidebar, setShowSidebar] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Mode & Drawing State
  const [appMode, setAppMode] = useState<AppMode>(AppMode.VIEW);
  const [annotations, setAnnotations] = useState<Record<number, DrawingPath[]>>({});
  const [activeTool, setActiveTool] = useState<DrawingTool>(DrawingTool.PEN);
  const [penSettings, setPenSettings] = useState<PenSettings>({ color: '#ef4444', width: 4 });
  const [eraserSettings, setEraserSettings] = useState<EraserSettings>({ width: 10 });

  // Scroll Logic State
  const [scrollSettings, setScrollSettings] = useState<ScrollSettings>({
    isPlaying: false,
    speed: 1.0,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);

  // Handle file selection
  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      setScrollSettings(prev => ({ ...prev, isPlaying: false }));
      setErrorMsg(null);
      setNumPages(null);

      try {
        if (selectedFile.name.endsWith('.note')) {
            // Load custom Note file
            const { pdfBlob, name, annotations: loadedAnnotations } = await loadNote(selectedFile);
            const fileUrl = URL.createObjectURL(pdfBlob);
            setFile({ url: fileUrl, name: name, data: pdfBlob });
            setAnnotations(loadedAnnotations);
        } else {
            // Load standard PDF
            const fileUrl = URL.createObjectURL(selectedFile);
            setFile({ url: fileUrl, name: selectedFile.name, data: selectedFile });
            setAnnotations({});
        }
      } catch (err) {
        console.error("Erro ao abrir arquivo", err);
        setErrorMsg(err instanceof Error ? err.message : "Erro ao abrir arquivo");
      }
    }
  };

  const handleSave = () => {
    if (file) {
        saveNote(file, annotations);
    }
  };

  const handleExport = async () => {
    if (file && !isExporting) {
        setIsExporting(true);
        // Wait a small tick to allow UI to update to loading state
        setTimeout(async () => {
            await exportPDF(file, annotations);
            setIsExporting(false);
        }, 100);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setErrorMsg(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setErrorMsg(error.message || "Erro desconhecido ao carregar PDF");
  };

  // Animation Loop
  const animateScroll = useCallback(() => {
    // Force stop if in edit mode (safety check)
    if (appMode === AppMode.EDIT) {
      setScrollSettings(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    if (scrollContainerRef.current && scrollSettings.isPlaying) {
      accumulatorRef.current += scrollSettings.speed * 0.5;

      if (accumulatorRef.current >= 1) {
        const pixelsToScroll = Math.floor(accumulatorRef.current);
        scrollContainerRef.current.scrollBy({ top: pixelsToScroll, behavior: 'auto' });
        accumulatorRef.current -= pixelsToScroll;
      }
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        setScrollSettings(prev => ({ ...prev, isPlaying: false }));
        return;
      }

      requestRef.current = requestAnimationFrame(animateScroll);
    }
  }, [scrollSettings.isPlaying, scrollSettings.speed, appMode]);

  useEffect(() => {
    if (scrollSettings.isPlaying) {
      requestRef.current = requestAnimationFrame(animateScroll);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [scrollSettings.isPlaying, animateScroll]);

  // Mode Switching Logic
  const handleModeChange = (newMode: AppMode) => {
    // Prevent switching to Edit mode if scrolling is active
    if (newMode === AppMode.EDIT && scrollSettings.isPlaying) {
      return;
    }
    setAppMode(newMode);
  };

  // Toggle Scroll (only allowed in VIEW mode)
  const togglePlay = () => {
    if (appMode === AppMode.EDIT) return;
    setScrollSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSpeedChange = (newSpeed: number) => {
    setScrollSettings(prev => ({ ...prev, speed: newSpeed }));
  };

  const addAnnotation = (pageIndex: number, path: DrawingPath) => {
    setAnnotations(prev => ({
      ...prev,
      [pageIndex]: [...(prev[pageIndex] || []), path]
    }));
  };

  // Calculate width based on screen size
  const getPageWidth = () => Math.min(window.innerWidth * 0.95, 800);

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      
      <Sidebar 
        activeFile={file?.name || null} 
        onFileSelect={onFileChange}
      />

      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Top Bar: Mobile Header OR Edit Toolbar */}
        {file ? (
          <EditToolbar 
            mode={appMode} 
            onModeChange={handleModeChange}
            penSettings={penSettings}
            onPenSettingsChange={setPenSettings}
            isScrolling={scrollSettings.isPlaying}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            eraserSettings={eraserSettings}
            onEraserSettingsChange={setEraserSettings}
            onSave={handleSave}
            onExport={handleExport}
            isExporting={isExporting}
          />
        ) : (
          <div className="md:hidden h-14 bg-white border-b flex items-center px-4 justify-between z-10 shrink-0">
            <div className="flex items-center gap-2">
              <Menu className="w-6 h-6 text-slate-600" onClick={() => setShowSidebar(!showSidebar)} />
              <h1 className="font-bold text-slate-800">NoteFlow</h1>
            </div>
          </div>
        )}

        {!file && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 rotate-3">
                    <Upload className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Selecione um PDF</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    Abra um documento para começar a leitura em modo teleprompter.
                </p>
                <label className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg shadow-blue-500/30 cursor-pointer hover:bg-blue-700 transition-transform active:scale-95">
                    <input type="file" accept="application/pdf,.note" onChange={onFileChange} className="hidden" />
                    Escolher Arquivo
                </label>
            </div>
        )}

        {/* PDF Viewport */}
        {file && (
          <div 
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden bg-slate-100/50 relative ${appMode === AppMode.VIEW ? 'scroll-smooth' : ''}`}
            style={{ 
              scrollBehavior: scrollSettings.isPlaying ? 'auto' : 'smooth',
              touchAction: appMode === AppMode.EDIT ? 'pan-x pan-y' : 'auto' // Improve touch behavior
            }}
          >
            <div className="max-w-4xl mx-auto py-8 px-2 md:px-8 min-h-screen">
                <Document
                    file={file.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={pdfOptions}
                    loading={
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center h-64 text-red-500 p-4 text-center">
                            <AlertCircle className="w-10 h-10 mb-2" />
                            <p className="font-semibold">Erro ao carregar PDF</p>
                            {errorMsg && <p className="text-sm mt-2 opacity-80">{errorMsg}</p>}
                        </div>
                    }
                    className="flex flex-col items-center gap-6"
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => {
                        const width = getPageWidth();
                        const pageKey = index + 1;

                        return (
                          <div key={`page_${pageKey}`} className="shadow-lg transition-shadow hover:shadow-xl relative bg-white">
                              <Page 
                                  pageNumber={pageKey} 
                                  scale={scale}
                                  className="bg-white"
                                  renderTextLayer={false} // CRITICAL FIX: Disabled text layer to prevent rendering glitches
                                  renderAnnotationLayer={false}
                                  width={width}
                                  devicePixelRatio={Math.min(window.devicePixelRatio, 2)}
                                  onLoadSuccess={() => { /* Could capture dimensions here if needed */ }}
                              />
                              {/* Overlay Canvas */}
                              <div className="absolute inset-0 top-0 left-0 w-full h-full">
                                <DrawingCanvas 
                                  width={width}
                                  height={width * 1.4142} // Fallback aspect ratio.
                                  isActive={appMode === AppMode.EDIT}
                                  activeTool={activeTool}
                                  paths={annotations[index] || []}
                                  onAddPath={(path) => addAnnotation(index, path)}
                                  currentColor={penSettings.color}
                                  currentWidth={activeTool === DrawingTool.ERASER ? eraserSettings.width : penSettings.width}
                                />
                              </div>
                          </div>
                        );
                    })}
                </Document>
                
                <div className="h-[50vh]"></div>
            </div>
          </div>
        )}

        {/* Speed Controls (Only in View Mode) */}
        {file && !errorMsg && appMode === AppMode.VIEW && (
            <ControlBar 
                settings={scrollSettings} 
                onTogglePlay={togglePlay} 
                onSpeedChange={handleSpeedChange}
                show={true}
            />
        )}
      </main>
    </div>
  );
}

export default App;