import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";

interface PublicSignaturePadProps {
  onSignature: (dataUrl: string | null, type: "DRAWN" | "UPLOADED") => void;
}

const CANVAS_HEIGHT = 140;

const PublicSignaturePad: React.FC<PublicSignaturePadProps> = ({ onSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasDrawnRef = useRef(false);
  const isDrawingRef = useRef(false);
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tab, setTab] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const resizeCanvas = useCallback(() => {
    if (isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = Math.max(container.clientWidth, 280);
    if (canvas.width === width && canvas.height === CANVAS_HEIGHT) return;

    const ctx = canvas.getContext("2d");
    const snapshot = hasDrawnRef.current ? canvas.toDataURL("image/png") : null;

    canvas.width = width;
    canvas.height = CANVAS_HEIGHT;

    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, CANVAS_HEIGHT);

    if (snapshot) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, CANVAS_HEIGHT);
      };
      img.src = snapshot;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(resizeCanvas);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    };
  }, [resizeCanvas, tab]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    setIsDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawnRef.current = true;
    setHasDrawn(true);
  };

  const scheduleApply = () => {
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      applyDrawn();
    }, 80);
  };

  const endDraw = () => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    if (hasDrawnRef.current) {
      scheduleApply();
    }
  };

  const clearCanvas = () => {
    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    setHasDrawn(false);
    onSignature(null, "DRAWN");
  };

  const applyDrawn = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnRef.current) return;
    onSignature(canvas.toDataURL("image/png"), "DRAWN");
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadPreview(result);
      onSignature(result, "UPLOADED");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Stack spacing={1.5}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          "& .MuiTab-root": { minHeight: 40, py: 0.5, fontSize: "0.8125rem" },
        }}
      >
        <Tab icon={<DrawOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Draw" />
        <Tab icon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Upload" />
      </Tabs>

      {tab === 0 ? (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Sign with your finger or mouse. Your signature updates the agreement preview automatically.
          </Typography>
          <Box
            ref={containerRef}
            sx={{
              width: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#fff",
              touchAction: "none",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              style={{ display: "block", width: "100%", height: CANVAS_HEIGHT, cursor: "crosshair" }}
            />
          </Box>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={clearCanvas} sx={{ flex: 1 }}>
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={applyDrawn}
              disabled={!hasDrawn}
              sx={{ flex: 1 }}
            >
              Update preview
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Typography variant="caption" color="text.secondary">
            Upload a PNG or JPG image of your signature.
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <Button
            variant="outlined"
            fullWidth
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose image
          </Button>
          {uploadPreview && (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
                textAlign: "center",
                backgroundColor: "background.default",
              }}
            >
              <Box
                component="img"
                src={uploadPreview}
                alt="Uploaded signature"
                sx={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain" }}
              />
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default PublicSignaturePad;
