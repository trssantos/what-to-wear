import React, { useRef, useState, useEffect } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const localVideoRef = useRef(null);
  const localCanvasRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      try {
        console.log('🎥 Iniciando câmara...');
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          }
        });
        
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        if (localVideoRef.current) {
          const video = localVideoRef.current;
          
          const handleLoadedMetadata = () => {
            console.log('📹 Video metadata carregada');
            setIsVideoReady(true);
          };
          
          const handleCanPlay = async () => {
            if (!isMounted) return;
            
            try {
              console.log('▶️ Video pronto para reproduzir');
              await video.play();
              console.log('✅ Câmara iniciada com sucesso');
              setIsInitializing(false);
            } catch (playError) {
              console.error('❌ Erro ao reproduzir vídeo:', playError);
              if (isMounted) {
                setError('Erro ao iniciar visualização da câmara');
                setIsInitializing(false);
              }
            }
          };
          
          const handleError = (e) => {
            console.error('❌ Erro no elemento vídeo:', e);
            if (isMounted) {
              setError('Erro no elemento de vídeo');
              setIsInitializing(false);
            }
          };
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('canplay', handleCanPlay);
          video.addEventListener('error', handleError);
          
          video.srcObject = mediaStream;
          
          return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
          };
        }
        
        setLocalStream(mediaStream);
        
      } catch (error) {
        console.error('❌ Erro ao aceder à câmara:', error);
        if (isMounted) {
          let errorMessage = 'Erro desconhecido ao aceder à câmara';
          
          if (error.name === 'NotAllowedError') {
            errorMessage = 'Permissão negada. Permite acesso à câmara nas definições do browser.';
          } else if (error.name === 'NotFoundError') {
            errorMessage = 'Câmara não encontrada. Verifica se tens uma câmara ligada.';
          } else if (error.name === 'NotReadableError') {
            errorMessage = 'Câmara em uso por outra aplicação. Fecha outras apps que usem a câmara.';
          } else if (error.name === 'OverconstrainedError') {
            errorMessage = 'Configuração de câmara não suportada. Tenta com outro dispositivo.';
          }
          
          setError(errorMessage);
          setIsInitializing(false);
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      if (localStream) {
        console.log('🛑 Stopping camera stream...');
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (localVideoRef.current && localCanvasRef.current && isVideoReady) {
      const canvas = localCanvasRef.current;
      const video = localVideoRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('⚠️ Vídeo ainda não tem dimensões válidas');
        return null;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  const handleClose = () => {
    console.log('🔄 Fechando câmara...');
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      console.log('📸 Foto capturada com sucesso');
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      onCapture(photo);
    } else {
      console.warn('⚠️ Falha ao capturar foto - câmara ainda não está pronta');
      alert('Câmara ainda não está pronta. Aguarda um momento e tenta novamente.');
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
          <div className="text-red-500 mb-4">
            <Camera className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro na Câmara</h2>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {error}
          </p>
          <div className="text-left text-xs text-gray-500 mb-6 space-y-1">
            <p><strong>Dicas:</strong></p>
            <p>• Actualiza a página e tenta novamente</p>
            <p>• Verifica se estás em HTTPS ou localhost</p>
            <p>• Fecha outras apps que usem a câmara</p>
            <p>• Reinicia o browser se necessário</p>
          </div>
          <button
            onClick={handleClose}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        {isInitializing && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <Camera className="h-12 w-12 text-white mx-auto" />
              </div>
              <p className="text-white">A inicializar câmara...</p>
              <p className="text-white/60 text-sm mt-2">Por favor aguarda</p>
            </div>
          </div>
        )}
        
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ 
            opacity: isInitializing ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
        <canvas ref={localCanvasRef} className="hidden" />
      </div>
      
      <div className="p-6 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-8">
          <button
            onClick={handleClose}
            className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={handleCapture}
            disabled={isInitializing || !isVideoReady}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
          
          <div className="w-16 h-16"></div>
        </div>
        
        <div className="text-center mt-4">
          {isInitializing ? (
            <p className="text-white/80 text-sm">Preparando câmara...</p>
          ) : isVideoReady ? (
            <p className="text-white/80 text-sm">Toca no botão branco para fotografar</p>
          ) : (
            <p className="text-white/60 text-sm">A carregar...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;