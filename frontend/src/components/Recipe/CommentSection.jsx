import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, ListGroup, Alert, Modal, Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Star Rating Component
 */
const StarRating = ({ rating, onRate, readOnly = false, size = '1.2rem' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const renderStar = (index) => {
    const filled = (hoverRating || rating) >= index + 1;
    return (
      <span
        key={index}
        className={`star ${filled ? 'filled' : ''} ${!readOnly ? 'clickable' : ''}`}
        onClick={() => !readOnly && onRate && onRate(index + 1)}
        onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        style={{
          fontSize: size,
          color: filled ? '#ffc107' : '#e4e5e9',
          cursor: readOnly ? 'default' : 'pointer',
          marginRight: '0.2rem',
          transition: 'color 0.2s ease'
        }}
      >
        ★
      </span>
    );
  };

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => renderStar(index))}
      {readOnly && rating && (
        <span className="ms-2 text-muted small">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

/**
 * Komponente zur Anzeige und Verwaltung von Kommentaren für ein Rezept
 * @component
 */
const CommentSection = ({ recipeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/kommentare/rezept/${recipeId}`);
      setComments(response.data.kommentare || []);
      setError(null);
    } catch (error) {
      console.error('Fehler beim Laden der Kommentare:', error);
      setError('Die Kommentare konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  const loadUserRating = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/api/bewertungen/rezept/${recipeId}/benutzer`);
      if (response.data.bewertung) {
        setCurrentUserRating(response.data.bewertung.bewertung);
        setNewRating(response.data.bewertung.bewertung);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerbewertung:', error);
      // Ignoriere Fehler - kann bedeuten, dass noch keine Bewertung vorhanden ist
    }
  }, [recipeId, user]);

  useEffect(() => {
    loadComments();
    loadUserRating();
  }, [loadComments, loadUserRating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && newRating === 0) return;

    try {
      setSubmitting(true);
      
      // Zuerst, falls eine Bewertung vorhanden ist, die Bewertung senden
      if (newRating > 0) {
        try {
          const response = await api.post(`/api/bewertungen/rezept/${recipeId}`, {
            bewertung: newRating
          });
          console.log('✅ Bewertung gespeichert:', response.data);
          setCurrentUserRating(newRating);
        } catch (ratingError) {
          console.error('Fehler beim Speichern der Bewertung:', ratingError);
          setError('Ihre Bewertung konnte nicht gespeichert werden.');
        }
      }
      
      // Danach, falls ein Kommentar vorhanden ist, den Kommentar senden
      if (newComment.trim()) {
        await api.post(`/api/kommentare/rezept/${recipeId}`, {
          text: newComment,
          bewertung: newRating > 0 ? newRating : null
        });
        setNewComment('');
      }
      
      // Rating nur löschen, wenn keine vorherige Bewertung vorhanden war
      if (currentUserRating === 0) {
        setNewRating(0);
      }
      
      await loadComments();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kommentars:', error);
      setError('Ihr Kommentar konnte nicht hinzugefügt werden. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      await api.put(`/api/kommentare/${editingComment.id}`, {
        text: editText.trim()
      });
      
      setShowEditModal(false);
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Kommentars:', error);
      setError('Der Kommentar konnte nicht bearbeitet werden.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
      return;
    }

    try {
      await api.delete(`/api/kommentare/${commentId}`);
      await loadComments();
    } catch (error) {
      console.error('Fehler beim Löschen des Kommentars:', error);
      setError('Der Kommentar konnte nicht gelöscht werden.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h3 className="mb-4">Kommentare</h3>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Bewertung abgeben</Form.Label>
          <div className="mb-2">
            <StarRating 
              rating={newRating} 
              onRate={setNewRating}
              size="1.5rem"
            />
            <small className="text-muted d-block mt-1">
              {currentUserRating > 0 ? (
                newRating !== currentUserRating ? 
                  `Aktuelle Bewertung: ${currentUserRating} Sterne. Neue: ${newRating} Sterne` :
                  `Ihre Bewertung: ${currentUserRating} von 5 Sternen`
              ) : (
                newRating > 0 ? `${newRating} von 5 Sternen` : 'Klicken Sie auf die Sterne zum Bewerten'
              )}
            </small>
          </div>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Kommentar (optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Schreiben Sie Ihren Kommentar..."
            disabled={submitting}
          />
        </Form.Group>
        <Button 
          type="submit" 
          variant="primary"
          disabled={submitting || (newRating === 0 && !newComment.trim())}
          style={{
            backgroundColor: '#667eea',
            borderColor: '#667eea',
            fontWeight: '600'
          }}
        >
          {submitting ? 'Wird gesendet...' : 
           (newRating > 0 && newComment.trim() ? 'Bewertung & Kommentar senden' :
            newRating > 0 ? 'Bewertung senden' : 'Kommentar senden')}
        </Button>
      </Form>

      <ListGroup>
        {comments.length === 0 ? (
          <ListGroup.Item className="text-center text-muted">
            Es gibt noch keine Kommentare. Seien Sie der Erste!
          </ListGroup.Item>
        ) : (
          comments.map(comment => (
            <ListGroup.Item key={comment.id}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong>{comment.benutzer_name}</strong>
                  {comment.bewertung && (
                    <div className="mt-1">
                      <StarRating 
                        rating={comment.bewertung} 
                        readOnly={true}
                        size="1rem"
                      />
                    </div>
                  )}
                </div>
                <div className="d-flex align-items-center">
                  <small className="text-muted me-2">
                    {formatDate(comment.erstellungsdatum)}
                  </small>
                  {user && user.id === comment.benutzer_id && (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${comment.id}`}>
                        ⋮
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEditComment(comment)}>
                          Bearbeiten
                        </Dropdown.Item>
                        <Dropdown.Item 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-danger"
                        >
                          Löschen
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
              </div>
              {comment.text && <p className="mt-2 mb-0">{comment.text}</p>}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>

      {/* Modal für Kommentar bearbeiten */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kommentar bearbeiten</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Kommentar bearbeiten..."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSaveEdit} disabled={!editText.trim()}>
            Speichern
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

CommentSection.propTypes = {
  recipeId: PropTypes.number.isRequired
};

export default CommentSection; 