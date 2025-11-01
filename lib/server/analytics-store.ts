import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = process.env.APP_DATA_FILE
	? path.resolve(process.cwd(), process.env.APP_DATA_FILE)
	: path.resolve(process.cwd(), 'data/app-analytics.json');

const GIST_ID = process.env.GITHUB_GIST_ID;
const GIST_TOKEN = process.env.ITS_FREETOWN_OFFER_TOKEN || process.env.ITS_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const GIST_FILENAME = process.env.GITHUB_GIST_FILENAME || 'its-analytics.json';

const DEFAULT_DATA: AnalyticsData = {
	forms: {
		submissions: [],
		views: {},
		conversions: {}
	},
	repairs: [],
	meta: {
		version: 1,
		updatedAt: new Date(0).toISOString()
	}
};

const CACHE_TTL_MS = 3000;

let cachedData: AnalyticsData | null = null;
let lastCacheLoad = 0;

export interface FormSubmission {
	id: string;
	formType: string;
	timestamp: string;
	fields: Record<string, any>;
	userAgent?: string;
	page?: string;
	trackingId?: string;
}

export type RepairStatus =
	| 'submitted'
	| 'diagnosed'
	| 'in-progress'
	| 'completed'
	| 'cancelled'
	| 'received'
	| 'ready-for-pickup';

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

async function ensureDataDir() {
	const dir = path.dirname(DATA_FILE_PATH);
	await fs.mkdir(dir, { recursive: true });
}

function normaliseData(raw: Partial<AnalyticsData> | null | undefined): AnalyticsData {
	if (!raw) return structuredClone(DEFAULT_DATA);

	return {
		forms: {
			submissions: Array.isArray(raw.forms?.submissions) ? raw.forms!.submissions : [],
			views: raw.forms?.views ? { ...raw.forms.views } : {},
			conversions: raw.forms?.conversions ? { ...raw.forms.conversions } : {}
		},
		repairs: Array.isArray(raw.repairs) ? raw.repairs.map((repair) => ({
			...repair,
			submissionDate: repair?.submissionDate ?? new Date().toISOString(),
			status: (repair?.status as RepairStatus) || 'submitted',
			lastUpdated: repair?.lastUpdated ?? new Date().toISOString()
		})) : [],
		meta: {
			version: raw.meta?.version ?? 1,
			updatedAt: raw.meta?.updatedAt ?? new Date(0).toISOString()
		}
	};
}

async function readFromFile(): Promise<AnalyticsData> {
	await ensureDataDir();
	try {
		const content = await fs.readFile(DATA_FILE_PATH, 'utf-8');
		const parsed = JSON.parse(content) as AnalyticsData;
		return normaliseData(parsed);
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			await writeToFile(DEFAULT_DATA);
			return structuredClone(DEFAULT_DATA);
		}
		console.warn('[AnalyticsStore] Falling back to default data due to read error:', error);
		return structuredClone(DEFAULT_DATA);
	}
}

async function writeToFile(data: AnalyticsData): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function readFromGist(): Promise<AnalyticsData> {
	if (!GIST_ID) {
		return readFromFile();
	}

	try {
		const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
			headers: {
				Accept: 'application/vnd.github.v3+json'
			}
		});

		if (!response.ok) {
			console.warn('[AnalyticsStore] Unable to load gist, falling back to file:', response.status);
			return readFromFile();
		}

		const gist = await response.json();
		const file = gist.files?.[GIST_FILENAME];
		if (!file?.content) {
			await writeToGist(DEFAULT_DATA);
			return structuredClone(DEFAULT_DATA);
		}

		const parsed = JSON.parse(file.content) as AnalyticsData;
		return normaliseData(parsed);
	} catch (error) {
		console.warn('[AnalyticsStore] Gist read failed, falling back to file storage:', error);
		return readFromFile();
	}
}

async function writeToGist(data: AnalyticsData): Promise<void> {
	if (!GIST_ID || !GIST_TOKEN) {
		await writeToFile(data);
		return;
	}

	const payload = {
		files: {
			[GIST_FILENAME]: {
				content: JSON.stringify(data, null, 2)
			}
		}
	};

	try {
		const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
			method: 'PATCH',
			headers: {
				Authorization: `token ${GIST_TOKEN}`,
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github.v3+json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			console.warn('[AnalyticsStore] Gist write failed, persisting to file:', response.status, await response.text());
			await writeToFile(data);
		}
	} catch (error) {
		console.warn('[AnalyticsStore] Gist write error, persisting to file storage:', error);
		await writeToFile(data);
	}
}

async function loadData(force = false): Promise<AnalyticsData> {
	const now = Date.now();

	if (!force && cachedData && now - lastCacheLoad < CACHE_TTL_MS) {
		return structuredClone(cachedData);
	}

	const data = await readFromGist();
	cachedData = data;
	lastCacheLoad = now;
	return structuredClone(data);
}

async function persistData(data: AnalyticsData): Promise<void> {
	const serialisable: AnalyticsData = {
		...data,
		meta: {
			version: data.meta.version + 1,
			updatedAt: new Date().toISOString()
		}
	};

	cachedData = structuredClone(serialisable);
	lastCacheLoad = Date.now();

	await writeToGist(serialisable);
}

