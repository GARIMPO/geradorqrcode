import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Download, QrCode, Upload } from "lucide-react";

function App() {
  const [text, setText] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrColor, setQrColor] = useState("#0284c7");
  const [logo, setLogo] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (text && qrCode) {
      generateQRCode();
    }
  }, [qrColor]);

  const generateQRCode = async () => {
    if (!text) {
      toast({
        title: "Erro",
        description: "Por favor, insira um texto ou URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, text, {
        width: 800,
        margin: 0,
        color: {
          dark: qrColor,
          light: "#ffffff",
        },
      });

      if (logo) {
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = logo;
        await new Promise((resolve) => {
          img.onload = () => {
            const size = canvas.width * 0.3;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;
            
            // Create circular clipping path
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            // Draw white background circle
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            
            // Calculate dimensions to maintain aspect ratio
            const imgRatio = img.width / img.height;
            let drawWidth = size;
            let drawHeight = size;
            let offsetX = 0;
            let offsetY = 0;

            if (imgRatio > 1) {
              // Image is wider than tall
              drawHeight = size / imgRatio;
              offsetY = (size - drawHeight) / 2;
            } else {
              // Image is taller than wide
              drawWidth = size * imgRatio;
              offsetX = (size - drawWidth) / 2;
            }
            
            // Draw the image maintaining aspect ratio
            ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
            ctx.restore();

            // Draw white border around the circle
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2 + 5, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            
            // Redraw the clipped image on top
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
            ctx.restore();
            
            resolve();
          };
        });
      }

      setQrCode(canvas.toDataURL());
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao gerar o código QR",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `QR code www.garimpodeofertas.com.br.png`;
    link.href = qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "QR code baixado com sucesso!",
    });
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target.result);
        // Remove the automatic QR code generation
        // generateQRCode();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#D2F2FF] p-4 md:p-8">
      <div className="mx-auto max-w-2xl text-center mb-6">
        <p className="text-lg md:text-xl text-gray-700 px-4">
          Gere QR Codes de links de Websites, Redes sociais, Pix, etc...
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md overflow-hidden rounded-2xl bg-white p-6 md:p-8 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="mb-8 flex items-center justify-center flex-wrap md:flex-nowrap gap-2 text-center"
        >
          <QrCode className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap">
            QR Code Generator
          </h1>
        </motion.div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text" className="text-base text-gray-600">
              Coloque a sua URL
            </Label>
            <Input
              id="text"
              type="text"
              placeholder="Coloque a sua URL para gerar o QR code"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-12 border-2 text-base transition-colors focus-visible:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-base text-gray-600">
              Cor do QR Code
            </Label>
            <div className="flex gap-4">
              <Input
                id="color"
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
                className="h-12 w-20 cursor-pointer border-2 p-1"
              />
              <Button
                className="flex-1 gap-2 border-2 border-primary/20 bg-primary/5 font-semibold text-primary hover:bg-primary/10 relative"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <span>Adicionar Logo</span>
                </div>
                {logo && (
                  <div className="absolute right-3 flex items-center">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary/30 bg-white shadow-sm relative">
                      <img
                        src={logo}
                        alt="Logo preview"
                        className="absolute inset-0 h-full w-full object-contain p-1"
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'center'
                        }}
                      />
                    </div>
                  </div>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          <Button
            className="h-12 w-full text-base font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            onClick={generateQRCode}
          >
            Gerar QR Code
          </Button>

          {qrCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <motion.div 
                className="flex justify-center"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="h-64 w-64 rounded-2xl bg-white p-4 shadow-xl"
                />
              </motion.div>

              <Button
                className="w-full gap-2 border-2 border-primary/20 bg-primary/5 font-semibold text-primary hover:bg-primary/10"
                variant="outline"
                onClick={downloadQRCode}
              >
                <Download className="h-5 w-5" />
                Baixar
              </Button>
            </motion.div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Criado por{" "}
          <a
            href="https://garimpodeofertas.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Garimpo de Ofertas
          </a>
        </div>
      </motion.div>
      <Toaster />
    </div>
  );
}

export default App;
