import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import api from '../../services/api';

/**
 * Componente para exibir e gerenciar comentários de uma receita
 * @component
 */
const CommentSection = ({ recipeId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [recipeId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/kommentare/rezept/${recipeId}`);
      setComments(response.data.kommentare || []);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setError('Não foi possível carregar os comentários. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await api.post(`/api/kommentare/rezept/${recipeId}`, {
        text: newComment
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      setError('Não foi possível adicionar seu comentário. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
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
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h3 className="mb-4">Comentários</h3>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            disabled={submitting}
          />
        </Form.Group>
        <Button 
          type="submit" 
          variant="primary"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? 'Enviando...' : 'Enviar Comentário'}
        </Button>
      </Form>

      <ListGroup>
        {comments.length === 0 ? (
          <ListGroup.Item className="text-center text-muted">
            Ainda não há comentários. Seja o primeiro a comentar!
          </ListGroup.Item>
        ) : (
          comments.map(comment => (
            <ListGroup.Item key={comment.id}>
              <div className="d-flex justify-content-between align-items-start">
                <strong>{comment.benutzer_name}</strong>
                <small className="text-muted">
                  {formatDate(comment.erstellungsdatum)}
                </small>
              </div>
              <p className="mt-2 mb-0">{comment.text}</p>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </div>
  );
};

CommentSection.propTypes = {
  recipeId: PropTypes.number.isRequired
};

export default CommentSection; 