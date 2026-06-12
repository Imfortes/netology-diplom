import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
}

export const FileManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка файлов
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileItem[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
    }));

    setFiles(prev => [...newFiles, ...prev]);
    // TODO: Здесь будет отправка на сервер
    console.log('Загружено файлов:', newFiles);
  }, []);

  // Drag and Drop handlers
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  // Клик по области загрузки
  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Удаление файла
  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div>
      <h1>Мои файлы</h1>
      <p>Добро пожаловать, {user?.full_name}!</p>

      {/* Статистика */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        background: '#f0f0f0',
        borderRadius: '10px'
      }}>
        <div>
          <strong>Всего файлов:</strong> {files.length}
        </div>
        <div>
          <strong>Общий размер:</strong> {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
        </div>
        <div>
          <strong>Доступно места:</strong> 8 GB
        </div>
      </div>

      {/* Область загрузки Drag & Drop */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onUploadClick}
        style={{
          border: `3px dashed ${isDragging ? '#667eea' : '#ccc'}`,
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#f0f0ff' : '#fafafa',
          transition: 'all 0.3s ease',
          marginBottom: '30px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {isDragging ? '📂' : '☁️'}
        </div>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
          {isDragging ? 'Отпустите файлы для загрузки' : 'Перетащите файлы сюда или нажмите для выбора'}
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Поддерживаются любые типы файлов
        </div>
      </div>

      {/* Список файлов */}
      {files.length > 0 ? (
        <div>
          <h2>Загруженные файлы</h2>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {files.map(file => (
              <div key={file.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'box-shadow 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '32px' }}>
                    {file.type.startsWith('image/') ? '🖼️' :
                     file.type.startsWith('video/') ? '🎬' :
                     file.type.startsWith('audio/') ? '🎵' : '📄'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {formatFileSize(file.size)} • {file.uploadDate.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => deleteFile(file.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#999'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <div>У вас пока нет загруженных файлов</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Перетащите файлы в область выше или нажмите на неё
          </div>
        </div>
      )}
    </div>
  );
};