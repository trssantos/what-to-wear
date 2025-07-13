// src/components/shared/ImageModal.js - Componente Reutilizável
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt = "Imagem ampliada",
  title,
  subtitle,
  children,
  size = "sm" // "sm", "md", "lg"
}) => {
  
  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll do body quando modal está aberta
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Não renderizar se não estiver aberta
  if (!isOpen || !imageUrl) return null;

  // Tamanhos disponíveis
  const sizeClasses = {
    sm: "max-w-sm",      // 384px - para peças individuais
    md: "max-w-md",      // 448px - para outfits
    lg: "max-w-lg",      // 512px - para imagens maiores
    xl: "max-w-xl"       // 576px - para galerias
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`relative bg-white rounded-2xl p-4 ${sizeClasses[size]} max-h-[80vh] w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão X - igual ao StyleChatScreen */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Imagem principal */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Conteúdo adicional */}
        {(title || subtitle || children) && (
          <div className="mt-3">
            {title && (
              <h3 id="modal-title" className="font-semibold text-gray-800 text-center">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 text-center mt-1">
                {subtitle}
              </p>
            )}
            {children && (
              <div className="mt-3">
                {children}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;

// ✨ HOOK PERSONALIZADO PARA USAR A MODAL
export const useImageModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageData, setImageData] = React.useState({
    url: null,
    alt: '',
    title: '',
    subtitle: ''
  });

  const openModal = (url, { alt = 'Imagem ampliada', title = '', subtitle = '' } = {}) => {
    setImageData({ url, alt, title, subtitle });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Limpar dados após animação
    setTimeout(() => {
      setImageData({ url: null, alt: '', title: '', subtitle: '' });
    }, 150);
  };

  return {
    isOpen,
    imageData,
    openModal,
    closeModal
  };
};

// ✨ COMPONENTE DE IMAGEM CLICÁVEL REUTILIZÁVEL
export const ClickableImage = ({ 
  src, 
  alt, 
  className = "", 
  modalSize = "sm",
  title,
  subtitle,
  children,
  showZoomIndicator = true,
  ...props 
}) => {
  const { isOpen, imageData, openModal, closeModal } = useImageModal();

  const handleClick = () => {
    openModal(src, { alt, title, subtitle });
  };

  return (
    <>
      <div className="relative group">
        <img
          src={src}
          alt={alt}
          className={`cursor-pointer transition-all duration-300 ${className}`}
          onClick={handleClick}
          {...props}
        />
        
        {/* Indicador de zoom opcional */}
        {showZoomIndicator && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageUrl={imageData.url}
        alt={imageData.alt}
        title={imageData.title}
        subtitle={imageData.subtitle}
        size={modalSize}
      >
        {children}
      </ImageModal>
    </>
  );
};

// ✨ EXEMPLOS DE USO:

// 1. USO SIMPLES
// <ClickableImage 
//   src="/path/to/image.jpg" 
//   alt="Descrição" 
//   className="w-full h-64 object-cover rounded-lg"
// />

// 2. USO COM DADOS
// <ClickableImage 
//   src={item.imageUrl}
//   alt={item.name}
//   title={item.name}
//   subtitle={`${item.category} • ${item.color}`}
//   modalSize="md"
//   className="w-full h-80 object-cover rounded-xl"
// />

// 3. USO COM CONTEÚDO CUSTOMIZADO
// <ClickableImage 
//   src={outfit.imageUrl}
//   alt={outfit.name}
//   title={outfit.name}
//   subtitle={outfit.occasion}
//   modalSize="lg"
// >
//   <div className="flex gap-2 mt-3">
//     <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg">
//       Editar
//     </button>
//     <button className="flex-1 bg-green-500 text-white py-2 rounded-lg">
//       Usar Hoje
//     </button>
//   </div>
// </ClickableImage>

// 4. USO MANUAL COM HOOK
// const { isOpen, imageData, openModal, closeModal } = useImageModal();
// 
// <img 
//   onClick={() => openModal(imageUrl, { title: 'Título', subtitle: 'Subtítulo' })}
//   className="cursor-pointer"
// />
// 
// <ImageModal
//   isOpen={isOpen}
//   onClose={closeModal}
//   imageUrl={imageData.url}
//   title={imageData.title}
//   subtitle={imageData.subtitle}
// />