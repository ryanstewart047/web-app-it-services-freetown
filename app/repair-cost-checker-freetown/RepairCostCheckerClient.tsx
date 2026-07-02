'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  BatteryCharging,
  Cable,
  Calculator,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Droplets,
  HardDrive,
  Home,
  Laptop,
  Lock,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Tablet,
  Wrench,
  Zap
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DisplayAd, InArticleAd, MultiplexAd } from '@/components/AdSense'

type DeviceId = 'phone' | 'computer' | 'tablet' | 'unlock' | 'data' | 'network'
type SeverityId = 'light' | 'standard' | 'severe'
type PartQualityId = 'value' | 'standard' | 'premium'
type UrgencyId = 'flexible' | 'same-day' | 'pickup-onsite'

interface IssueOption {
  id: string
  label: string
  shortLabel: string
  min: number
  max: number
  turnaround: string
  icon: LucideIcon
  note: string
  needsParts?: boolean
  inspectionHeavy?: boolean
}

interface DeviceOption {
  id: DeviceId
  label: string
  description: string
  icon: LucideIcon
  image: string
  brands: string[]
  issues: IssueOption[]
}

const phoneIssues: IssueOption[] = [
  {
    id: 'screen',
    label: 'Cracked screen or LCD replacement',
    shortLabel: 'Screen',
    min: 350,
    max: 1400,
    turnaround: '1 to 4 hours if the screen is available',
    icon: Smartphone,
    note: 'Screen price changes most by model and part quality.',
    needsParts: true
  },
  {
    id: 'battery',
    label: 'Battery drains fast or swollen battery',
    shortLabel: 'Battery',
    min: 150,
    max: 500,
    turnaround: '1 to 3 hours for common models',
    icon: BatteryCharging,
    note: 'Bring the device in early if the battery is swollen.',
    needsParts: true
  },
  {
    id: 'charging',
    label: 'Charging port or charging board repair',
    shortLabel: 'Charging',
    min: 75,
    max: 250,
    turnaround: '1 to 3 hours for common models',
    icon: Cable,
    note: 'We test the cable, adapter, battery, and port before replacing parts.',
    needsParts: true
  },
  {
    id: 'water',
    label: 'Water or liquid damage',
    shortLabel: 'Water damage',
    min: 150,
    max: 600,
    turnaround: 'Same day assessment, 1 to 3 days if board work is needed',
    icon: Droplets,
    note: 'Do not charge the phone. Power it off and bring it in quickly.',
    inspectionHeavy: true
  },
  {
    id: 'speaker',
    label: 'Speaker, microphone, or earpiece issue',
    shortLabel: 'Speaker',
    min: 50,
    max: 200,
    turnaround: '1 to 3 hours for common models',
    icon: Monitor,
    note: 'Dust, water, or board faults can cause similar audio symptoms.',
    needsParts: true
  },
  {
    id: 'software',
    label: 'Software flashing, boot loop, or IMEI repair',
    shortLabel: 'Software',
    min: 150,
    max: 300,
    turnaround: '1 to 4 hours depending on data and lock status',
    icon: RefreshCcw,
    note: 'Back up data first where possible because software work can affect storage.'
  }
]

