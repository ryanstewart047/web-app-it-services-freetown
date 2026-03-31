import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { uploadForumImage } from '@/lib/github-forum-storage';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { newPassword, photoData, fileName } = await req.json();

    const technician = await prisma.technician.findUnique({ where: { id: payload.userId } });
    if (!technician) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: any = {};

    // 1. Password Update
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'Password too short' }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // 2. Avatar Update
    if (photoData && fileName) {
       const uploadResult = await uploadForumImage(photoData, fileName);
       if (uploadResult.success) {
          updateData.profilePhoto = uploadResult.url;
       } else {
          return NextResponse.json({ error: 'Failed to upload photo to Github Storage' }, { status: 500 });
       }
    }

    // 3. Save to DB
    if (Object.keys(updateData).length > 0) {
       const updatedTech = await prisma.technician.update({
         where: { id: technician.id },
         data: updateData,
         select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            expertise: true,
            profilePhoto: true,
            isOnline: true,
            createdAt: true
         }
       });

       return NextResponse.json({ success: true, user: updatedTech });
    }

    return NextResponse.json({ success: true, message: 'Nothing changed' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
