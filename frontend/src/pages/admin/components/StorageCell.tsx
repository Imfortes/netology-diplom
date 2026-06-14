import React from 'react';
import { ProgressBar } from 'react-bootstrap';

interface StorageCellProps {
  usedDisplay: string;
  limitDisplay: string;
  percent: number;
}

export const StorageCell: React.FC<StorageCellProps> = ({ usedDisplay, limitDisplay, percent }) => {
  const isNearLimit = percent > 80;
  const isFull = percent >= 100;

  return (
    <div className="d-flex flex-column" style={{ minWidth: '150px' }}>
      <div className="d-flex justify-content-between small mb-1">
        <span>{usedDisplay || '0 MB'}</span>
        <span className="text-muted">/ {limitDisplay || '1 GB'}</span>
      </div>
      <ProgressBar
        now={percent || 0}
        variant={isFull ? "danger" : isNearLimit ? "warning" : "success"}
        style={{ height: '6px' }}
      />
      {isNearLimit && !isFull && (
        <div className="small text-warning mt-1">⚠️ Почти заполнено</div>
      )}
      {isFull && (
        <div className="small text-danger mt-1">⛔ Место закончилось</div>
      )}
    </div>
  );
};