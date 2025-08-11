import { verifyIdToken } from '../services/firebase.js';

export const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de autorização necessário' });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await verifyIdToken(token);
        
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
