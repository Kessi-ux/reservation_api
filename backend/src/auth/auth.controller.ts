import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.email,
      body.password,
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(@Body() body: LoginDto) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }
}
