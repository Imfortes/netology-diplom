import React from 'react';
import { Alert } from 'react-bootstrap';

interface AdminAlertsProps {
  error: string | null;
  successMessage: string | null;
  onCloseError: () => void;
  onCloseSuccess: () => void;
}

export const AdminAlerts: React.FC<AdminAlertsProps> = ({
  error,
  successMessage,
  onCloseError,
  onCloseSuccess,
}) => {
  return (
    <>
      {error && (
        <Alert variant="danger" dismissible onClose={onCloseError} className="mb-4">
          <Alert.Heading>❌ Ошибка</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={onCloseSuccess} className="mb-4">
          <Alert.Heading>✅ Успешно</Alert.Heading>
          <p>{successMessage}</p>
        </Alert>
      )}
    </>
  );
};