const computerIssues: IssueOption[] = [
  {
    id: 'diagnosis',
    label: 'Computer inspection and diagnosis',
    shortLabel: 'Diagnosis',
    min: 50,
    max: 100,
    turnaround: '30 to 90 minutes',
    icon: Search,
    note: 'Inspection fee is applied toward the repair if you approve the quote.'
  },
  {
    id: 'screen',
    label: 'Laptop screen replacement',
    shortLabel: 'Screen',
    min: 600,
    max: 2500,
    turnaround: '1 to 3 days depending on screen availability',
    icon: Monitor,
    note: 'Exact cost depends on screen size, connector type, and resolution.',
    needsParts: true
  },
  {
    id: 'battery',
    label: 'Laptop battery replacement',
    shortLabel: 'Battery',
    min: 300,
    max: 1200,
    turnaround: 'Same day if the battery is available',
    icon: BatteryCharging,
    note: 'We test charger, DC jack, and battery health before replacement.',
    needsParts: true
  },
  {
    id: 'storage',
    label: 'SSD or hard drive replacement',
    shortLabel: 'Storage',
    min: 300,
    max: 1500,
    turnaround: '2 to 6 hours plus data transfer time',
    icon: HardDrive,
    note: 'Price depends on SSD size and whether data transfer is needed.',
    needsParts: true
  },
  {
    id: 'slow',
    label: 'Slow laptop, virus removal, or Windows repair',
    shortLabel: 'Slow system',
    min: 150,
    max: 450,
    turnaround: '2 to 5 hours',
    icon: Zap,
    note: 'A slow computer may need software repair, SSD upgrade, or malware cleanup.'
  },
  {
    id: 'board',
    label: 'No power or motherboard repair',
    shortLabel: 'No power',
    min: 500,
    max: 2500,
    turnaround: '1 to 5 days after diagnosis',
    icon: Wrench,
    note: 'Board repairs need hands-on diagnosis before a final quote.',
    inspectionHeavy: true
  }
]

const tabletIssues: IssueOption[] = [
  {
    id: 'screen',
    label: 'Tablet screen or touch replacement',
    shortLabel: 'Screen',
    min: 500,
    max: 2500,
    turnaround: '1 to 3 days depending on parts',
    icon: Tablet,
    note: 'Tablet screens vary widely by model and assembly type.',
    needsParts: true
  },
  {
    id: 'battery',
    label: 'Tablet battery replacement',
    shortLabel: 'Battery',
    min: 250,
    max: 800,
    turnaround: 'Same day if the battery is available',
    icon: BatteryCharging,
    note: 'We check charging behavior before replacing the battery.',
    needsParts: true
  },
  {
    id: 'charging',
    label: 'Tablet charging port repair',
    shortLabel: 'Charging',
    min: 150,
    max: 350,
    turnaround: '2 to 5 hours for common models',
    icon: Cable,
    note: 'Loose charging ports are common on tablets used while charging.',
    needsParts: true
  },
  {
    id: 'software',
    label: 'Tablet software repair or reset',
    shortLabel: 'Software',
    min: 150,
    max: 300,
    turnaround: '1 to 4 hours',
    icon: RefreshCcw,
    note: 'Bring account details if the reset requires owner verification.'
  }
]

const unlockIssues: IssueOption[] = [
  {
    id: 'screen-lock',
    label: 'PIN, pattern, or password unlock',
    shortLabel: 'Screen lock',
    min: 150,
    max: 300,
    turnaround: '1 to 3 hours',
    icon: Lock,
    note: 'Proof of ownership may be required before unlock work begins.'
  },
  {
    id: 'frp',
    label: 'Google FRP lock removal',
    shortLabel: 'FRP',
    min: 200,
    max: 450,
    turnaround: '1 to 4 hours depending on security patch',
    icon: ShieldCheck,
    note: 'FRP success depends on model, Android version, and security patch.'
  },
  {
    id: 'icloud',
    label: 'iCloud or Apple account lock review',
    shortLabel: 'iCloud',
    min: 500,
    max: 2000,
    turnaround: 'Assessment required',
    icon: Lock,
    note: 'Apple locks require legal ownership verification and may not always be removable.',
    inspectionHeavy: true
  },
  {
    id: 'network',
    label: 'Network unlock',
    shortLabel: 'Network',
    min: 250,
    max: 800,
    turnaround: 'Same day to 2 days',
    icon: Smartphone,
    note: 'Network unlock depends on carrier, model, and lock type.'
  }
]

