import React, { useState, useCallback } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  PictureAsPdf as SavePdfIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb } from 'pdf-lib';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import GavelIcon from '@mui/icons-material/Gavel';
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import './print.css';

// Create modern Black/White theme with light green accents
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Pleasant blue
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#90caf9', // Light blue accent
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#fff',
    },
    background: {
      default: '#2046cb', // Set page background to match top bar
      paper: '#ffffff',
    },
    text: {
      primary: '#0d223a', // Deep blue text
      secondary: '#1976d2',
    },
  },
  shape: {
    borderRadius: 6, // Slightly more rounded
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#2046cb', // Custom blue for AppBar
          color: '#fff',
          boxShadow: '0 2px 10px rgba(32, 70, 203, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

// Define types
export type PaperSize = 'A4' | 'Letter';

export interface PDFFile {
  file: File;
  url: string;
}

// Simple PDF Viewer using iframe
const SimplePDFViewer: React.FC<{ file: File; width?: number | string; height?: number | string }> = ({ 
  file 
}) => {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!pdfUrl) return <div>Loading...</div>;

  return (
    <iframe
      src={pdfUrl}
      width="100%"
      height="100%"
      style={{ border: 'none', borderRadius: '4px' }}
      title="PDF Preview"
    />
  );
};

// PDF Quadrant Component
const PDFQuadrant: React.FC<{
  quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  pdfFile: PDFFile | null;
  onPDFUpload: (quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', file: File) => void;
  onPDFRemove: (quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => void;
  height: string;
  title: string;
}> = ({ quadrant, pdfFile, onPDFUpload, onPDFRemove, height, title }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onPDFUpload(quadrant, file);
    }
  }, [onPDFUpload, quadrant]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onPDFUpload(quadrant, file);
    }
    event.target.value = '';
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        height, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
        background: '#FFFFFF',
        border: '1px solid #E0E0E0',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        },
        '@media print': {
          boxShadow: 'none',
          border: 'none',
          borderRadius: 0,
          transform: 'none',
        }
      }}
    >
      {/* Content Area */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {!pdfFile ? (
          // Upload Area
          <Box sx={{ height: '100%', position: 'relative' }}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id={`file-input-${quadrant}`}
            />
            <Box
              {...getRootProps()}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDragActive ? '2px dashed #000000' : '2px dashed #CCCCCC',
                borderRadius: 1,
                backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.05)' : 'rgba(248, 249, 250, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#000000',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
                '@media print': {
                  display: 'none'
                }
              }}
            >
              <input {...getInputProps()} />
              <PdfIcon sx={{ 
                fontSize: 48, 
                color: isDragActive ? '#000000' : '#CCCCCC', 
                mb: 2,
                transition: 'all 0.2s ease' 
              }} />
              <Typography variant="body1" align="center" sx={{ 
                mb: 2,
                color: isDragActive ? '#000000' : 'text.secondary',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}>
                {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF here'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                size="medium"                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  background: '#2046cb', // Changed to match background blue
                  color: '#FFFFFF',
                  '&:hover': {
                    background: '#1a3ba3', // Slightly darker blue for hover
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(`file-input-${quadrant}`)?.click();
                }}
              >
                Choose File
              </Button>
            </Box>
          </Box>
        ) : (
          // PDF Preview
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <SimplePDFViewer 
              file={pdfFile.file}
              width={Math.min(window.innerWidth * 0.35, 350)}
              height={300}
            />
          </Box>
        )}
      </Box>

      {/* Title at Bottom */}
      <Box sx={{ 
        p: 1.5, 
        background: '#F5F5F5',
        borderTop: '1px solid #E0E0E0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '@media print': {
          display: 'none'
        }
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000000' }}>
            {title}
          </Typography>
          {pdfFile && (
            <Typography variant="caption" sx={{ 
              color: '#666666',
              display: 'block',
              fontSize: '0.7rem'
            }}>
              {pdfFile.file.name}
            </Typography>
          )}
        </Box>
        {pdfFile && (
          <Button 
            size="small" 
            onClick={() => onPDFRemove(quadrant)}
            sx={{ 
              color: '#666666',
              minWidth: 'auto',
              p: 0.5,
              '&:hover': {
                color: '#000000',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        )}
      </Box>
    </Paper>
  );
};

// Print-only PDF grid (no UI, no empty quadrants, no titles)
const PrintOnlyPDFGrid: React.FC<{ 
  quadrantPDFs: { 
    topLeft: PDFFile | null; 
    topRight: PDFFile | null; 
    bottomLeft: PDFFile | null; 
    bottomRight: PDFFile | null; 
  }; 
  paperSize: PaperSize 
}> = ({ quadrantPDFs, paperSize }) => {
  // Only render if at least one PDF is present
  const hasPDF = Object.values(quadrantPDFs).some(Boolean);
  if (!hasPDF) return null;
  // Paper size in px for print
  const width = paperSize === 'A4' ? 794 : 816; // 210mm/8.5in at 96dpi
  const height = paperSize === 'A4' ? 1123 : 1056; // 297mm/11in at 96dpi
  const quadrantStyle = {
    width: '50%',
    height: '50%',
    boxSizing: 'border-box',
    border: 'none',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    background: 'white',
  } as React.CSSProperties;
  return (
    <div
      id="print-pdf-grid"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: width,
        height: height,
        margin: 0,
        padding: 0,
        background: 'white',
        position: 'relative',
        pageBreakAfter: 'always',
      }}
    >
      {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((quadrant) =>
        quadrantPDFs[quadrant] ? (
          <div key={quadrant} style={quadrantStyle}>
            <iframe
              src={quadrantPDFs[quadrant]!.url}
              width="100%"
              height="100%"
              style={{ border: 'none', width: '100%', height: '100%' }}
              title={`PDF ${quadrant}`}
            />
          </div>
        ) : null
      )}
    </div>
  );
};

