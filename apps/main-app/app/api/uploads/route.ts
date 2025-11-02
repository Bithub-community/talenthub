import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/minio';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, JPEG, PNG files are allowed.' }, { status: 400 });
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;
    
    // Upload to MinIO
    const result = await uploadFile(buffer, uniqueFileName, file.type);
    
    return NextResponse.json({
      success: true,
      file: {
        fileName: result.fileName,
        originalName: file.name,
        storageUrl: result.storageUrl,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}