const dataIssues: IssueOption[] = [
  {
    id: 'deleted-files',
    label: 'Deleted files or formatted storage',
    shortLabel: 'Deleted files',
    min: 250,
    max: 800,
    turnaround: 'Same day assessment',
    icon: HardDrive,
    note: 'Stop using the device so deleted data is not overwritten.',
    inspectionHeavy: true
  },
  {
    id: 'drive',
    label: 'Failed hard drive or SSD recovery',
    shortLabel: 'Drive recovery',
    min: 500,
    max: 2500,
    turnaround: '1 to 5 days after diagnosis',
    icon: HardDrive,
    note: 'Physical drive damage can require deeper recovery work.',
    inspectionHeavy: true
  },
  {
    id: 'phone-data',
    label: 'Phone data recovery',
    shortLabel: 'Phone data',
    min: 400,
    max: 1800,
    turnaround: '1 to 5 days depending on damage',
    icon: Smartphone,
    note: 'Lock status, water damage, and storage condition affect recovery chances.',
    inspectionHeavy: true
  },
  {
    id: 'water-data',
    label: 'Water damaged device data recovery',
    shortLabel: 'Water data',
    min: 800,
    max: 3500,
    turnaround: '1 to 7 days depending on corrosion',
    icon: Droplets,
    note: 'Do not charge a wet device. Bring it in as soon as possible.',
    inspectionHeavy: true
  }
]

const networkIssues: IssueOption[] = [
  {
    id: 'home-wifi',
    label: 'Home Wi-Fi setup or repair',
    shortLabel: 'Home Wi-Fi',
    min: 500,
    max: 1500,
    turnaround: 'Same day or next day visit',
    icon: Home,
    note: 'Distance, cable work, and router quality affect the final quote.'
  },
  {
    id: 'office-network',
    label: 'Office network setup',
    shortLabel: 'Office network',
    min: 1000,
    max: 5000,
    turnaround: '1 to 3 days depending on size',
    icon: Monitor,
    note: 'A site visit gives the most accurate quote for office cabling and Wi-Fi.'
  },
  {
    id: 'printer-pos',
    label: 'Printer, POS, or shared device setup',
    shortLabel: 'Printer or POS',
    min: 300,
    max: 1200,
    turnaround: 'Same day for simple setups',
    icon: Cable,
    note: 'Bring device passwords and network details if available.'
  },
  {
    id: 'troubleshooting',
    label: 'Internet or network troubleshooting',
    shortLabel: 'Troubleshooting',
    min: 500,
    max: 1500,
    turnaround: 'Same day or next day visit',
    icon: Wrench,
    note: 'We check signal, router placement, cables, and connected devices.'
  }
]

const devices: DeviceOption[] = [
  {
    id: 'phone',
    label: 'Phone',
    description: 'iPhone, Samsung, Tecno, Infinix, Redmi, Oppo and more',
    icon: Smartphone,
    image: '/assets/images/ai-generated/ai_phone_repair.jpg',
    brands: ['iPhone', 'Samsung', 'Tecno', 'Infinix', 'Redmi', 'Oppo', 'Huawei', 'Motorola', 'Other phone'],
    issues: phoneIssues
  },
  {
    id: 'computer',
    label: 'Laptop or PC',
    description: 'Windows laptop, desktop, MacBook and office computers',
    icon: Laptop,
    image: '/assets/images/ai-generated/ai_laptop_repair.jpg',
    brands: ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'MacBook', 'Desktop PC', 'Other computer'],
    issues: computerIssues
  },
  {
    id: 'tablet',
    label: 'Tablet',
    description: 'iPad, Samsung Tab, kids tablets and Android tablets',
    icon: Tablet,
    image: '/assets/images/ai-generated/ai_tablet_repair.jpg',
    brands: ['iPad', 'Samsung Tab', 'Huawei Tab', 'Lenovo Tab', 'Android tablet', 'Other tablet'],
    issues: tabletIssues
  },
  {
    id: 'unlock',
    label: 'Unlock',
    description: 'FRP, screen lock, iCloud review and network unlocks',
    icon: Lock,
    image: '/assets/images/ai-generated/ai_unlock_repair.jpg',
    brands: ['iPhone', 'Samsung', 'Tecno', 'Infinix', 'Redmi', 'Huawei', 'Other device'],
    issues: unlockIssues
  },
  {
    id: 'data',
    label: 'Data recovery',
    description: 'Deleted files, damaged storage and phone recovery',
    icon: HardDrive,
    image: '/assets/images/ai-generated/ai_data_recovery.jpg',
    brands: ['Phone', 'Laptop', 'External drive', 'Memory card', 'SSD', 'Hard drive', 'Other storage'],
    issues: dataIssues
  },
  {
    id: 'network',
    label: 'Home or office',
    description: 'Wi-Fi, printer, POS and network support visits',
    icon: Home,
    image: '/assets/images/ai-generated/ai_home_office_network.jpg',
    brands: ['Home', 'Small office', 'Shop', 'School', 'Church', 'NGO', 'Other location'],
    issues: networkIssues
  }
]

