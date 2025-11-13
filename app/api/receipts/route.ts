import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all receipts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    let receipts
    
    if (search) {
      // Search receipts by customer name, phone, or receipt number
      receipts = await prisma.receipt.findMany({
        where: {
          OR: [
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search } },
            { receiptNumber: { contains: search, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Get all receipts
      receipts = await prisma.receipt.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 receipts
      })
    }
    
    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}

// POST create new receipt
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Attempting to save receipt:', data.receiptNumber)
    
    // Check if receipt with this number already exists
    const existing = await prisma.receipt.findUnique({
      where: { receiptNumber: data.receiptNumber }
    })
    
    if (existing) {
      // Update existing receipt
      console.log('Updating existing receipt:', data.receiptNumber)
      const receipt = await prisma.receipt.update({
        where: { receiptNumber: data.receiptNumber },
        data: {
          receiptType: data.receiptType,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          customerAddress: data.customerAddress || null,
          receiptDate: data.receiptDate,
          items: data.items,
          notes: data.notes || null,
          paymentMethod: data.paymentMethod,
          amountPaid: data.amountPaid,
          subtotal: data.subtotal,
          change: data.change
        }
      })
      console.log('✅ Receipt updated:', receipt.receiptNumber)
      return NextResponse.json(receipt)
    } else {
      // Create new receipt
      console.log('Creating new receipt:', data.receiptNumber)
      const receipt = await prisma.receipt.create({
        data: {
          receiptNumber: data.receiptNumber,
          receiptType: data.receiptType,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          customerAddress: data.customerAddress || null,
          receiptDate: data.receiptDate,
          items: data.items,
          notes: data.notes || null,
          paymentMethod: data.paymentMethod,
          amountPaid: data.amountPaid,
          subtotal: data.subtotal,
          change: data.change
        }
      })
      console.log('✅ Receipt created:', receipt.receiptNumber)
      return NextResponse.json(receipt, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating/updating receipt:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create receipt', details: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE a receipt
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptNumber = searchParams.get('receiptNumber')
    
    if (!receiptNumber) {
      return NextResponse.json(
        { error: 'Receipt number is required' },
        { status: 400 }
      )
    }
    
    await prisma.receipt.delete({
      where: { receiptNumber }
    })
    
    return NextResponse.json({ message: 'Receipt deleted successfully' })
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return NextResponse.json(
      { error: 'Failed to delete receipt' },
      { status: 500 }
    )
  }
}
