import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// ──────────────────────────────────────────────
// Types (unchanged – consumed by API routes)
// ──────────────────────────────────────────────

export type RepairStatus =
	| 'submitted'
	| 'diagnosed'
	| 'in-progress'
	| 'completed'
	| 'cancelled'
	| 'received'
	| 'ready-for-pickup'
	| 'collected';

export interface RepairBooking {
	trackingId: string;
	customerName: string;
	email: string;
	phone: string;
	deviceType: string;
	issueDescription: string;
	status: RepairStatus;
	submissionDate: string;
	estimatedCompletion?: string;
	totalCost?: number;
	notes?: string;
	lastUpdated?: string;
	address?: string;
	deviceModel?: string;
	serviceType?: string;
	diagnosticImages?: Array<{ data: string; uploadedAt: string }>;
	diagnosticNotes?: string;
}

export interface FormSubmission {
	id: string;
	formType: string;
	timestamp: string;
	fields: Record<string, any>;
	userAgent?: string;
	page?: string;
	trackingId?: string;
}

export interface AnalyticsData {
	forms: {
		submissions: FormSubmission[];
		views: Record<string, number>;
		conversions: Record<string, number>;
	};
	repairs: RepairBooking[];
	meta: {
		version: number;
		updatedAt: string;
	};
}

// ──────────────────────────────────────────────
// Helpers – map Prisma rows → RepairBooking
// ──────────────────────────────────────────────

function mapRepairRow(row: any): RepairBooking {
	return {
		trackingId: row.trackingId,
		customerName: row.customer?.name ?? 'Unknown',
		email: row.customer?.email ?? '',
		phone: row.customer?.phone ?? '',
		deviceType: row.deviceType,
		deviceModel: row.deviceModel ?? undefined,
		issueDescription: row.issueDescription,
		serviceType: row.serviceType ?? undefined,
		status: (row.status as RepairStatus) || 'received',
		submissionDate: (row.dateReceived ?? row.createdAt)?.toISOString?.() ?? new Date().toISOString(),
		estimatedCompletion: row.estimatedCompletion ?? undefined,
		totalCost: row.actualCost ?? row.estimatedCost ?? undefined,
		notes: row.notes || undefined,
		lastUpdated: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
		address: row.customer?.address ?? undefined,
		diagnosticImages: undefined,
		diagnosticNotes: undefined,
	};
}

// ──────────────────────────────────────────────
// Form analytics – kept in-memory / file (non-critical)
// ──────────────────────────────────────────────

import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = process.env.APP_DATA_FILE
	? path.resolve(process.cwd(), process.env.APP_DATA_FILE)
	: path.resolve(process.cwd(), 'data/app-analytics.json');

interface FormsData {
	submissions: FormSubmission[];
	views: Record<string, number>;
	conversions: Record<string, number>;
}

async function readFormsFromFile(): Promise<FormsData> {
	try {
		const dir = path.dirname(DATA_FILE_PATH);
		await fs.mkdir(dir, { recursive: true });
		const content = await fs.readFile(DATA_FILE_PATH, 'utf-8');
		const parsed = JSON.parse(content);
		return {
			submissions: Array.isArray(parsed.forms?.submissions) ? parsed.forms.submissions : [],
			views: parsed.forms?.views ?? {},
			conversions: parsed.forms?.conversions ?? {},
		};
	} catch {
		return { submissions: [], views: {}, conversions: {} };
	}
}

async function writeFormsToFile(forms: FormsData): Promise<void> {
	try {
		const dir = path.dirname(DATA_FILE_PATH);
		await fs.mkdir(dir, { recursive: true });

		let existing: any = {};
		try {
			const content = await fs.readFile(DATA_FILE_PATH, 'utf-8');
			existing = JSON.parse(content);
		} catch { /* fresh file */ }

		existing.forms = forms;
		existing.meta = {
			version: (existing.meta?.version ?? 0) + 1,
			updatedAt: new Date().toISOString(),
		};

		await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
	} catch (error) {
		console.error('[AnalyticsStore] Failed to write forms file:', error);
	}
}

