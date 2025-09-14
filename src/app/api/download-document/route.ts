import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const evidenceId = searchParams.get('id')
    
    if (!evidenceId) {
      return NextResponse.json({ error: 'Evidence ID is required' }, { status: 400 })
    }

    console.log('Download request for evidence ID:', evidenceId)

    // Get evidence record from database
    const evidence = await prisma.evidence.findUnique({
      where: { id: parseInt(evidenceId) },
      include: { item: true }
    })

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
    }

    if (evidence.type !== 'document') {
      return NextResponse.json({ error: 'Not a document' }, { status: 400 })
    }

    console.log('Found evidence:', {
      id: evidence.id,
      originalName: evidence.originalName,
      cloudinaryId: evidence.cloudinaryId,
      type: evidence.type
    })

    // Since we can't access Cloudinary raw files due to ACL,
    // let's provide a helpful response for now
    const originalName = evidence.originalName || 'document.pdf'
    const cleanName = originalName.replace(/\.(auto|jpg)$/, '')
    
    let documentUrl = evidence.cloudinaryId ?? ''
    documentUrl = documentUrl.replace('/raw/upload/', '/image/upload/').replace(/(\.[a-zA-Z0-9]+)\.\1$/, '$1')

    // Create a simple HTML page that explains the situation and provides the direct link
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${cleanName}</title>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 40px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { color: #1e40af; margin-bottom: 20px; }
        .document-info {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 2px solid #bfdbfe;
        }
        .download-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
        }
        .info { color: #6b7280; font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
    <h1>📄 ${cleanName}</h1>
    
    <div class="document-info">
        <p><strong>Item:</strong> ${evidence.item.name}</p>
        <p><strong>Document:</strong> ${cleanName}</p>
        <p><strong>Uploaded:</strong> ${new Date(evidence.createdAt).toLocaleDateString()}</p>
        <p><strong>Type:</strong> ${cleanName.split('.').pop()?.toUpperCase() || 'Document'}</p>
    </div>
    
    <p class="info">
        📋 This document is stored securely in our evidence system. 
        Due to security settings, direct viewing in the browser may be restricted.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <p><strong>Access Options:</strong></p>
        <a href="${documentUrl}" class="download-btn" target="_blank">
            💾 Download Document
        </a>
        <a href="${documentUrl}" class="download-btn" target="_blank">
            👁️ Try Direct View
        </a>
    </div>
    
    <p class="info">
        💡 <strong>Tip:</strong> If the document doesn't open automatically, try right-clicking 
        the download button and selecting "Save Link As..." to download it to your computer.
    </p>
    
    <script>
        // Auto-attempt download after 2 seconds
        setTimeout(() => {
            console.log('Auto-attempting document access...');
            window.location.href = '${documentUrl}';
        }, 2000);
    </script>
</body>
</html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error in download-document:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
