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
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS cms_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'EDITOR',
          person_id TEXT UNIQUE REFERENCES cms_people(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      const hash = bcrypt.hashSync('AdminOptimark2026!', 10);
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO cms_users (id, email, password_hash, name, role)
        VALUES ('admin-init-id', 'admin@optimark.ai', '${hash}', 'Admin Optimark', 'ADMIN')
        ON CONFLICT (email) DO UPDATE SET password_hash = '${hash}';
      `);
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO cms_users (id, email, password_hash, name, role, person_id)
        SELECT 'rafi-init-id', 'rafi@optimark.ai', '${hash}', 'Rafi Rizky', 'AUTHOR', id
        FROM cms_people WHERE slug = 'rafi-rizky'
        ON CONFLICT (email) DO NOTHING;
      `);
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO cms_users (id, email, password_hash, name, role, person_id)
        SELECT 'thia-init-id', 'thia@optimark.ai', '${hash}', 'Thia Rahmani', 'AUTHOR', id
        FROM cms_people WHERE slug = 'thia-rahmani'
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log('✅ Auto-created table cms_users & root accounts');
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
