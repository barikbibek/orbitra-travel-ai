import { IUser } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;  // this is for req.user or simply to add user to request body
    }
  }
}