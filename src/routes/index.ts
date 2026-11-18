import {Router} from 'express';

import {usersRoutes} from './users-routes';
import {refundsRoutes} from './refunds-routes';
import {sessionsRoutes} from './sessions-routes';
import {ensureAuthenticated} from '@/middlewares/ensure-authenticated';
import {uploadsRoutes} from './uploads-routes';


const router = Router();

// Rotas públicas

router.use('/users', usersRoutes);
router.use('/sessions', sessionsRoutes);

// Rotas privadas
router.use(ensureAuthenticated);
router.use('/refunds', refundsRoutes);
router.use('/uploads', uploadsRoutes);

export {router};