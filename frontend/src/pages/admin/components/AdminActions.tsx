import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

interface AdminActionsProps {
  isAdmin: boolean;
  isLoading: boolean;
  onToggleAdmin: () => void;
  onDelete: () => void;
}

export const AdminActions: React.FC<AdminActionsProps> = ({
  isAdmin,
  isLoading,
  onToggleAdmin,
  onDelete,
}) => {
  return (
    <div className="d-flex gap-2 justify-content-end">
      <Button
        variant={isAdmin ? "outline-warning" : "outline-primary"}
        size="sm"
        onClick={onToggleAdmin}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : isAdmin ? (
          <>🔽 Снять админа</>
        ) : (
          <>👑 Сделать админом</>
        )}
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onDelete}
        disabled={isLoading}
      >
        🗑️ Удалить
      </Button>
    </div>
  );
};