// ──────────────────────────────────────────────
// Public API – getAnalyticsData
// ──────────────────────────────────────────────

export async function getAnalyticsData(options?: { force?: boolean }): Promise<AnalyticsData> {
	// Repairs come from the database (persistent!)
	let repairs: RepairBooking[] = [];
	try {
		const rows = await prisma.repair.findMany({
			orderBy: { createdAt: 'desc' },
			include: { customer: true },
		});
		repairs = rows.map(mapRepairRow);
	} catch (error) {
		console.error('[AnalyticsStore] Database read failed, returning empty repairs:', error);
	}

	// Forms come from the local file (non-critical analytics)
	const forms = await readFormsFromFile();

	return {
		forms,
		repairs,
		meta: {
			version: 1,
			updatedAt: new Date().toISOString(),
		},
	};
}

// ──────────────────────────────────────────────
// Form Operations
// ──────────────────────────────────────────────

export async function recordFormView(formType: string): Promise<AnalyticsData> {
	const forms = await readFormsFromFile();
	forms.views[formType] = (forms.views[formType] || 0) + 1;
	await writeFormsToFile(forms);
	return getAnalyticsData();
}

export interface RecordFormSubmissionInput {
	formType: string;
	fields: Record<string, any>;
	userAgent?: string;
	page?: string;
	trackingId?: string;
}

export interface RecordFormSubmissionResult {
	submission: FormSubmission;
	repair?: RepairBooking;
}

