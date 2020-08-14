import { Repository, EntityRepository } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';

import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp({ username, password }: AuthCredentialsDto): Promise<void> {
    const user = new User();
    user.username = username;
    user.salt = await genSalt();
    user.password = await this.hashPassword(password, user.salt);
    // console.log(user.password);
    try {
      await user.save();
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUserPassword({
    username,
    password,
  }: AuthCredentialsDto): Promise<string> {
    const user = await this.findOne({ username });

    if (user && (await user.validatePassword(password))) {
      return user.username;
    } else {
      return null;
    }
  }

  private hashPassword(password: string, salt: string): Promise<string> {
    return hash(password, salt);
  }
}
