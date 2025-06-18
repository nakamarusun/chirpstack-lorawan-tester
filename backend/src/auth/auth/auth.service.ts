import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomJwtPayload } from 'src/models/auth';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthService {

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(password: string): Promise<{ success: boolean; message?: string }> {
    const validPassword = this.config.get<string>('PASSWORD');

    if (password !== validPassword) {
      return { success: false, message: 'Invalid password' };
    }

    const customPayload: CustomJwtPayload = {
      id: nanoid(8),
    }

    return { success: true, message: this.jwtService.sign(customPayload) };
  }
}