export async function recordFormSubmission(input: RecordFormSubmissionInput): Promise<RecordFormSubmissionResult> {
	const forms = await readFormsFromFile();
	const submission: FormSubmission = {
		id: `FORM-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
		formType: input.formType,
		timestamp: new Date().toISOString(),
		fields: input.fields,
		userAgent: input.userAgent,
		page: input.page,
		trackingId: input.trackingId,
	};

	forms.submissions.push(submission);

	let repair: RepairBooking | undefined;

	if (input.formType === 'repair-booking') {
		repair = await createRepairFromSubmission(submission);
		if (repair) {
			submission.trackingId = repair.trackingId;
		}
	}

	await writeFormsToFile(forms);
	return { submission, repair };
}

async function createRepairFromSubmission(submission: FormSubmission): Promise<RepairBooking | undefined> {
	const fields = submission.fields || {};
	const trackingId = (submission.trackingId as string | undefined) || generateTrackingId();

	try {
		const customerName = fields.customerName || fields.name || 'Unknown';
		const email = fields.email || `unknown-${Date.now()}@placeholder.com`;
		const phone = fields.phone || '';

		// Find or create customer
		let customer = await prisma.customer.findUnique({ where: { email } });
		if (!customer) {
			customer = await prisma.customer.create({
				data: { name: customerName, email, phone, address: fields.address },
			});
		}

		const parsedCost = parseFloat(String(fields.totalCost ?? ''));
		const totalCost = Number.isFinite(parsedCost) ? parsedCost : undefined;

		const repair = await prisma.repair.create({
			data: {
				trackingId,
				customerId: customer.id,
				deviceType: fields.deviceType || 'Unknown device',
				deviceModel: fields.deviceModel || 'Unknown',
				issueDescription: fields.issueDescription || fields.issue || 'No description provided',
				serviceType: fields.serviceType || undefined,
				status: 'received',
				estimatedCost: totalCost,
				estimatedCompletion: deriveEstimatedCompletion(fields.preferredDate, fields.preferredTime),
				notes: fields.notes || '',
			},
			include: { customer: true },
		});

		return mapRepairRow(repair);
	} catch (error) {
		console.error('[AnalyticsStore] Failed to create repair in database:', error);
		return undefined;
	}
}

// ──────────────────────────────────────────────
// Repair CRUD – all backed by PostgreSQL
// ──────────────────────────────────────────────

export async function getRepairByTrackingId(trackingId: string): Promise<RepairBooking | null> {
	try {
		const row = await prisma.repair.findUnique({
			where: { trackingId },
			include: { customer: true },
		});
		return row ? mapRepairRow(row) : null;
	} catch (error) {
		console.error('[AnalyticsStore] DB lookup failed for', trackingId, error);
		return null;
	}
}

/**
 * Search repairs by customer name, email, or phone number.
 * Returns all matching repairs (most recent first).
 */
export async function searchRepairsByCustomerInfo(query: {
	name?: string;
	email?: string;
	phone?: string;
}): Promise<RepairBooking[]> {
	try {
		const conditions: any[] = [];

		if (query.name && query.name.trim()) {
			conditions.push({
				customer: { name: { contains: query.name.trim(), mode: 'insensitive' } },
			});
		}
		if (query.email && query.email.trim()) {
			conditions.push({
				customer: { email: { equals: query.email.trim().toLowerCase(), mode: 'insensitive' } },
			});
		}
		if (query.phone && query.phone.trim()) {
			// Normalize: strip spaces, dashes, parens, plus
			const normalizedPhone = query.phone.replace(/[\s\-\(\)\+]/g, '');
			conditions.push({
				customer: {
					phone: {
						contains: normalizedPhone.slice(-8), // Match last 8 digits for flexibility
						mode: 'insensitive',
					},
				},
			});
		}

		if (conditions.length === 0) return [];

		const rows = await prisma.repair.findMany({
			where: { OR: conditions },
			include: { customer: true },
			orderBy: { dateReceived: 'desc' },
			take: 10,
		});

		return rows.map(mapRepairRow);
	} catch (error) {
		console.error('[AnalyticsStore] Customer search failed:', error);
		return [];
	}
}

export interface UpdateRepairInput {
	trackingId: string;
	status?: RepairStatus;
	notes?: string;
	estimatedCompletion?: string | null;
	totalCost?: number | null;
	diagnosticImages?: string[];
	diagnosticNotes?: string;
}

export async function updateRepair(input: UpdateRepairInput): Promise<RepairBooking | null> {
	try {
		const existing = await prisma.repair.findUnique({ 
			where: { trackingId: input.trackingId },
			include: { customer: true }
		});
		if (!existing) return null;

		const updateData: any = {};
		if (input.status !== undefined) updateData.status = input.status;
		if (input.notes !== undefined) updateData.notes = input.notes;
		if (input.estimatedCompletion !== undefined) updateData.estimatedCompletion = input.estimatedCompletion || null;
		if (input.totalCost !== undefined) {
			updateData.estimatedCost = input.totalCost;
			updateData.actualCost = input.totalCost;
		}
		if (input.status === 'completed') {
			updateData.dateCompleted = new Date();
		}

		const updated = await prisma.repair.update({
			where: { trackingId: input.trackingId },
			data: updateData,
			include: { customer: true },
		});

		// [NEW LOGIC]: Trigger Email exactly when status officially enters "ready-for-pickup"
		if (existing.status !== 'ready-for-pickup' && input.status === 'ready-for-pickup' && existing.customer.email) {
			try {
				const transporter = nodemailer.createTransport({
					host: process.env.SMTP_HOST || 'smtp.gmail.com',
					port: Number(process.env.SMTP_PORT) || 587,
					secure: false, 
					auth: {
						user: process.env.SMTP_USER || 'itservicesfreetown@gmail.com',
						pass: process.env.SMTP_PASS || 'sxue cusg zikn qfzk',
					},
				});

				const customerMailOptions = {
					from: `"IT Services Freetown" <${process.env.SMTP_USER || 'itservicesfreetown@gmail.com'}>`,
					to: existing.customer.email,
					subject: 'Your Device is Ready for Pickup! - IT Services Freetown',
					replyTo: process.env.SMTP_USER || 'itservicesfreetown@gmail.com',
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
							<div style="background-color: #040e40; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
								<h1 style="color: white; margin: 0;">IT Services Freetown</h1>
							</div>
							<div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
								<h2 style="color: #15803d;">Your Repair is Complete!</h2>
								<p>Hello <strong>${existing.customer.name}</strong>,</p>
								<p>Great news! Your <strong>${existing.deviceType}</strong> repair was completely successful and your device is now ready to be picked up.</p>
								
								<div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
									<h3 style="margin-top: 0; color: #040e40;">Pickup Location:</h3>
									<p style="margin-bottom: 0;"><strong>IT Services Freetown</strong><br/>1 Regent High way, Jui Junction, East Freetown<br/>(The exact location you dropped it off!)</p>
								</div>

								<div style="background-color: #fefce8; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fef08a;">
									<h3 style="margin-top: 0; color: #854d0e;">Want Home Delivery?</h3>
									<p style="margin-bottom: 0;">We offer local home delivery directly to your doorstep. If you wish for a technician to drop off the device at your house, simply <strong>reply directly to this email</strong> requesting a home delivery.</p>
									<p style="margin-top: 5px; font-size: 0.9em; color: #a16207;"><em>*Please note: You will be required to pay the transport fee (to and fro) for the physical delivery service.</em></p>
								</div>
								
								<p>We look forward to seeing you soon!</p>
								
								<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
								<p style="font-size: 12px; color: #666; text-align: center; line-height: 1.5;">
									&copy; ${new Date().getFullYear()} IT Services Freetown. All rights reserved.
								</p>
							</div>
						</div>
					`,
				};

				await transporter.sendMail(customerMailOptions);
				console.log('[AnalyticsStore] Successfully dispatched "ready-for-pickup" notification email to', existing.customer.email);
			} catch (emailError) {
				console.error('[AnalyticsStore] Failed to send "ready-for-pickup" email:', emailError);
			}
		}

		return mapRepairRow(updated);
	} catch (error) {
		console.error('[AnalyticsStore] Failed to update repair:', error);
		return null;
	}
}

