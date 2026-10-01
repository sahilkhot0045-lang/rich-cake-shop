import express from 'express';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/addressController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAddresses);
router.post('/', validate(addressSchema), addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
