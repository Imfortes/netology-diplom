import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { FileItem } from '../api/files';
import {
  getFiles,
  uploadFile,
  deleteFile,
  renameFile,
  updateComment,
  generateShareLink,
  getDownloadUrl
} from '../api/files';

export const FileManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editComment, setEditComment] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка файлов с сервера
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFiles();
      setFiles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки файлов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Обработка загрузки файлов
  const handleFiles = useCallback(async (fileList: FileList) => {
    setUploading(true);
    setError(null);

    const filesArray = Array.from(fileList);
    let successCount = 0;
    let errorCount = 0;

    for (const file of filesArray) {
      try {
        await uploadFile(file);
        successCount++;
      } catch (err: any) {
        errorCount++;
        console.error(`Ошибка загрузки ${file.name}:`, err);
      }
    }

    if (successCount > 0) {
      await loadFiles(); // Перезагружаем список
    }

    if (errorCount > 0) {
      setError(`Загружено: ${successCount}, ошибок: ${errorCount}`);
    }

    setUploading(false);
  }, [loadFiles]);

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

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = ''; // Сброс для повторного выбора того же файла
  };

  // Удаление файла
  const handleDelete = async (fileId: number, fileName: string) => {
    if (window.confirm(`Удалить файл "${fileName}"?`)) {
      try {
        await deleteFile(fileId);
        await loadFiles();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Ошибка удаления');
      }
    }
  };

  // Скачивание файла
  const handleDownload = (fileId: number) => {
    window.open(getDownloadUrl(fileId), '_blank');
  };

  // Начало редактирования имени
  const startRename = (file: FileItem) => {
    setEditingFile(file.id);
    setEditName(file.original_name);
  };

  // Сохранение имени
  const saveRename = async (fileId: number) => {
    if (!editName.trim()) return;
    try {
      await renameFile(fileId, editName.trim());
      setEditingFile(null);
      await loadFiles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка переименования');
    }
  };

  // Начало редактирования комментария
  const startEditComment = (file: FileItem) => {
    setEditingFile(file.id);
    setEditComment(file.comment || '');
  };

  // Сохранение комментария
  const saveComment = async (fileId: number) => {
    try {
      await updateComment(fileId, editComment);
      setEditingFile(null);
      await loadFiles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сохранения комментария');
    }
  };

  // Генерация ссылки для публичного доступа
  const handleShare = async (fileId: number) => {
    try {
      const fullUrl = await generateShareLink(fileId);

      // Копируем в буфер обмена
      await navigator.clipboard.writeText(fullUrl);

      // Показываем уведомление
      setShareLink(fullUrl);
      setTimeout(() => setShareLink(null), 3000);

      alert(`Ссылка скопирована!\n${fullUrl}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка создания ссылки');
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  // Определение иконки по типу файла
  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || fileName.endsWith('.docx')) return '📘';
    if (mimeType.includes('excel') || fileName.endsWith('.xlsx')) return '📗';
    if (mimeType.includes('powerpoint') || fileName.endsWith('.pptx')) return '📙';
    return '📄';
  };

  // Подсчет общего размера
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formatTotalSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Загрузка файлов...</div>
      </div>
    );
  }

  return (
    <div>
      <h1>Мои файлы</h1>
      <p>Добро пожаловать, {user?.full_name || user?.username}!</p>

      {/* Статистика */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        background: '#f0f0f0',
        borderRadius: '10px',
        flexWrap: 'wrap'
      }}>
        <div><strong>📁 Всего файлов:</strong> {files.length}</div>
        <div><strong>💾 Общий размер:</strong> {formatTotalSize(totalSize)}</div>
        <div><strong>🎁 Доступно места:</strong> 8 GB</div>
      </div>

      {/* Ошибка */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ❌ {error}
          <button
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Публичная ссылка (временное уведомление) */}
      {shareLink && (
        <div style={{
          padding: '12px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          🔗 Ссылка скопирована!
        </div>
      )}

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
          marginBottom: '30px',
          opacity: uploading ? 0.6 : 1,
          pointerEvents: uploading ? 'none' : 'auto'
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
          {uploading ? '⏳' : (isDragging ? '📂' : '☁️')}
        </div>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
          {uploading
            ? 'Загрузка файлов...'
            : (isDragging ? 'Отпустите файлы для загрузки' : 'Перетащите файлы сюда или нажмите для выбора')}
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
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'box-shadow 0.2s',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2, minWidth: '200px' }}>
                  <span style={{ fontSize: '32px' }}>
                    {getFileIcon(file.mime_type, file.original_name)}
                  </span>
                  <div style={{ flex: 1 }}>
                    {editingFile === file.id ? (
                      <div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveRename(file.id)}
                          style={{ padding: '4px 8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                          autoFocus
                        />
                        <button onClick={() => saveRename(file.id)} style={{ marginRight: '4px' }}>✓</button>
                        <button onClick={() => setEditingFile(null)}>✗</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {file.original_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {file.size_display} • {formatDate(file.upload_date)}
                          {file.last_download_date && (
                            <span> • Скачан: {formatDate(file.last_download_date)}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleDownload(file.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Скачать"
                  >
                    ⬇️ Скачать
                  </button>
                  <button
                    onClick={() => startRename(file)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Переименовать"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleShare(file.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Публичная ссылка"
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.original_name)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>

                {/* Комментарий */}
                <div style={{ width: '100%', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                  {editingFile === file.id && editComment !== undefined ? (
                    <div>
                      <input
                        type="text"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder="Добавить комментарий..."
                        style={{ padding: '6px 12px', marginRight: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
                      />
                      <button onClick={() => saveComment(file.id)}>✓</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <span
                        onClick={() => startEditComment(file)}
                        style={{ cursor: 'pointer', fontStyle: file.comment ? 'normal' : 'italic', color: file.comment ? '#333' : '#999' }}
                      >
                        💬 {file.comment || 'Добавить комментарий...'}
                      </span>
                    </div>
                  )}
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