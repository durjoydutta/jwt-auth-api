import {Router} from 'express';
import {signIn, signOut, signUp} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.route('/sign-up').post(signUp);
authRouter.route('/sign-in').post(signIn);
authRouter.route('/sign-out').post(signOut);

export default authRouter;