export async function createRepair(
	manualData: Omit<RepairBooking, 'submissionDate' | 'lastUpdated' | 'status'> & { status?: RepairStatus }
): Promise<RepairBooking> {
	// Check for duplicate
	const existing = await prisma.repair.findUnique({ where: { trackingId: manualData.trackingId } });
	if (existing) {
		throw new Error(`Repair with tracking ID ${manualData.trackingId} already exists`);
	}

	// Find or create customer
	const email = manualData.email || `unknown-${Date.now()}@placeholder.com`;
	let customer = await prisma.customer.findUnique({ where: { email } });
	if (!customer) {
		customer = await prisma.customer.create({
			data: {
				name: manualData.customerName || 'Unknown',
				email,
				phone: manualData.phone || '',
				address: manualData.address,
			},
		});
	}

	const repair = await prisma.repair.create({
		data: {
			trackingId: manualData.trackingId,
			customerId: customer.id,
			deviceType: manualData.deviceType || 'Unknown',
			deviceModel: manualData.deviceModel || 'Unknown',
			issueDescription: manualData.issueDescription || 'No description',
			serviceType: manualData.serviceType || undefined,
			status: manualData.status || 'received',
			estimatedCost: manualData.totalCost,
			estimatedCompletion: manualData.estimatedCompletion,
			notes: manualData.notes || '',
		},
		include: { customer: true },
	});

	return mapRepairRow(repair);
}

export async function deleteRepair(trackingId: string): Promise<RepairBooking | null> {
	try {
		const existing = await prisma.repair.findUnique({
			where: { trackingId },
			include: { customer: true },
		});
		if (!existing) return null;

		await prisma.repair.delete({ where: { trackingId } });
		return mapRepairRow(existing);
	} catch (error) {
		console.error('[AnalyticsStore] Failed to delete repair:', error);
		return null;
	}
}

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────

function deriveEstimatedCompletion(date?: string, time?: string): string {
	if (!date) return new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
	try {
		const iso = time ? `${date}T${time}` : `${date}T09:00`;
		return new Date(iso).toISOString();
	} catch {
		return new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
	}
}

export function generateTrackingId(): string {
	const prefix = 'ITS';
	const date = new Date();
	const formattedDate = `${date.getFullYear().toString().slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
	return `${prefix}-${formattedDate}-${random}`;
}

export async function clearCache(): Promise<void> {
	// No-op – Prisma handles its own connection pool
}
