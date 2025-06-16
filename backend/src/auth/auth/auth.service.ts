import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(private readonly config: ConfigService) {}

  async loginUser(password: string): Promise<{ success: boolean; message?: string }> {
    const validPassword = this.config.get<string>('PASSWORD');

    if (password !== validPassword) {
      return { success: false, message: 'Invalid password' };
    }
    return { success: true };
  }
}
