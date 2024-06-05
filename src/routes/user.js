import express from 'express'
import UserController from '../controller/user.js'
import CandidateController from '../controller/interact.js'
import Validate from '../middleware/Validate.js';
import AdminGuard from '../middleware/AdminGuard.js';
const router =express.Router();


router.get('/',AdminGuard,Validate,UserController.getAllUsers)
router.get('/candidate',Validate,CandidateController.CandidateName)
router.get('/getallcandidate',Validate,CandidateController.getAllcandidates)
router.post( '/signup',UserController.signUp)
router.post( "/login",UserController.login)
router.post('/forgot-password',UserController.forgotPassword);
router.put('/reset-password/:token', UserController.resetPassword);
router.put('/update-vote',Validate,UserController.updateVoteStatus)

router.post('/addvote',CandidateController.addVote);
router.post('/addCandidate',AdminGuard,Validate,CandidateController.addCandidate);
router.get('/voteStatus',Validate,CandidateController.getCandidateDetails);

export default router