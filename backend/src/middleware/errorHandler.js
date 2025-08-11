export const errorHandler = (err, req, res, next) => {
    console.error('Erro:', err);

    // Erro de validação
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: err.details.map(detail => detail.message)
        });
    }

    // Erro de autenticação JWT
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Erro de autenticação',
            message: 'Token inválido ou expirado'
        });
    }

    // Erro personalizado
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    // Erro interno do servidor
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
};
