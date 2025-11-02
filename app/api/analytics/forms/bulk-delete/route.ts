import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/server/analytics-store';

export const dynamic = 'force-dynamic';

const GIST_ID = process.env.GITHUB_GIST_ID || process.env.OFFER_GIST_ID || '741d3c2e3203df10a318d3dae1a94c66';
const GIST_TOKEN = process.env.ITS_FREETOWN_OFFER_TOKEN || process.env.ITS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const GIST_FILENAME = process.env.GITHUB_GIST_FILENAME || 'its-analytics.json';

export async function POST(request: NextRequest) {
  try {
    const { timestamps } = await request.json();
    
    if (!timestamps || !Array.isArray(timestamps) || timestamps.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Timestamps array is required' 
      }, { status: 400 });
    }

    // Get current analytics data
    const data = await getAnalyticsData({ force: true });
    
    if (!data.forms || !data.forms.submissions) {
      return NextResponse.json({ 
        success: false, 
        error: 'No form submissions found' 
      }, { status: 404 });
    }
    
    const originalCount = data.forms.submissions.length;
    
    // Create a Set for faster lookups
    const timestampsToDelete = new Set(timestamps);
    
    // Filter out all submissions matching any of the timestamps
    data.forms.submissions = data.forms.submissions.filter((submission: any) => {
      return !timestampsToDelete.has(submission.timestamp);
    });
    
    const removedCount = originalCount - data.forms.submissions.length;
    
    if (removedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No matching submissions found' 
      }, { status: 404 });
    }
    
    // Save back to storage (Gist only - file system is read-only in production)
    if (!GIST_ID || !GIST_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'GitHub Gist storage not configured. Please set GITHUB_GIST_ID and GITHUB_TOKEN environment variables in Vercel.' 
      }, { status: 500 });
    }

    // Update GitHub Gist ONCE with all deletions
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update Gist: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    // Clear cache
    const { clearCache } = await import('@/lib/server/analytics-store');
    await clearCache();
    
    console.log(`[Forms Bulk Delete] ✅ Removed ${removedCount} submissions in one operation`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${removedCount} submission${removedCount > 1 ? 's' : ''}`,
      removedCount,
      remainingCount: data.forms.submissions.length
    });
  } catch (error) {
    console.error('Error bulk deleting form submissions:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to bulk delete submissions: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
