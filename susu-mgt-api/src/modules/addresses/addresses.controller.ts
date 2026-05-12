import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service.js';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(SupabaseJwtGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req: { user: { id: string } }) {
    return this.addressesService.findAll(req.user.id);
  }

  @Get('primary')
  @ApiOperation({ summary: 'Get primary address' })
  @ApiResponse({
    status: 200,
    description: 'Primary address retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No primary address found' })
  async getPrimary(@Request() req: { user: { id: string } }) {
    return this.addressesService.getPrimary(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.addressesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, req.user.id, updateAddressDto);
  }

  @Patch(':id/set-primary')
  @ApiOperation({ summary: 'Set address as primary' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({
    status: 200,
    description: 'Address set as primary successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async setPrimary(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.addressesService.setPrimary(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 204, description: 'Address deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.addressesService.remove(id, req.user.id);
  }
}
