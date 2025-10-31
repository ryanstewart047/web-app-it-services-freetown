import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { timestamp, formType } = await request.json();
    
    if (!timestamp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Timestamp is required' 
      }, { status: 400 });
    }

    const fs = require('fs').promises;
    const path = require('path');
    
    // Read analytics data file
    const dataDir = path.join(process.cwd(), 'data');
    const dataFile = path.join(dataDir, 'analytics.json');
    
    let data;
    try {
      const content = await fs.readFile(dataFile, 'utf-8');
      data = JSON.parse(content);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not read analytics file' 
      }, { status: 500 });
    }
    
    if (!data.forms || !data.forms.submissions) {
      return NextResponse.json({ 
        success: false, 
        error: 'No form submissions found' 
      }, { status: 404 });
    }
    
    const originalCount = data.forms.submissions.length;
    
    // Filter out the specific submission by timestamp
    data.forms.submissions = data.forms.submissions.filter((submission: any) => {
      // Match by timestamp (and optionally formType for extra safety)
      const matches = submission.timestamp === timestamp;
      return !matches;
    });
    
    const removedCount = originalCount - data.forms.submissions.length;
    
    if (removedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Submission not found' 
      }, { status: 404 });
    }
    
    // Write cleaned data back
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log(`[Forms Delete] Removed submission: ${formType} at ${timestamp}`);
    
    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
      remainingCount: data.forms.submissions.length
    });
  } catch (error) {
    console.error('Error deleting form submission:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete submission' 
    }, { status: 500 });
  }
}