const SimpleApp: React.FC = () => {
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [quadrantPDFs, setQuadrantPDFs] = useState<{
    topLeft: PDFFile | null;
    topRight: PDFFile | null;
    bottomLeft: PDFFile | null;
    bottomRight: PDFFile | null;
  }>({
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,  });
  const [isPrinting] = useState(false);  const [helpOpen, setHelpOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handlePDFUpload = useCallback((quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', file: File) => {
    const url = URL.createObjectURL(file);
    setQuadrantPDFs(prev => ({
      ...prev,
      [quadrant]: { file, url }
    }));
  }, []);

  const handlePDFRemove = useCallback((quadrant: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    setQuadrantPDFs(prev => {
      if (prev[quadrant]) {
        URL.revokeObjectURL(prev[quadrant]!.url);
      }
      return {
        ...prev,
        [quadrant]: null
      };
    });
  }, []);

  const handlePrint = async () => {
    // Always use 4 quadrants: topLeft, topRight, bottomLeft, bottomRight
    const quadrantOrder = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
    const pdfDoc = await PDFDocument.create();
    const pageWidth = paperSize === 'A4' ? 595 : 612;
    const pageHeight = paperSize === 'A4' ? 842 : 792;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const quadrants = [
      { x: 0, y: pageHeight / 2, w: pageWidth / 2, h: pageHeight / 2 },
      { x: pageWidth / 2, y: pageHeight / 2, w: pageWidth / 2, h: pageHeight / 2 },
      { x: 0, y: 0, w: pageWidth / 2, h: pageHeight / 2 },
      { x: pageWidth / 2, y: 0, w: pageWidth / 2, h: pageHeight / 2 },
    ];
    for (let i = 0; i < 4; i++) {
      const key = quadrantOrder[i];
      const pdfFile = quadrantPDFs[key];
      const q = quadrants[i];
      // Draw white background for each quadrant
      page.drawRectangle({ x: q.x, y: q.y, width: q.w, height: q.h, color: rgb(1, 1, 1) });
      if (pdfFile) {
        const bytes = await pdfFile.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(bytes);
        const [srcPage] = await srcDoc.getPages();
        const embeddedPage = await pdfDoc.embedPage(srcPage);
        const srcWidth = embeddedPage.width;
        const srcHeight = embeddedPage.height;
        // Fit to quadrant (contain, no crop, no stretch)
        const scale = Math.min(q.w / srcWidth, q.h / srcHeight); // contain, never crop
        const drawWidth = srcWidth * scale;
        const drawHeight = srcHeight * scale;
        const offsetX = q.x + (q.w - drawWidth) / 2;
        const offsetY = q.y + (q.h - drawHeight) / 2;
        page.drawPage(embeddedPage, { x: offsetX, y: offsetY, xScale: scale, yScale: scale });
      }
      // If no PDF, do nothing: quadrant remains white
    }
    const mergedBytes = await pdfDoc.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    // Open in new window and trigger print
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      window.location.href = url;
    }
  };

  const handleSaveAsPDF = async () => {
    // Always use 4 quadrants: topLeft, topRight, bottomLeft, bottomRight
    const quadrantOrder = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
    const pdfDoc = await PDFDocument.create();
    const pageWidth = paperSize === 'A4' ? 595 : 612;
    const pageHeight = paperSize === 'A4' ? 842 : 792;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    // Quadrant layout: [0]=topLeft, [1]=topRight, [2]=bottomLeft, [3]=bottomRight
    const quadrants = [
      { x: 0, y: pageHeight / 2, w: pageWidth / 2, h: pageHeight / 2 },
      { x: pageWidth / 2, y: pageHeight / 2, w: pageWidth / 2, h: pageHeight / 2 },
      { x: 0, y: 0, w: pageWidth / 2, h: pageHeight / 2 },
      { x: pageWidth / 2, y: 0, w: pageWidth / 2, h: pageHeight / 2 },
    ];
    for (let i = 0; i < 4; i++) {
      const key = quadrantOrder[i];
      const pdfFile = quadrantPDFs[key];
      const q = quadrants[i];
      // Draw white background for each quadrant
      page.drawRectangle({ x: q.x, y: q.y, width: q.w, height: q.h, color: rgb(1, 1, 1) });
      if (pdfFile) {
        const bytes = await pdfFile.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(bytes);
        const [srcPage] = await srcDoc.getPages();
        const embeddedPage = await pdfDoc.embedPage(srcPage);
        const srcWidth = embeddedPage.width;
        const srcHeight = embeddedPage.height;
        // Fit to quadrant (contain, no crop, no stretch)
        const scale = Math.min(q.w / srcWidth, q.h / srcHeight); // contain, never crop
        const drawWidth = srcWidth * scale;
        const drawHeight = srcHeight * scale;
        const offsetX = q.x + (q.w - drawWidth) / 2;
        const offsetY = q.y + (q.h - drawHeight) / 2;
        page.drawPage(embeddedPage, { x: offsetX, y: offsetY, xScale: scale, yScale: scale });
      }
      // If no PDF, do nothing: quadrant remains white
    }
    const mergedBytes = await pdfDoc.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `papersave-${paperSize.toLowerCase()}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };
  const pdfCount = Object.values(quadrantPDFs).filter(pdf => pdf !== null).length;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Global styles to ensure scrolling works */}
      <style>
        {`
          html, body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            height: auto !important;
          }
          #root {
            min-height: 100vh;
            height: auto;
          }
        `}
      </style>
      <Box sx={{ 
        display: 'flex', 
        minHeight: 'calc(var(--vh, 1vh) * 100)', 
        width: '100vw', 
        bgcolor: 'background.default', 
        flexDirection: 'column',
        overflow: 'unset' // Ensure this container doesn't block scrolling
      }}>
        {/* AppBar at the top */}
        <AppBar position="static" elevation={0} sx={{ zIndex: 1201 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>
              📄 PaperSave
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 140, mr: 2, '& .MuiOutlinedInput-root': { color: 'white', borderRadius: 1, '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' }, '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.8)' }, '&.Mui-focused fieldset': { borderColor: 'white', borderWidth: 2 } }, '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, '&.Mui-focused': { color: 'white' } }, '& .MuiSelect-icon': { color: 'white' } }}>
                <InputLabel>Paper Size</InputLabel>
                <Select
                  value={paperSize}
                  label="Paper Size"
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                >
                  <MenuItem value="A4">A4 (210 × 297 mm)</MenuItem>
                  <MenuItem value="Letter">Letter (8.5 × 11 in)</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                disabled={pdfCount === 0}
                sx={{ borderRadius: 1, px: 3, py: 1.5, fontWeight: 600, textTransform: 'none', background: pdfCount === 0 ? '#CCCCCC' : 'secondary.main', color: pdfCount === 0 ? '#666666' : 'primary.main', '&:hover': { background: pdfCount === 0 ? '#CCCCCC' : '#63a4ff' }, mr: 1 }}
              >
                Print {pdfCount > 0 && `(${pdfCount})`}
              </Button>              <Button
                variant="outlined"
                startIcon={<SavePdfIcon />}
                onClick={handleSaveAsPDF}
                disabled={pdfCount === 0}
                sx={{ borderRadius: 1, px: 3, py: 1.5, fontWeight: 600, textTransform: 'none', borderColor: pdfCount === 0 ? '#CCCCCC' : '#FFFFFF', color: '#FFFFFF', '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Save as PDF
              </Button>
              <IconButton color="inherit" aria-label="about" onClick={() => setAboutOpen(true)}>
                <InfoIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="privacy policy" onClick={() => setPrivacyOpen(true)}>
                <PrivacyTipIcon />
              </IconButton>              <IconButton color="inherit" aria-label="terms of use" onClick={() => setTermsOpen(true)}>
                <GavelIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="view on github" 
                component="a"
                href="https://github.com/jomon003/PaperSaver"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="help" onClick={() => setHelpOpen(true)}>
                <HelpOutlineIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* About Modal */}
        <Dialog open={aboutOpen} onClose={() => setAboutOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>🌱 About PaperSaver</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#1976d2' }}>
              Saving Trees, One Print at a Time
            </Typography>
            
            <Typography variant="body1" paragraph>
              PaperSaver was created to address a real problem faced by small businesses, online sellers, and shipping companies worldwide. 
              We believe that technology should help us reduce waste, save money, and protect our environment.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              The Problem We Solve
            </Typography>
            <Typography variant="body1" paragraph>
              Many businesses use <strong>pre-cut sticker papers</strong> (A4 or Letter size) divided into 4 quadrants for printing shipping labels and tracking information. 
              However, most printing software only supports sequential printing (1→2→3→4), creating significant limitations:
            </Typography>
            <ul>
              <li><strong>Cannot print to specific quadrants</strong> - If you only have 1 label to print, 3 quadrants are wasted</li>
              <li><strong>Limited reuse options</strong> - Even when inverting the paper, you're restricted to certain sequences</li>
              <li><strong>High paper waste</strong> - Often 50-75% of each sheet goes unused</li>
              <li><strong>Increased costs</strong> - Expensive pre-cut sticker papers are wasted</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Our Solution
            </Typography>
            <Typography variant="body1" paragraph>
              PaperSaver gives you complete control over quadrant placement:
            </Typography>
            <ul>
              <li>🎯 <strong>Choose any quadrant</strong> for each PDF document</li>
              <li>♻️ <strong>Maximize paper utilization</strong> by filling all available spaces</li>
              <li>💰 <strong>Reduce costs</strong> by minimizing waste</li>
              <li>🌳 <strong>Save trees</strong> by using up to 75% less paper</li>
              <li>⚡ <strong>Work offline</strong> - All processing happens in your browser</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Environmental Impact
            </Typography>
            <Typography variant="body1" paragraph>
              Every sheet of paper saved contributes to forest conservation. By optimizing your printing workflow, 
              you're not just saving money - you're helping to:
            </Typography>
            <ul>
              <li>🌲 <strong>Reduce deforestation</strong> - Less paper consumption means fewer trees cut down</li>
              <li>🌍 <strong>Lower carbon footprint</strong> - Reduced paper production and transportation</li>
              <li>💧 <strong>Conserve water</strong> - Paper production is water-intensive</li>
              <li>♻️ <strong>Minimize waste</strong> - Less paper in landfills</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Open Source Mission
            </Typography>
            <Typography variant="body1" paragraph>
              PaperSaver is completely <strong>open source</strong> because we believe environmental solutions should be 
              accessible to everyone. Our code is available on GitHub for transparency, contributions, and community improvement.
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', textAlign: 'center', mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              "Small changes in how we use resources can have a big impact on our planet. 
              Every business that reduces paper waste contributes to a more sustainable future."
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Get Involved
            </Typography>
            <Typography variant="body1">
              Help us improve PaperSaver and spread awareness about sustainable printing practices:
            </Typography>
            <ul>
              <li>⭐ <strong>Star us on GitHub</strong> to show your support</li>
              <li>🐛 <strong>Report issues</strong> to help us improve</li>
              <li>💡 <strong>Suggest features</strong> for better functionality</li>
              <li>📢 <strong>Share with others</strong> who could benefit from paper savings</li>
              <li>🤝 <strong>Contribute code</strong> to make the tool even better</li>
            </ul>
          </DialogContent>
        </Dialog>

        <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>How to Use PaperSave</DialogTitle>
          <DialogContent>
            <ul>
              <li>Drag and drop up to 4 PDF files into the quadrants, or use the "Choose File" buttons.</li>
              <li>Select your desired paper size (A4 or Letter) from the top bar.</li>
              <li>Use the "Print" button to print the arranged PDFs, or "Save as PDF" to download a merged PDF.</li>
              <li>The right panel shows a live preview of how your PDFs will be arranged.</li>
            </ul>
          </DialogContent>
        </Dialog>

        {/* Privacy Policy Modal */}
        <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Analytics Data:</strong> We use Cloudflare Analytics to understand basic traffic patterns. This includes:
            </Typography>
            <ul>
              <li>Page views and session duration</li>
              <li>General geographic location (country/region level)</li>
              <li>Browser and device type (aggregated data only)</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              What We DON'T Collect
            </Typography>
            <ul>
              <li><strong>Personal Information:</strong> We collect no personal information such as names, email addresses, or phone numbers</li>
              <li><strong>Account Data:</strong> No sign-up is required to use PaperSave</li>
              <li><strong>File Content:</strong> Your PDF files are never uploaded to our servers or accessed by us</li>
              <li><strong>File Metadata:</strong> We don't collect information about your file names, sizes, or content</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              File Processing
            </Typography>
            <Typography variant="body1" paragraph>
              All PDF processing happens <strong>entirely in your browser</strong>. Your files:
            </Typography>
            <ul>
              <li>Never leave your device</li>
              <li>Are not uploaded to any servers</li>
              <li>Are processed locally using client-side JavaScript</li>
              <li>Are automatically cleared from browser memory when you close the application</li>
            </ul>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Third-Party Services
            </Typography>
            <Typography variant="body1" paragraph>
              We use Cloudflare Analytics for basic traffic statistics. Cloudflare Analytics is privacy-focused and does not use cookies or track individual users. 
              For more information about Cloudflare's privacy practices, visit: 
              <a href="https://www.cloudflare.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                Cloudflare Privacy Policy
              </a>
            </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              Since we don't collect personal information and use privacy-focused analytics, there's no personal data to delete or modify. 
              Cloudflare Analytics does not track individual users or use cookies.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Changes to This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated date.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body1">
              If you have any questions about this privacy policy, please contact us through our GitHub repository.
            </Typography>
          </DialogContent>
        </Dialog>

        {/* Terms of Use Modal */}
        <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Terms of Use</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Acceptance of Terms
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing and using PaperSave, you agree to be bound by these Terms of Use. 
              If you do not agree to these terms, please do not use our service.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Description of Service
            </Typography>
            <Typography variant="body1" paragraph>
              PaperSave is a web-based tool that allows users to arrange and print multiple PDF documents on a single page. 
              All processing is performed locally in your browser, and no files are uploaded to our servers.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              User Responsibilities
            </Typography>
            <Typography variant="body1" paragraph>
              You agree to:
            </Typography>
            <ul>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to interfere with the proper operation of the service</li>
              <li>Not upload or process any illegal, harmful, or copyrighted content without permission</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Use the service at your own risk and discretion</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Intellectual Property
            </Typography>
            <Typography variant="body1" paragraph>
              The PaperSave application, including its code, design, and documentation, is owned by its creators and is protected by copyright law. 
              The service is provided under the MIT License.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Disclaimer of Warranties
            </Typography>
            <Typography variant="body1" paragraph>
              PaperSave is provided "as is" without any warranties, express or implied. We do not guarantee that:
            </Typography>
            <ul>
              <li>The service will be available at all times</li>
              <li>The service will be error-free or uninterrupted</li>
              <li>The results obtained from using the service will be accurate or reliable</li>
              <li>Any defects in the service will be corrected</li>
            </ul>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              In no event shall the creators of PaperSave be liable for any direct, indirect, incidental, special, 
              consequential, or punitive damages arising out of your use of or inability to use the service.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Privacy and Data Processing
            </Typography>
            <Typography variant="body1" paragraph>
              Your privacy is important to us. All PDF processing occurs locally in your browser. 
              Please refer to our Privacy Policy for detailed information about data collection and usage.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Changes to Terms
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Governing Law
            </Typography>
            <Typography variant="body1" paragraph>
              These terms shall be governed by and construed in accordance with applicable law, 
              without regard to conflict of law principles.
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
            <Typography variant="body1">
              For questions about these Terms of Use, please contact us through our GitHub repository.
            </Typography>
          </DialogContent>
        </Dialog>{/* Main Content Area: Responsive layout */}
        <Box sx={{ 
          display: 'flex', 
          flex: 1, 
          width: '100vw', 
          flexDirection: { xs: 'column', md: 'row' },
          mt: 2, 
          mb: 2,
          gap: { xs: 2, md: 0 },
          minHeight: 0,
          overflow: 'auto'
        }}>
          {/* Left column: topLeft, bottomLeft */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, p: 2, minWidth: 0 }}>
            <PDFQuadrant
              quadrant="topLeft"
              pdfFile={quadrantPDFs.topLeft}
              onPDFUpload={handlePDFUpload}
              onPDFRemove={handlePDFRemove}
              height="calc(50% - 8px)"
              title="Top Left"
            />
            <PDFQuadrant
              quadrant="bottomLeft"
              pdfFile={quadrantPDFs.bottomLeft}
              onPDFUpload={handlePDFUpload}
              onPDFRemove={handlePDFRemove}
              height="calc(50% - 8px)"
              title="Bottom Left"
            />
          </Box>
          {/* Center column: topRight, bottomRight */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, p: 2, minWidth: 0 }}>
            <PDFQuadrant
              quadrant="topRight"
              pdfFile={quadrantPDFs.topRight}
              onPDFUpload={handlePDFUpload}
              onPDFRemove={handlePDFRemove}
              height="calc(50% - 8px)"
              title="Top Right"
            />
            <PDFQuadrant
              quadrant="bottomRight"
              pdfFile={quadrantPDFs.bottomRight}
              onPDFUpload={handlePDFUpload}
              onPDFRemove={handlePDFRemove}
              height="calc(50% - 8px)"
              title="Bottom Right"
            />
          </Box>          {/* Right column: Preview panel */}
          <Paper elevation={3} sx={{ 
            width: { xs: '100%', md: 340 }, 
            minWidth: { xs: 0, md: 280 }, 
            maxWidth: { xs: '100%', md: 400 }, 
            bgcolor: 'background.paper', 
            borderLeft: { md: '2px solid #e3f2fd' }, 
            height: 'auto', 
            maxHeight: { xs: 'calc(var(--vh, 1vh) * 70)', md: 'calc(var(--vh, 1vh) * 85)' },
            minHeight: { xs: 400, md: 500 },
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: 4, 
            boxShadow: 3, 
            mr: { xs: 0, md: 3 },
            mb: { xs: 2, md: 0 },
            overflow: 'auto'
          }}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 700 }}>
                Print Preview
              </Typography>
              <Divider />
            </Box>
            {/* Preview Area - vertically centered */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 0,
              py: 2
            }}>
              <Paper elevation={2} sx={{ 
                width: '100%', 
                maxWidth: 280,
                height: 'auto',
                aspectRatio: paperSize === 'A4' ? '210/297' : '8.5/11',
                maxHeight: 'calc(100% - 40px)',
                bgcolor: 'white', 
                border: '1px solid #E0E0E0', 
                position: 'relative', 
                overflow: 'hidden', 
                borderRadius: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gridTemplateRows: '1fr 1fr', 
                  gap: '1px', 
                  height: '90%', 
                  width: '90%', 
                  bgcolor: '#f5faff', 
                  margin: 'auto' 
                }}>
                  {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((quadrant, index) => (
                    <Box key={index} sx={{ 
                      bgcolor: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: '0.5px solid #E0E0E0', 
                      overflow: 'hidden' 
                    }}>                      {quadrantPDFs[quadrant as keyof typeof quadrantPDFs] ? (
                        <SimplePDFViewer
                          file={quadrantPDFs[quadrant as keyof typeof quadrantPDFs]!.file}
                          width="100%"
                          height="100%"
                        />
                      ) : (
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500, textAlign: 'center', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                          {quadrant.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
            {/* Info text always at the bottom */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="primary.main" display="block">
                This preview shows how your PDFs will be arranged when printed.
              </Typography>
              <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 1 }}>
                Paper: {paperSize} {paperSize === 'A4' ? '(210×297mm)' : '(8.5×11in)'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>      {/* Print-only PDF grid (rendered only during print) */}
      {isPrinting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'white',
          zIndex: 9999,
          display: 'block'
        }}>
          <PrintOnlyPDFGrid quadrantPDFs={quadrantPDFs} paperSize={paperSize} />
        </div>
      )}
    </ThemeProvider>
  );
};

export default SimpleApp;
