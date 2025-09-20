import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Undo as UndoIcon,
  DeleteOutline as ClearIcon,
  CloudUpload as UploadIcon,
  SaveAlt as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Edit as DrawIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../slices/store';
import { State } from '../../../types/types';
import {
  getSignatureByEmployeeID,
  getSignatureImage,
  checkSignatureExists,
  saveSignatureFromCanvas,
  updateSignatureFromCanvas,
  uploadSignature,
  updateSignature,
} from '../../../slices/signatureSlice/signature';
import { AppConfig } from '../../../config/config';

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onSignature: (signatureData: string | null, signatureType: 'draw' | 'upload' | null) => void;
  title?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`signature-tabpanel-${index}`}
      aria-labelledby={`signature-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `signature-tab-${index}`,
    'aria-controls': `signature-tabpanel-${index}`,
  };
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  open,
  onClose,
  onSignature,
  title = "Add Signature"
}) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const signatureState = useAppSelector((state) => state.signature);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveAsDefault, setShowSaveAsDefault] = useState(false);
  const [hasExistingSignature, setHasExistingSignature] = useState(false);
  const [existingSignatureData, setExistingSignatureData] = useState<string | null>(null);
  const [isLoadingExistingSignature, setIsLoadingExistingSignature] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  // Check for existing signature when modal opens
  useEffect(() => {
    if (open && authState.userInfo?.userID) {
      console.log('SignatureModal - Checking for existing signature for user:', authState.userInfo.userID);
      
      // Reset states first
      setHasExistingSignature(false);
      setExistingSignatureData(null);
      setIsLoadingExistingSignature(true);
      
      // First get the signature metadata to get the file path
      dispatch(getSignatureByEmployeeID(authState.userInfo.userID))
        .then((signatureResult) => {
          console.log('SignatureModal - Signature metadata result:', signatureResult);
          if (signatureResult.payload && (signatureResult.payload as any).signature) {
            const signaturePath = (signatureResult.payload as any).signature;
            console.log('SignatureModal - Signature path found:', signaturePath);
            
            // Fetch the signature image as base64 using the file path
            return dispatch(getSignatureImage({ 
              employeeID: authState.userInfo!.userID, 
              signaturePath: signaturePath 
            }));
          } else {
            console.log('SignatureModal - No existing signature found');
            setHasExistingSignature(false);
            setExistingSignatureData(null);
            setIsLoadingExistingSignature(false);
            return null;
          }
        })
        .then((imageResult) => {
          if (imageResult && imageResult.payload && typeof imageResult.payload === 'string') {
            console.log('SignatureModal - Signature image fetched successfully');
            console.log('SignatureModal - Image data length:', imageResult.payload.length);
            console.log('SignatureModal - Image data preview:', imageResult.payload.substring(0, 50) + '...');
            
            setHasExistingSignature(true);
            setExistingSignatureData(imageResult.payload);
            setIsLoadingExistingSignature(false);
          } else if (imageResult === null) {
            // Signature doesn't exist, already handled above
            return;
          } else {
            console.log('SignatureModal - Failed to fetch signature image');
            setHasExistingSignature(false);
            setExistingSignatureData(null);
            setIsLoadingExistingSignature(false);
          }
        })
        .catch((error) => {
          console.error('SignatureModal - Error in signature loading process:', error);
          console.error('SignatureModal - Error details:', error);
          setHasExistingSignature(false);
          setExistingSignatureData(null);
          setIsLoadingExistingSignature(false);
        });
    } else {
      console.log('SignatureModal - Modal not open or no user ID available');
      setHasExistingSignature(false);
      setExistingSignatureData(null);
      setIsLoadingExistingSignature(false);
    }
  }, [open, authState.userInfo?.userID, dispatch]);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Canvas dimensions are set in HTML, just initialize drawing styles
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        console.log('SignatureModal - Canvas initialized with size:', canvas.width, 'x', canvas.height);
      }
    }
  }, [open]);

  // Canvas drawing functionality
  useEffect(() => {
    if (activeTab === 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Reset drawing styles when switching to draw tab
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        console.log('SignatureModal - Canvas styles reset when switching to draw tab, size:', canvas.width, 'x', canvas.height);
      }
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setError(null);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Save current state for undo
    undoStack.current.push(canvas.toDataURL());
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      e.preventDefault();
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      // Mouse event
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      e.preventDefault();
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      // Mouse event
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Save current state for undo
    undoStack.current.push(canvas.toDataURL());
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Save current state to redo stack
    redoStack.current.push(canvas.toDataURL());
    
    // Restore previous state
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = undoStack.current.pop() || '';
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPEG, JPG, GIF, or BMP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setError(null);
    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAsDefault = async () => {
    if (!authState.userInfo?.userID) {
      setError('User not authenticated');
      return;
    }

    if (activeTab === 0) {
      // Drawing tab
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Check if canvas has any drawing
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some((value, index) => {
        // Check if pixel is not white (RGB 255, 255, 255)
        return index % 4 !== 3 && value !== 255;
      });
      
      if (!hasDrawing) {
        setError('Please draw a signature before saving');
        return;
      }
      
      const signatureDataURL = canvas.toDataURL('image/png');
      
      // Save to backend
      try {
        if (hasExistingSignature) {
          await dispatch(updateSignatureFromCanvas({
            employeeID: authState.userInfo.userID,
            signatureData: signatureDataURL
          }));
        } else {
          await dispatch(saveSignatureFromCanvas({
            employeeID: authState.userInfo.userID,
            signatureData: signatureDataURL
          }));
        }
        
        setHasExistingSignature(true);
        setExistingSignatureData(signatureDataURL);
        setShowSaveAsDefault(false);
        setError(null);
      } catch (error) {
        setError('Failed to save signature');
      }
    } else if (activeTab === 1) {
      // Upload tab
      if (!uploadedFile) {
        setError('Please upload a signature image before saving');
        return;
      }
      
      // Save to backend
      try {
        if (hasExistingSignature) {
          await dispatch(updateSignature({
            employeeID: authState.userInfo.userID,
            signatureFile: uploadedFile
          }));
        } else {
          await dispatch(uploadSignature({
            employeeID: authState.userInfo.userID,
            signatureFile: uploadedFile
          }));
        }
        
        setHasExistingSignature(true);
        setExistingSignatureData(uploadPreview);
        setShowSaveAsDefault(false);
        setError(null);
      } catch (error) {
        setError('Failed to save signature');
      }
    }
  };

  const handleUseExisting = () => {
    if (existingSignatureData) {
      console.log('SignatureModal - Using existing signature, data length:', existingSignatureData.length);
      console.log('SignatureModal - Existing signature type: draw');
      onSignature(existingSignatureData, 'draw');
      handleClose();
    }
  };

  const handleConfirm = () => {
    if (activeTab === 0) {
      // Drawing tab
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Check if canvas has any drawing
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some((value, index) => {
        // Check if pixel is not white (RGB 255, 255, 255)
        return index % 4 !== 3 && value !== 255;
      });
      
      if (!hasDrawing) {
        setError('Please draw a signature before confirming');
        return;
      }
      
      const signatureDataURL = canvas.toDataURL('image/png');
      console.log('SignatureModal - Drawn signature data length:', signatureDataURL.length);
      console.log('SignatureModal - Drawn signature type: draw');
      setSignatureData(signatureDataURL);
      onSignature(signatureDataURL, 'draw');
    } else if (activeTab === 1) {
      // Upload tab
      if (!uploadedFile || !uploadPreview) {
        setError('Please upload a signature image before confirming');
        return;
      }
      
      console.log('SignatureModal - Uploaded signature data length:', uploadPreview.length);
      console.log('SignatureModal - Uploaded signature type: upload');
      setSignatureData(uploadPreview);
      onSignature(uploadPreview, 'upload');
    }
    
    handleClose();
  };

  const handleSkip = () => {
    onSignature(null, null);
    handleClose();
  };

  const handleClose = () => {
    // Reset state
    setActiveTab(0);
    setIsDrawing(false);
    setSignatureData(null);
    setUploadedFile(null);
    setUploadPreview(null);
    setIsUploading(false);
    setError(null);
    setShowSaveAsDefault(false);
    setIsLoadingExistingSignature(false);
    undoStack.current = [];
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '700px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        pt: 3,
        px: 3,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            '&:hover': {
              backgroundColor: '#f5f5f5',
              color: '#333'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Existing Signature Section */}
        {isLoadingExistingSignature && (
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #e0e0e0',
            borderRadius: '8px 8px 0 0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
              <CircularProgress size={24} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Loading existing signature...
              </Typography>
            </Box>
          </Box>
        )}
        
        {!isLoadingExistingSignature && hasExistingSignature && existingSignatureData && (
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #e0e0e0',
            borderRadius: '8px 8px 0 0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Saved Signature Available
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ 
                border: '2px solid #e0e0e0', 
                borderRadius: 2, 
                p: 2,
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxWidth: '250px'
              }}>
                <img
                  src={existingSignatureData}
                  alt="Existing signature"
                  style={{
                    maxWidth: '220px',
                    maxHeight: '80px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleUseExisting}
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Use This Signature
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="signature options"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: 48,
              }
            }}
          >
            <Tab 
              icon={<DrawIcon />} 
              label="Draw Signature" 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<ImageIcon />} 
              label="Upload Signature" 
              iconPosition="start"
              {...a11yProps(1)} 
            />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
              Draw Your Signature
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use your mouse or touch to draw your signature in the area below
            </Typography>
            
            <Paper
              elevation={3}
              sx={{
                display: 'inline-block',
                p: 2,
                mb: 3,
                border: '3px dashed #e0e0e0',
                borderRadius: 3,
                backgroundColor: '#fafafa',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                width={800}
                height={400}
                style={{
                  width: '800px',
                  height: '400px',
                  border: '2px solid #e0e0e0',
                  borderRadius: 8,
                  cursor: 'crosshair',
                  display: 'block',
                  backgroundColor: 'white',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </Paper>

              {/* Tools Row */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap'
              }}>
                {/* Undo Button */}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<UndoIcon />}
                  onClick={undo}
                  disabled={undoStack.current.length === 0}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: '#666',
                    color: '#666',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      borderColor: '#333',
                      color: '#333',
                      backgroundColor: '#f8f8f8',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      borderColor: '#ccc',
                      color: '#ccc',
                      backgroundColor: '#f5f5f5',
                      boxShadow: 'none',
                      transform: 'none'
                    }
                  }}
                >
                  Undo
                </Button>

                {/* Clear Button */}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ClearIcon />}
                  onClick={clearCanvas}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      borderColor: '#b71c1c',
                      color: '#b71c1c',
                      backgroundColor: '#ffebee',
                      boxShadow: '0 4px 12px rgba(211,47,47,0.2)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Clear
                </Button>

                {/* Save as Default Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={() => setShowSaveAsDefault(true)}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: '#1976d2',
                    boxShadow: '0 4px 12px rgba(25,118,210,0.3)',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      boxShadow: '0 6px 16px rgba(25,118,210,0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Save as Default
                </Button>
              </Box>

              {/* Save Confirmation Section */}
              {showSaveAsDefault && (
                <Box sx={{ 
                  mt: 3, 
                  pt: 3, 
                  borderTop: '1px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2, 
                      color: '#666',
                      fontStyle: 'italic'
                    }}
                  >
                    This will save your current signature as the default for future use.
                  </Typography>
                  
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveAsDefault}
                      disabled={signatureState.submitState === State.loading || signatureState.updateState === State.loading}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: hasExistingSignature ? '#f57c00' : '#2e7d32',
                        boxShadow: hasExistingSignature ? '0 4px 12px rgba(245,124,0,0.3)' : '0 4px 12px rgba(46,125,50,0.3)',
                        '&:hover': {
                          backgroundColor: hasExistingSignature ? '#ef6c00' : '#1b5e20',
                          boxShadow: hasExistingSignature ? '0 6px 16px rgba(245,124,0,0.4)' : '0 6px 16px rgba(46,125,50,0.4)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {(signatureState.submitState === State.loading || signatureState.updateState === State.loading) && (
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      )}
                      {hasExistingSignature ? 'Update Default' : 'Save as Default'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowSaveAsDefault(false)}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: '#666',
                        color: '#666',
                        backgroundColor: 'white',
                        '&:hover': {
                          borderColor: '#333',
                          color: '#333',
                          backgroundColor: '#f8f8f8'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
              Upload Signature Image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Select an image file containing your signature
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Choose Signature Image
              </Button>
              
              {uploadedFile && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
                    Selected: {uploadedFile.name}
                  </Typography>
                  {uploadPreview && (
                    <Box sx={{ 
                      display: 'inline-block', 
                      p: 2, 
                      border: '2px solid #e0e0e0', 
                      borderRadius: 2,
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <img
                        src={uploadPreview}
                        alt="Signature preview"
                        style={{
                          maxWidth: '350px',
                          maxHeight: '180px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            
            <Alert severity="info" sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="body2">
                <strong>Supported formats:</strong> PNG, JPEG, JPG, GIF, BMP<br />
                <strong>Maximum file size:</strong> 5MB<br />
                <strong>Recommended:</strong> White background with black signature
              </Typography>
            </Alert>

            {/* Save as Default Section for Upload */}
            {uploadedFile && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                {!showSaveAsDefault ? (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => setShowSaveAsDefault(true)}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Save as Default Signature
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveAsDefault}
                      disabled={signatureState.submitState === State.loading || signatureState.updateState === State.loading}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {(signatureState.submitState === State.loading || signatureState.updateState === State.loading) && (
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                      )}
                      {hasExistingSignature ? 'Update Default' : 'Save as Default'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowSaveAsDefault(false)}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none'
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
        <Button 
          onClick={handleSkip} 
          color="inherit"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1
          }}
        >
          Skip Signature
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isUploading}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          {isUploading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          Confirm Signature
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureModal;