const severityOptions: Array<{ id: SeverityId; label: string; factor: number; description: string }> = [
  { id: 'light', label: 'Light', factor: 0.9, description: 'One clear issue, no visible extra damage' },
  { id: 'standard', label: 'Standard', factor: 1, description: 'Normal repair condition' },
  { id: 'severe', label: 'Severe', factor: 1.28, description: 'Water, drop damage, no power, or multiple symptoms' }
]

const partQualityOptions: Array<{ id: PartQualityId; label: string; factor: number; description: string }> = [
  { id: 'value', label: 'Value', factor: 0.92, description: 'Lower cost compatible option where safe' },
  { id: 'standard', label: 'Standard', factor: 1, description: 'Balanced quality and cost' },
  { id: 'premium', label: 'Premium', factor: 1.18, description: 'Best available part quality for supported models' }
]

const urgencyOptions: Array<{ id: UrgencyId; label: string; addMin: number; addMax: number; description: string }> = [
  { id: 'flexible', label: 'Flexible', addMin: 0, addMax: 0, description: 'Best price, normal queue' },
  { id: 'same-day', label: 'Same day', addMin: 50, addMax: 150, description: 'Priority handling when parts are available' },
  { id: 'pickup-onsite', label: 'Pickup or on-site', addMin: 50, addMax: 250, description: 'Freetown pickup, delivery, or visit estimate' }
]

const brandFactors: Record<string, number> = {
  iPhone: 2.2,
  iPad: 2,
  MacBook: 2.1,
  Samsung: 1.35,
  'Samsung Tab': 1.35,
  Huawei: 1.18,
  'Huawei Tab': 1.18,
  Redmi: 1.12,
  Oppo: 1.12,
  Motorola: 1.08,
  HP: 1.1,
  Dell: 1.1,
  Lenovo: 1.08,
  Acer: 1.05,
  Asus: 1.08,
  'Desktop PC': 1,
  Tecno: 1,
  Infinix: 1,
  'Android tablet': 1,
  Home: 1,
  'Small office': 1.35,
  Shop: 1.2,
  School: 1.5,
  Church: 1.25,
  NGO: 1.5
}

const popularEstimates: Array<{
  label: string
  device: DeviceId
  brand: string
  issue: string
  model: string
}> = [
  { label: 'iPhone screen', device: 'phone', brand: 'iPhone', issue: 'screen', model: 'iPhone 11 / 12 / 13' },
  { label: 'Samsung charging port', device: 'phone', brand: 'Samsung', issue: 'charging', model: 'Galaxy A series' },
  { label: 'Tecno battery', device: 'phone', brand: 'Tecno', issue: 'battery', model: 'Spark / Camon' },
  { label: 'Laptop not turning on', device: 'computer', brand: 'HP', issue: 'board', model: 'HP laptop' },
  { label: 'FRP unlock', device: 'unlock', brand: 'Samsung', issue: 'frp', model: 'Android phone' },
  { label: 'Home Wi-Fi setup', device: 'network', brand: 'Home', issue: 'home-wifi', model: 'Router and phones' }
]

