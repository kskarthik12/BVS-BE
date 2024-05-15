import express from 'express'
import UserController from '../controller/user.js'
import Validate from '../middleware/Validate.js';
import AdminGuard from '../middleware/AdminGuard.js';
const router =express.Router();


router.get('/',AdminGuard,UserController.getAllUsers)
router.get('/candidate/:district',UserController.CandidateName)
router.post( '/signup',UserController.signUp)
router.post( "/login",UserController.login)
router.post('/forgot-password',UserController.forgotPassword);
router.put('/reset-password/:token', UserController.resetPassword);

router.post('/candidateid',UserController.CandidateId);


export default router