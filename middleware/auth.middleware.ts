import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AppConfig } from 'src/config.schema';
import { UserRepository } from 'src/users/schema/user.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private userRepository: UserRepository) {}
  async use(req: any, res: any, next: () => void) {
    // check header or url parameters or post parameters for token
    const token = req.headers['Authorization'] || req.headers['authorization'];

    if (!token)
      throw new UnauthorizedException(
        'You are not allowed to access information',
      );

    let decodedToken;

    try {
      decodedToken = await jwt.verify(token.substr(7), AppConfig.JWT_SECRET);
    } catch (err) {
      decodedToken = null;
    }

    if (decodedToken == null)
      throw new UnauthorizedException('Token not valid for resource');
    console.log(token);
    const { sID, membershipId, userRole, usage } = decodedToken;

    if (usage != 'LOGIN')
      throw new UnauthorizedException('User not Authorized');
    const user = await this.userRepository.findUser({
      _id: new Types.ObjectId(sID),
    });
    if (!user) throw new UnauthorizedException('User Not found');

    req.user = user;

    next();
  }
}
