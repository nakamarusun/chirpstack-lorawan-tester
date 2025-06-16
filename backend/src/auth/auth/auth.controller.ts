import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from './auth.service';
import { LoginRequest } from 'src/models/auth';

@Controller('auth')
export class AuthController {

  constructor(private readonly appService: AuthService) {}

  @Post("/login")
  async userLogin(@Body() body: LoginRequest) {
    const result = await this.appService.loginUser(
      body.password,
    );
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get("checktok")
  checkApi() {
    return {
      message: "valid",
    };
  }
}
