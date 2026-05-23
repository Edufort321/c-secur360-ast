'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ArrowLeft,
  Plus,
  Eye,
  Download
} from 'lucide-react';

interface CarouselImage {
  id: number;
  url: string;
  title: string;
  description: string;
  order: number;
}

export default function AdminGallery() {
  const [images, setImages] = useState<CarouselImage[]>([
    {
      id: 1,
      url: '/c-secur360-logo.png',
      title: 'Interface AST',
      description: 'Formulaire d\'analyse sécuritaire de tâches',
      order: 1
    },
    {
      id: 2,
      url: '/c-secur360-logo.png',
      title: 'Dashboard Analytics',
      description: 'Tableaux de bord temps réel',
      order: 2
    },
    {
      id: 3,
      url: '/c-secur360-logo.png',
      title: 'Gestion Multi-Sites',
      description: 'Interface de gestion des emplacements',
      order: 3
    }
  ]);
  
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Simulate upload - in production, use proper file upload API
      const newImageUrl = URL.createObjectURL(file);
      const newImage: CarouselImage = {
        id: Date.now(),
        url: newImageUrl,
        title: 'Nouvelle image',
        description: 'Description à modifier',
        order: images.length + 1
      };
      
      setImages(prev => [...prev, newImage]);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  const handleEditImage = (image: CarouselImage) => {
    setEditingImage({ ...image });
  };

  const handleSaveEdit = () => {
    if (!editingImage) return;
    
    setImages(prev => prev.map(img => 
      img.id === editingImage.id ? editingImage : img
    ));
    setEditingImage(null);
  };

  const handleMoveImage = (id: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
    
    // Update order
    newImages.forEach((img, index) => {
      img.order = index + 1;
    });
    
    setImages(newImages);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Gestion Galerie
          </h1>
        </div>
        
        <Link href="/admin/dashboard" style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          padding: '8px 16px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Dashboard Admin
        </Link>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Upload Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Plus size={20} />
            Ajouter une nouvelle image
          </h2>
          
          <div style={{
            border: '2px dashed rgba(100, 116, 139, 0.5)',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            />
            
            <Upload size={48} style={{ 
              color: '#94a3b8', 
              marginBottom: '16px' 
            }} />
            
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#e2e8f0' 
            }}>
              {uploading ? 'Upload en cours...' : 'Glissez une image ici ou cliquez pour sélectionner'}
            </h3>
            
            <p style={{ 
              margin: 0, 
              color: '#94a3b8',
              fontSize: '14px'
            }}>
              Formats supportés: JPG, PNG, GIF (max 10MB)
            </p>
          </div>
        </div>

        {/* Images Grid */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(100, 116, 139, 0.3)'
        }}>
          <h2 style={{
            fontSize: '20px',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ImageIcon size={20} />
            Images du carrousel ({images.length})
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {images.map((image) => (
              <div key={image.id} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <div style={{
                  height: '200px',
                  background: 'rgba(100, 116, 139, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src={image.url}
                    alt={image.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                
                <div style={{ padding: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        color: '#e2e8f0'
                      }}>
                        {image.title}
                      </h4>
                      <p style={{ 
                        margin: 0,
                        fontSize: '14px',
                        color: '#94a3b8',
                        lineHeight: '1.4'
                      }}>
                        {image.description}
                      </p>
                    </div>
                    
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      #{image.order}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleEditImage(image)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit size={12} />
                      Modifier
                    </button>
                    
                    <button
                      onClick={() => handleMoveImage(image.id, 'up')}
                      disabled={image.order === 1}
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        cursor: image.order === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: image.order === 1 ? 0.5 : 1
                      }}
                    >
                      ↑
                    </button>
                    
                    <button
                      onClick={() => handleMoveImage(image.id, 'down')}
                      disabled={image.order === images.length}
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        cursor: image.order === images.length ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: image.order === images.length ? 0.5 : 1
                      }}
                    >
                      ↓
                    </button>
                    
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={12} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {images.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#94a3b8'
            }}>
              <ImageIcon size={48} style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0' }}>Aucune image</h3>
              <p style={{ margin: 0 }}>Ajoutez votre première image pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Edit size={24} style={{ color: '#10b981' }} />
              Modifier l'image
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  Titre
                </label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage(prev => 
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#e2e8f0'
                }}>
                  Description
                </label>
                <textarea
                  value={editingImage.description}
                  onChange={(e) => setEditingImage(prev => 
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(100, 116, 139, 0.3)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={16} />
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingImage(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(100, 116, 139, 0.6)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}