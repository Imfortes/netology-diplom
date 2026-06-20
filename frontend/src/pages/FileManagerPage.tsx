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
  getDownloadUrl,
  getStorageInfo
} from '../api/files';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, InputGroup, ProgressBar } from 'react-bootstrap';

interface StorageInfo {
  storage_limit: number;
  storage_used: number;
  storage_limit_display: string;
  storage_used_display: string;
  storage_free: number;
  storage_free_display: string;
  storage_percent: number;
}

export const FileManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editComment, setEditComment] = useState('');
  const [showShareAlert, setShowShareAlert] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');

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

  // Загрузка информации о хранилище
  const loadStorageInfo = useCallback(async () => {
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (err: any) {
      console.error('Ошибка загрузки информации о хранилище', err);
    }
  }, []);

  useEffect(() => {
    loadFiles();
    loadStorageInfo();
  }, [loadFiles, loadStorageInfo]);

  // Обработка загрузки файлов с проверкой лимита
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
        const errorMsg = err.response?.data?.error || err.message;
        if (errorMsg.includes('Недостаточно места') || errorMsg.includes('лимит')) {
          setError(`❌ ${errorMsg}`);
          break; // Останавливаем загрузку при превышении лимита
        }
        console.error(`Ошибка загрузки ${file.name}:`, err);
      }
    }

    if (successCount > 0) {
      await loadFiles();
      await loadStorageInfo();
    }

    if (errorCount > 0 && !error) {
      setError(`Загружено: ${successCount}, ошибок: ${errorCount}`);
    }

    setUploading(false);
  }, [loadFiles, loadStorageInfo, error]);

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
    e.target.value = '';
  };

  // Удаление файла
  const handleDelete = async (fileId: number, fileName: string) => {
    if (window.confirm(`Удалить файл "${fileName}"?`)) {
      try {
        await deleteFile(fileId);
        await loadFiles();
        await loadStorageInfo();
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
    console.log('🔗 Начинаем создание ссылки для файла ID:', fileId);

    // Проверяем, есть ли уже ссылка у файла в списке
    const file = files.find(f => f.id === fileId);
    console.log('📄 Информация о файле:', file);

    let shareUrl = file?.share_url;

    if (shareUrl) {
      // Если ссылка уже есть - используем её
      console.log('✅ Найдена существующая ссылка:', shareUrl);
      const fullUrl = shareUrl.startsWith('http') ? shareUrl : `${window.location.origin}${shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(fullUrl);
      setShowShareAlert(true);
      setTimeout(() => setShowShareAlert(false), 3000);
      alert(`Ссылка скопирована!\n${fullUrl}`);
      return;
    }

    // Если ссылки нет - генерируем новую
    console.log('🔄 Генерируем новую ссылку...');
    const response = await generateShareLink(fileId);
    console.log('📥 Ответ от сервера:', response);

    // Проверяем что ответ пришел
    if (!response) {
      throw new Error('Сервер не вернул ссылку');
    }

    // Формируем полный URL
    const fullUrl = response.startsWith('http') ? response : `${window.location.origin}${response}`;
    console.log('✅ Готовая ссылка:', fullUrl);

    // Копируем в буфер обмена
    await navigator.clipboard.writeText(fullUrl);
    setCopiedLink(fullUrl);
    setShowShareAlert(true);
    setTimeout(() => setShowShareAlert(false), 3000);
    alert(`Ссылка скопирована!\n${fullUrl}`);

    // Обновляем список файлов, чтобы сохранить ссылку
    await loadFiles();

  } catch (err: any) {
    console.error('❌ Ошибка при создании ссылки:', err);
    const errorMessage = err.response?.data?.error || err.message || 'Ошибка создания ссылки';
    setError(errorMessage);
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
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Загрузка файлов...</p>
      </div>
    );
  }

  const isStorageNearLimit = storageInfo && storageInfo.storage_percent > 80;
  const isStorageFull = storageInfo?.storage_percent ? storageInfo.storage_percent >= 100 : false;

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="display-6 fw-bold mb-2">Мои файлы</h1>
        <p className="text-muted">Добро пожаловать, {user?.full_name || user?.username}!</p>
      </div>

      {/* Статистика */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-primary bg-opacity-10 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <div className="display-4">📁</div>
              <h3 className="mb-0">{files.length}</h3>
              <small className="text-muted">Всего файлов</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-success bg-opacity-10 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <div className="display-4">💾</div>
              <h3 className="mb-0">{formatTotalSize(totalSize)}</h3>
              <small className="text-muted">Общий размер</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-info bg-opacity-10 h-100">
            <Card.Body className="text-center d-flex flex-column justify-content-center">
              <div className="display-4">🎁</div>
              {storageInfo ? (
                <>
                  <h3 className="mb-0">{storageInfo.storage_used_display} / {storageInfo.storage_limit_display}</h3>
                  <small className="text-muted">Использовано / Бесплатно</small>
                  <div className="w-100 mt-2" style={{ maxWidth: '200px', margin: '0 auto' }}>
                    <ProgressBar
                      now={storageInfo.storage_percent}
                      label={`${storageInfo.storage_percent}%`}
                      variant={isStorageFull ? "danger" : isStorageNearLimit ? "warning" : "info"}
                      style={{ height: '8px' }}
                    />
                  </div>
                  {isStorageNearLimit && (
                    <div className="small text-warning mt-2">
                      ⚠️ Осталось мало места!
                    </div>
                  )}
                  {isStorageFull && (
                    <div className="small text-danger mt-2">
                      ⛔ Место закончилось!
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="mb-0">1 GB</h3>
                  <small className="text-muted">Бесплатно</small>
                </>
              )}
              <div className="small text-muted mt-2">
                <Badge bg="light" text="dark" className="fw-normal">
                  ↑ до 100 GB с подпиской
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ошибка */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <Alert.Heading>❌ Ошибка</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Успешное копирование ссылки */}
      <Alert
        variant="success"
        show={showShareAlert}
        onClose={() => setShowShareAlert(false)}
        dismissible
        className="position-fixed bottom-0 end-0 m-3"
        style={{ zIndex: 1050, maxWidth: '400px' }}
      >
        <Alert.Heading>🔗 Ссылка скопирована!</Alert.Heading>
        <p className="mb-0 small">{copiedLink}</p>
      </Alert>

      {/* Область загрузки Drag & Drop */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={isStorageFull ? undefined : onUploadClick}
        className={`drop-zone mb-4 ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''} ${isStorageFull ? 'disabled' : ''}`}
        style={{
          cursor: isStorageFull ? 'not-allowed' : (uploading ? 'not-allowed' : 'pointer'),
          opacity: isStorageFull ? 0.5 : 1
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileSelect}
          style={{ display: 'none' }}
          disabled={isStorageFull || false}
        />
        <div className="text-center py-5">
          <div className="display-1 mb-3">
            {uploading ? '⏳' : (isDragging ? '📂' : (isStorageFull ? '⛔' : '☁️'))}
          </div>
          <h5 className="mb-2">
            {uploading
              ? 'Загрузка файлов...'
              : isStorageFull
              ? 'Место закончилось! Удалите некоторые файлы'
              : (isDragging ? 'Отпустите файлы для загрузки' : 'Перетащите файлы сюда или нажмите для выбора')}
          </h5>
          <p className="text-muted small mb-0">
            Поддерживаются любые типы файлов
          </p>
          {uploading && (
            <div className="mt-3">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2">Загрузка...</span>
            </div>
          )}
        </div>
      </div>

      {/* Список файлов */}
      {files.length > 0 ? (
        <>
          <h2 className="h4 mb-3 fw-semibold">Загруженные файлы</h2>
          <div className="files-list">
            {files.map(file => (
              <Card key={file.id} className="mb-3 shadow-sm file-card">
                <Card.Body>
                  <Row className="align-items-start">
                    {/* Иконка и информация */}
                    <Col md={6} lg={5} className="mb-3 mb-md-0">
                      <div className="d-flex align-items-center gap-3">
                        <div className="file-icon">{getFileIcon(file.mime_type, file.original_name)}</div>
                        <div className="flex-grow-1">
                          {editingFile === file.id ? (
                            <InputGroup size="sm">
                              <Form.Control
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveRename(file.id)}
                                autoFocus
                              />
                              <Button variant="success" onClick={() => saveRename(file.id)}>✓</Button>
                              <Button variant="secondary" onClick={() => setEditingFile(null)}>✗</Button>
                            </InputGroup>
                          ) : (
                            <>
                              <div className="fw-bold mb-1">{file.original_name}</div>
                              <div className="small text-muted">
                                <Badge bg="light" text="dark" className="me-2">
                                  {file.size_display}
                                </Badge>
                                <span>{formatDate(file.upload_date)}</span>
                                {file.last_download_date && (
                                  <span className="ms-2">• Скачан: {formatDate(file.last_download_date)}</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Col>

                    {/* Действия */}
                    <Col md={6} lg={4} className="mb-3 mb-md-0">
                      <div className="d-flex gap-2 flex-wrap file-actions">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleDownload(file.id)}
                          title="Скачать"
                        >
                          ⬇️ Скачать
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => startRename(file)}
                          title="Переименовать"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleShare(file.id)}
                          title="Публичная ссылка"
                        >
                          🔗
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(file.id, file.original_name)}
                          title="Удалить"
                        >
                          🗑️
                        </Button>
                      </div>
                    </Col>

                    {/* Комментарий */}
                    <Col lg={3}>
                      {editingFile === file.id && editComment !== undefined ? (
                        <InputGroup size="sm">
                          <Form.Control
                            type="text"
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Добавить комментарий..."
                          />
                          <Button variant="success" onClick={() => saveComment(file.id)}>✓</Button>
                        </InputGroup>
                      ) : (
                        <div
                          className="comment-text small text-muted"
                          onClick={() => startEditComment(file)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="me-1">💬</span>
                          {file.comment || <span className="fst-italic">Добавить комментарий...</span>}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center py-5 bg-light">
          <Card.Body>
            <div className="display-1 mb-3">📭</div>
            <h5>У вас пока нет загруженных файлов</h5>
            <p className="text-muted">
              Перетащите файлы в область выше или нажмите на неё
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};