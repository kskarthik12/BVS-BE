import express from 'express'
import UserController from '../controller/user.js'
import CandidateController from '../controller/interact.js'
import Validate from '../middleware/Validate.js';
import AdminGuard from '../middleware/AdminGuard.js';
const router =express.Router();


router.get('/',AdminGuard,UserController.getAllUsers)
router.get('/candidate',CandidateController.CandidateName)
router.post( '/signup',UserController.signUp)
router.post( "/login",UserController.login)
router.post('/forgot-password',UserController.forgotPassword);
router.put('/reset-password/:token', UserController.resetPassword);

router.post('/vote/candidateId',CandidateController.candidateId);
router.post('/addCandidate',CandidateController.addCandidate);
router.get('/voteStatus',CandidateController.getCandidateDetails);

export default router