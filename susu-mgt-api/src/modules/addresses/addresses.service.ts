import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    // If this is set as primary, unset all other primary addresses for this user
    if (createAddressDto.isPrimary) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        ...createAddressDto,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto) {
    // Check if address exists and belongs to user
    await this.findOne(id, userId);

    // If this is set as primary, unset all other primary addresses for this user
    if (updateAddressDto.isPrimary) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          id: { not: id }, // Exclude current address
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async remove(id: string, userId: string) {
    // Check if address exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.address.delete({
      where: { id },
    });
  }

  async setPrimary(id: string, userId: string) {
    // Check if address exists and belongs to user
    await this.findOne(id, userId);

    // Unset all other primary addresses for this user
    await this.prisma.address.updateMany({
      where: {
        userId,
        id: { not: id }, // Exclude current address
      },
      data: { isPrimary: false },
    });

    // Set current address as primary
    return this.prisma.address.update({
      where: { id },
      data: { isPrimary: true },
    });
  }

  async getPrimary(userId: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
    });

    if (!address) {
      throw new NotFoundException('No primary address found');
    }

    return address;
  }
}
