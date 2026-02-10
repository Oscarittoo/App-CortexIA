/**
 * Middleware de gestion centralisée des erreurs
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: err.message
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }

  // Erreur token expiré
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expiré'
    });
  }

  // Erreur OpenAI API
  if (err.message && err.message.includes('OpenAI')) {
    return res.status(503).json({
      success: false,
      error: 'Service IA temporairement indisponible',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
