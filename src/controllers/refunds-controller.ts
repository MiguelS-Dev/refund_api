import { Request, Response } from 'express';
import { Category } from '@prisma/client';
import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/AppError';
import { z } from 'zod';

class RefundsController { 
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(1, { message: 'Informe o nome da solicitação' }),
      category: z.nativeEnum(Category),
      amount: z.number().positive({ message: 'Informe um valor positivo para o reembolso' }),
      filename: z.string().trim().min(20, { message: 'Informe o nome do arquivo' }),
    });

    const { name, category, amount, filename } = bodySchema.parse(request.body);

    if (!request.user) {
      throw new AppError('JWT token is missing', 401);
    }

    const refund = await prisma.refund.create({
      data: {
        name,
        category,
        amount,
        filename,
        userId: request.user.id,
      },
    });

    response.status(201).json({ refund });
  }

  async index(request: Request, response: Response) { 
    const querySchema = z.object({
      name: z.string().optional().default(''),
      page: z.coerce.number().optional().default(1),
      perPage: z.coerce.number().optional().default(10),
    })

    const { name, page, perPage } = querySchema.parse(request.query);

    const skip = (page - 1) * perPage;

    const refunds = await prisma.refund.findMany({
      skip,
      take: perPage,
      where: {
        user: {
          name: {
            contains: name.trim(),
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { user: true },
    });

    const totalRecords = await prisma.refund.count({
      where: {
        user: {
          name: {
            contains: name.trim(),
          }
        }
      }
    });

    const totalPages = Math.ceil(totalRecords / perPage);

    response.json({
      page,
       perPage,
        totalRecords,
         totalPages: totalPages > 0 ? totalPages : 1,});
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const refund = await prisma.refund.findFirst({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!refund) {
      throw new AppError('Reembolso não encontrado', 404);
    }

    if (request.user?.role === 'employee' && refund.userId !== request.user.id) {
      throw new AppError('Você não tem permissão para ver este reembolso', 403);
    }

    response.json({ refund });
  }
}

export { RefundsController };