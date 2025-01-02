import { Router } from 'express';
import { getData } from '../controllers/data';

const router: Router = Router();

router.get('/fetch', getData);

export default router;
