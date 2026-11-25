import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';

class HealthResponse {
   @ApiProperty({ example: 'ok' })
   status: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
   @Get()
   @ApiOkResponse({ type: HealthResponse, description: 'The API process is running.' })
   check(): HealthResponse {
      return { status: 'ok' };
   }
}