const roundToNearestTen = (value: number) => Math.max(50, Math.round(value / 10) * 10)

const formatMoney = (value: number) => `Le ${value.toLocaleString('en-US')}`

const getModelFactor = (model: string) => {
  const normalized = model.toLowerCase()

  if (/(pro max|ultra|fold|flip|surface|gaming|workstation)/.test(normalized)) return 1.22
  if (/(pro|plus|max|oled|retina|touchscreen)/.test(normalized)) return 1.12
  if (/(mini|lite|go|spark|a0|a1)/.test(normalized)) return 0.95
  return 1
}

export default function RepairCostCheckerClient() {
  const [deviceId, setDeviceId] = useState<DeviceId>('phone')
  const [brand, setBrand] = useState('iPhone')
  const [model, setModel] = useState('iPhone 11 / 12 / 13')
  const [issueId, setIssueId] = useState('screen')
  const [severity, setSeverity] = useState<SeverityId>('standard')
  const [partQuality, setPartQuality] = useState<PartQualityId>('standard')
  const [urgency, setUrgency] = useState<UrgencyId>('flexible')
  const [copied, setCopied] = useState(false)

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === deviceId) || devices[0],
    [deviceId]
  )

  const selectedIssue = useMemo(
    () => selectedDevice.issues.find((issue) => issue.id === issueId) || selectedDevice.issues[0],
    [issueId, selectedDevice]
  )

  const selectedSeverity = severityOptions.find((option) => option.id === severity) || severityOptions[1]
  const selectedPartQuality = partQualityOptions.find((option) => option.id === partQuality) || partQualityOptions[1]
  const selectedUrgency = urgencyOptions.find((option) => option.id === urgency) || urgencyOptions[0]
  const SelectedIssueIcon = selectedIssue.icon

  const estimate = useMemo(() => {
    const brandFactor = brandFactors[brand] || 1
    const modelFactor = getModelFactor(model)
    const partsFactor = selectedIssue.needsParts ? selectedPartQuality.factor : 1
    const inspectionFactor = selectedIssue.inspectionHeavy && severity === 'severe' ? 1.15 : 1
    const rawMin =
      selectedIssue.min *
      brandFactor *
      modelFactor *
      selectedSeverity.factor *
      partsFactor *
      inspectionFactor +
      selectedUrgency.addMin
    const rawMax =
      selectedIssue.max *
      brandFactor *
      modelFactor *
      selectedSeverity.factor *
      partsFactor *
      inspectionFactor +
      selectedUrgency.addMax

    return {
      min: roundToNearestTen(rawMin),
      max: roundToNearestTen(Math.max(rawMax, rawMin + 40))
    }
  }, [brand, model, selectedIssue, selectedPartQuality, selectedSeverity, selectedUrgency, severity])

  const estimateSummary = `${selectedDevice.label} estimate for ${brand}${model ? ` ${model}` : ''}: ${selectedIssue.label}. Estimated range ${formatMoney(estimate.min)} - ${formatMoney(estimate.max)}.`
  const whatsappText = encodeURIComponent(
    `Hi IT Services Freetown, I used the repair cost checker.\n\n${estimateSummary}\n\nCan you confirm parts availability and the final quote?`
  )
  const whatsappUrl = `https://wa.me/23233399391?text=${whatsappText}`

  const applyPopularEstimate = (estimatePreset: typeof popularEstimates[number]) => {
    const nextDevice = devices.find((device) => device.id === estimatePreset.device)
    if (!nextDevice) return

    setDeviceId(estimatePreset.device)
    setBrand(estimatePreset.brand)
    setIssueId(estimatePreset.issue)
    setModel(estimatePreset.model)
    setSeverity('standard')
    setPartQuality('standard')
    setUrgency('flexible')
  }

  const handleDeviceChange = (nextDeviceId: DeviceId) => {
    const nextDevice = devices.find((device) => device.id === nextDeviceId)
    if (!nextDevice) return

    setDeviceId(nextDeviceId)
    setBrand(nextDevice.brands[0])
    setIssueId(nextDevice.issues[0].id)
    setModel('')
  }

  const handleCopyEstimate = async () => {
    try {
      await navigator.clipboard.writeText(`${estimateSummary} Final price requires technician inspection at IT Services Freetown.`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.warn('Could not copy estimate:', error)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
              <Calculator className="h-3.5 w-3.5" />
              Free Freetown estimate
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Repair Cost Checker in Freetown
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Get a fast price range for phone, laptop, tablet, unlocking, data recovery, and on-site IT support before you visit the shop at Jui Junction.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2">
                <MapPin className="h-4 w-4 text-red-600" />
                No. 1 Regent Highway, Jui
              </span>
              <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2">
                <Clock className="h-4 w-4 text-[#040e40]" />
                Same-day assessment for common repairs
              </span>
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
            <Image
              src={selectedDevice.image}
              alt={`${selectedDevice.label} repair at IT Services Freetown`}
              fill
              className="object-cover opacity-80"
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-sm font-semibold text-red-200">Live estimate selected</p>
              <p className="mt-1 text-2xl font-black">{formatMoney(estimate.min)} - {formatMoney(estimate.max)}</p>
              <p className="mt-1 text-sm text-slate-200">{selectedIssue.shortLabel} for {brand}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Build your estimate</h2>
                <p className="mt-1 text-sm text-slate-600">Choose what matches your device. The range updates instantly.</p>
              </div>
              <button
                type="button"
                onClick={() => applyPopularEstimate(popularEstimates[0])}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => {
                const DeviceIcon = device.icon
                const active = device.id === deviceId

                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => handleDeviceChange(device.id)}
                    className={`min-h-[112px] rounded-lg border p-4 text-left transition ${
                      active
                        ? 'border-[#040e40] bg-[#040e40] text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <DeviceIcon className={`mb-3 h-6 w-6 ${active ? 'text-red-300' : 'text-red-600'}`} />
                    <span className="block text-sm font-black">{device.label}</span>
                    <span className={`mt-1 block text-xs leading-5 ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                      {device.description}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Brand or device type</span>
                <select
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#040e40] focus:ring-2 focus:ring-[#040e40]/20"
                >
                  {selectedDevice.brands.map((brandOption) => (
                    <option key={brandOption} value={brandOption}>
                      {brandOption}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">Model or details</span>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Example: iPhone 12, HP EliteBook, Galaxy A12"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#040e40] focus:ring-2 focus:ring-[#040e40]/20"
                />
              </label>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-slate-800">What needs fixing?</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedDevice.issues.map((issue) => {
                  const IssueIcon = issue.icon
                  const active = issue.id === issueId

                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setIssueId(issue.id)}
                      className={`min-h-[96px] rounded-lg border p-4 text-left transition ${
                        active
                          ? 'border-red-600 bg-red-50 text-red-950 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-red-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IssueIcon className={`mt-0.5 h-5 w-5 shrink-0 ${active ? 'text-red-600' : 'text-slate-500'}`} />
                        <div>
                          <span className="block text-sm font-black">{issue.shortLabel}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-600">{issue.label}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-800">Condition</legend>
                <div className="space-y-2">
                  {severityOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                        severity === option.id ? 'border-[#040e40] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={option.id}
                        checked={severity === option.id}
                        onChange={() => setSeverity(option.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{option.label}</span>
                        <span className="block text-xs leading-5 text-slate-500">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-800">Part preference</legend>
                <div className="space-y-2">
                  {partQualityOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                        partQuality === option.id ? 'border-[#040e40] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="partQuality"
                        value={option.id}
                        checked={partQuality === option.id}
                        onChange={() => setPartQuality(option.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{option.label}</span>
                        <span className="block text-xs leading-5 text-slate-500">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-bold text-slate-800">Service speed</legend>
                <div className="space-y-2">
                  {urgencyOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                        urgency === option.id ? 'border-[#040e40] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={option.id}
                        checked={urgency === option.id}
                        onChange={() => setUrgency(option.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{option.label}</span>
                        <span className="block text-xs leading-5 text-slate-500">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <p className="text-sm leading-6 text-amber-900">
                  This is a planning estimate, not a final quote. A technician confirms the final price after inspection, part availability, and data risk review.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-red-700">Estimated range</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">{formatMoney(estimate.min)}</p>
                  <p className="text-3xl font-black text-slate-950">to {formatMoney(estimate.max)}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#040e40] text-white">
                  <SelectedIssueIcon className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedIssue.label}</p>
                    <p className="text-xs leading-5 text-slate-500">{brand}{model ? `, ${model}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#040e40]" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Likely turnaround</p>
                    <p className="text-xs leading-5 text-slate-500">{selectedIssue.turnaround}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Warranty guidance</p>
                    <p className="text-xs leading-5 text-slate-500">Screen repairs usually carry 24 hours. Other repairs usually carry 72 hours on the repaired part.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-slate-100 p-4">
                <p className="text-sm font-bold text-slate-900">Technician note</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedIssue.note}</p>
              </div>

              <div className="mt-5 grid gap-2">
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Book with this estimate
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                  Confirm on WhatsApp
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+23233399391"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:border-red-300 hover:text-red-700"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEstimate}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-800 transition hover:border-red-300 hover:text-red-700"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#040e40] px-4 py-3 text-sm font-black text-[#040e40] transition hover:bg-[#040e40] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask Alison in chat
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">Popular estimates</h3>
              <div className="mt-3 grid gap-2">
                {popularEstimates.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPopularEstimate(preset)}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    {preset.label}
                    <Calculator className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <DisplayAd />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              image: '/assets/images/iphone-repair.jpg',
              title: 'Phone screen and charging repairs',
              text: 'Estimate iPhone, Samsung, Tecno, Infinix, Redmi, Huawei, Oppo, and Motorola repair costs before visiting Jui Junction.'
            },
            {
              image: '/assets/images/slide02.jpg',
              title: 'Laptop diagnostics and upgrades',
              text: 'Plan for screen, battery, SSD, Windows repair, no power diagnosis, virus removal, and performance upgrades.'
            },
            {
              image: '/assets/images/mobile-unlock1.jpg',
              title: 'Legal unlocking and recovery',
              text: 'Check likely ranges for FRP, screen lock, network unlock, and data recovery work with ownership verification.'
            }
          ].map((item) => (
            <article key={item.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="relative h-44">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-2 sm:px-6 lg:px-8">
        <InArticleAd />
      </div>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Repair price questions customers ask in Freetown</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              These answers help you decide whether to repair, replace, or request a technician inspection.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                q: 'Is the estimate the final price?',
                a: 'No. It is a planning range. Final price depends on inspection, part availability, and whether extra damage is found.'
              },
              {
                q: 'Can I get same-day repair?',
                a: 'Many charging, battery, software, and common screen repairs can be same day when parts are available.'
              },
              {
                q: 'Do I pay for diagnosis?',
                a: 'Computer inspection is usually Le 50 and is applied toward the repair if you approve the quote.'
              },
              {
                q: 'What should I bring?',
                a: 'Bring the device, charger if available, account details for software work, and proof of ownership for unlock services.'
              }
            ].map((item) => (
              <div key={item.q} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-sm font-black text-slate-950">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MultiplexAd />
      </div>
    </main>
  )
}
