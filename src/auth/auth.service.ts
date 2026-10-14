import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const userCount = await this.prisma.user.count();
      if (userCount === 0) {
        const defaultPasswordHash = bcrypt.hashSync('AdminOptimark2026!', 10);
        await this.prisma.user.create({
          data: {
            email: 'admin@optimark.ai',
            name: 'Admin Optimark',
            role: 'ADMIN',
            passwordHash: defaultPasswordHash,
          },
        });
        console.log('✅ Auto-seeded root admin account: admin@optimark.ai');
      }
    } catch (err: any) {
      console.warn('⚠️ Auto-seed admin notice:', err.message);
    }
  }

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        person: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const isMatch = bcrypt.compareSync(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      personId: user.personId,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        person: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}
