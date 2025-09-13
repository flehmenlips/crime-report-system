import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'analyze') {
      // Analyze current folder structure
      console.log('Analyzing Cloudinary folder structure...')
      
      // Get all evidence records from database
      const allEvidence = await prisma.evidence.findMany({
        include: { item: true },
        orderBy: { createdAt: 'desc' }
      })

      // Analyze folder patterns
      const folderAnalysis = {
        totalFiles: allEvidence.length,
        folderPatterns: {} as Record<string, number>,
        resourceTypes: {} as Record<string, number>,
        fileExtensions: {} as Record<string, number>,
        duplicateNames: {} as Record<string, number>
      }

      allEvidence.forEach(evidence => {
        // Extract folder pattern
        if (evidence.cloudinaryId.includes('/')) {
          const pathParts = evidence.cloudinaryId.split('/')
          if (pathParts.length > 2) {
            const folderPattern = pathParts.slice(-3, -1).join('/') // Get last 2 folder levels
            folderAnalysis.folderPatterns[folderPattern] = (folderAnalysis.folderPatterns[folderPattern] || 0) + 1
          }
        }

        // Extract resource type
        if (evidence.cloudinaryId.includes('/image/upload/')) {
          folderAnalysis.resourceTypes['image'] = (folderAnalysis.resourceTypes['image'] || 0) + 1
        } else if (evidence.cloudinaryId.includes('/raw/upload/')) {
          folderAnalysis.resourceTypes['raw'] = (folderAnalysis.resourceTypes['raw'] || 0) + 1
        } else if (evidence.cloudinaryId.includes('demo/')) {
          folderAnalysis.resourceTypes['demo'] = (folderAnalysis.resourceTypes['demo'] || 0) + 1
        }

        // Extract file extensions
        if (evidence.originalName) {
          const ext = evidence.originalName.split('.').pop()?.toLowerCase()
          if (ext) {
            folderAnalysis.fileExtensions[ext] = (folderAnalysis.fileExtensions[ext] || 0) + 1
          }

          // Check for duplicate names
          folderAnalysis.duplicateNames[evidence.originalName] = (folderAnalysis.duplicateNames[evidence.originalName] || 0) + 1
        }
      })

      return NextResponse.json({
        success: true,
        analysis: folderAnalysis,
        evidence: allEvidence.map(e => ({
          id: e.id,
          type: e.type,
          originalName: e.originalName,
          cloudinaryId: e.cloudinaryId,
          itemId: e.itemId,
          itemName: e.item.name,
          createdAt: e.createdAt
        }))
      })
    }

    if (action === 'standardize') {
      // Standardize folder structure
      console.log('Standardizing Cloudinary folder structure...')
      
      const allEvidence = await prisma.evidence.findMany({
        include: { item: true }
      })

      const updatePlan = []
      
      for (const evidence of allEvidence) {
        // Skip demo files
        if (evidence.cloudinaryId.includes('demo/')) continue

        // Determine if this file needs restructuring
        const currentPath = evidence.cloudinaryId
        const shouldBeInCrimeReportFolder = !currentPath.includes('CrimeReport/')
        const hasInconsistentStructure = currentPath.includes('evidence/') || 
                                       !currentPath.includes(`item_${evidence.itemId}/`)

        if (shouldBeInCrimeReportFolder || hasInconsistentStructure) {
          // Plan the new structure
          const timestamp = new Date(evidence.createdAt).getTime()
          const sanitizedName = evidence.originalName?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'file'
          const newPublicId = `CrimeReport/item_${evidence.itemId}/${timestamp}_${sanitizedName}`
          
          updatePlan.push({
            evidenceId: evidence.id,
            currentId: evidence.cloudinaryId,
            newPublicId,
            type: evidence.type,
            itemName: evidence.item.name
          })
        }
      }

      return NextResponse.json({
        success: true,
        updatePlan,
        message: `Found ${updatePlan.length} files that need restructuring`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in cloudinary-cleanup:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
