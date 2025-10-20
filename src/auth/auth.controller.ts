import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Admin login',
    description: 'Authenticate admin user and return JWT token'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Admin login credentials',
    examples: {
      example1: {
        summary: 'Admin Login Example',
        description: 'Example admin login request with real credentials',
        value: {
          email: 'admin@example.com',
          password: 'Admin123!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'admin_123' },
            email: { type: 'string', example: 'admin@example.com' },
            role: { type: 'string', example: 'admin' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }
}