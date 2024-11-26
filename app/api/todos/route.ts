import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId: user.id
      },
      orderBy: { order: 'asc' },
    });

    // Ensure we always return an array
    return NextResponse.json(todos || []);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { title, estimatedTime, createdAt } = await request.json();

    // Get the highest order value
    const lastTodo = await prisma.todo.findFirst({
      where: { userId: user.id },
      orderBy: { order: 'desc' }
    });

    const newOrder = (lastTodo?.order ?? -1) + 1;

    const todo = await prisma.todo.create({
      data: {
        title,
        estimatedTime,
        completed: false,
        userId: user.id,
        order: newOrder,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: createdAt ? new Date(createdAt) : new Date()
      },
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const updates = await request.json();
    
    // Verify todo belongs to user
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        user: {
          email: session.user.email
        }
      }
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    
    // Verify todo belongs to user
    const todo = await prisma.todo.findFirst({
      where: {
        id,
        user: {
          email: session.user.email
        }
      }
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await prisma.todo.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