export async function getAnalyticsData(options?: { force?: boolean }): Promise<AnalyticsData> {
	return loadData(options?.force ?? false);
}

export async function recordFormView(formType: string): Promise<AnalyticsData> {
	const data = await loadData();
	data.forms.views[formType] = (data.forms.views[formType] || 0) + 1;
	await persistData(data);
	return structuredClone(data);
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
	const data = await loadData();
	const submission: FormSubmission = {
		id: `FORM-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
		formType: input.formType,
		timestamp: new Date().toISOString(),
		fields: input.fields,
		userAgent: input.userAgent,
		page: input.page,
		trackingId: input.trackingId
	};

	data.forms.submissions.push(submission);

	let repair: RepairBooking | undefined;

	if (input.formType === 'repair-booking') {
		repair = await createOrUpdateRepairFromSubmission(data, submission);
		if (repair) {
			submission.trackingId = repair.trackingId;
		}
	}

	await persistData(data);
	return { submission, repair };
}

async function createOrUpdateRepairFromSubmission(data: AnalyticsData, submission: FormSubmission): Promise<RepairBooking> {
	const fields = submission.fields || {};
	const trackingId = (submission.trackingId as string | undefined) || generateTrackingId();

	const existingIndex = data.repairs.findIndex((booking) => booking.trackingId === trackingId);
		const parsedCost = parseFloat(String(fields.totalCost ?? ''));
		const totalCost = Number.isFinite(parsedCost) ? parsedCost : undefined;

		const baseBooking: RepairBooking = {
		trackingId,
		customerName: fields.customerName || fields.name || 'Unknown',
		email: fields.email || '',
		phone: fields.phone || '',
		deviceType: fields.deviceType || 'Unknown device',
		issueDescription: fields.issueDescription || fields.issue || 'No description provided',
		status: 'received',
		submissionDate: new Date().toISOString(),
		notes: fields.notes || '',
		address: fields.address,
		deviceModel: fields.deviceModel,
		serviceType: fields.serviceType,
			lastUpdated: new Date().toISOString(),
			estimatedCompletion: deriveEstimatedCompletion(fields.preferredDate, fields.preferredTime),
			totalCost
	};

	if (existingIndex >= 0) {
		const merged: RepairBooking = {
			...data.repairs[existingIndex],
			...baseBooking
		};
		data.repairs[existingIndex] = merged;
		return merged;
	}

	data.repairs.push(baseBooking);
	return baseBooking;
}

function deriveEstimatedCompletion(date?: string, time?: string): string | undefined {
	if (!date) return undefined;
	try {
		const iso = time ? `${date}T${time}` : `${date}T09:00`;
		return new Date(iso).toISOString();
	} catch (error) {
		return undefined;
	}
}

export function generateTrackingId(): string {
	const prefix = 'ITS';
	const date = new Date();
	const formattedDate = `${date.getFullYear().toString().slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
	return `${prefix}-${formattedDate}-${random}`;
}

export async function getRepairByTrackingId(trackingId: string): Promise<RepairBooking | null> {
	const data = await loadData();
	return data.repairs.find((repair) => repair.trackingId === trackingId) ?? null;
}

export interface UpdateRepairInput {
	trackingId: string;
	status?: RepairStatus;
	notes?: string;
	estimatedCompletion?: string | null;
	totalCost?: number | null;
}

export async function updateRepair(input: UpdateRepairInput): Promise<RepairBooking | null> {
	const data = await loadData();
	const index = data.repairs.findIndex((repair) => repair.trackingId === input.trackingId);

	if (index === -1) {
		return null;
	}

	const current = data.repairs[index];
	const updated: RepairBooking = {
		...current,
		status: input.status ?? current.status,
		notes: input.notes ?? current.notes,
		estimatedCompletion: input.estimatedCompletion === undefined ? current.estimatedCompletion : input.estimatedCompletion || undefined,
		totalCost: input.totalCost === undefined ? current.totalCost : input.totalCost ?? undefined,
		lastUpdated: new Date().toISOString()
	};

	data.repairs[index] = updated;
	await persistData(data);
	return updated;
}

export async function createRepair(manualData: Omit<RepairBooking, 'submissionDate' | 'lastUpdated' | 'status'> & { status?: RepairStatus }): Promise<RepairBooking> {
	const data = await loadData();
	const existing = data.repairs.find((repair) => repair.trackingId === manualData.trackingId);

	if (existing) {
		throw new Error(`Repair with tracking ID ${manualData.trackingId} already exists`);
	}

	const booking: RepairBooking = {
		...manualData,
		status: manualData.status ?? 'received',
		submissionDate: new Date().toISOString(),
		lastUpdated: new Date().toISOString()
	};

	data.repairs.push(booking);
	await persistData(data);
	return booking;
}

export async function deleteRepair(trackingId: string): Promise<RepairBooking | null> {
	const data = await loadData();
	const index = data.repairs.findIndex((repair) => repair.trackingId === trackingId);

	if (index === -1) {
		return null;
	}

	const [removed] = data.repairs.splice(index, 1);
	await persistData(data);
	return removed;
}

export async function clearCache(): Promise<void> {
	cachedData = null;
	lastCacheLoad = 0;
}
