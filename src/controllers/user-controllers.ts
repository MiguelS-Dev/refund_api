import { Request, Response } from 'express';
import { UseRole } from '@prisma/client';
import { prisma} from '@/database/prisma'
import { z } from 'zod';
import { hash } from 'bcrypt';


class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z
        .string({ required_error: 'Nome é obrigatório' })
        .trim()
        .min(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
        .max(100),
      email: z
        .string()
        .trim()
        .email({ message: 'Email inválido' })
        .toLowerCase(),
      password: z
        .string()
        .min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
      role: z.nativeEnum(UseRole).default(UseRole.employee),
    });

    const { name, email, password, role } = bodySchema.parse(request.body);

    const userWithSameEmail = await prisma.user.findFirst({ where: { email } });

    if (userWithSameEmail) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await hash(password, 8);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });


    response.status(201).json();
  }
}

export { UsersController };