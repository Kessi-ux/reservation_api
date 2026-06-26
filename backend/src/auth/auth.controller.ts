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
import { RefreshDto } from './dto/refresh.dto';

import { Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token using a valid refresh token.',
  })
  @ApiBody({
    type: RefreshDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Access token refreshed successfully.',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired refresh token.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid refresh token',
        error: 'Bad Request',
      },
    },
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({
    summary: 'Logout',
    description:
      'Logs out the authenticated user by invalidating the stored refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  logout(@Req() req: Request & { user: any }) {
    return this.authService.logout(req.user.userId);
  }
}
