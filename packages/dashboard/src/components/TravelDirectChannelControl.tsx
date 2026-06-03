import React, { FormEvent, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2, Loader2, Send } from 'lucide-react';

type DirectControlAction = 'OPTION_RATE' | 'PROPERTY_RATE' | 'INVENTORY';

export interface TravelDirectChannelControlProps {
  endpoint?: string;
  tenantId?: string;
  channelCode?: string;
  actorRef?: string;
  className?: string;
  onApplied?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

const actions: Array<{ id: DirectControlAction; label: string }> = [
  { id: 'OPTION_RATE', label: 'Option Rate' },
  { id: 'PROPERTY_RATE', label: 'Property Rate' },
  { id: 'INVENTORY', label: 'Inventory' },
];

export const TravelDirectChannelControl: React.FC<TravelDirectChannelControlProps> = ({
  endpoint = '/api/travelops/anvoyages/direct-control',
  tenantId = 'default',
  channelCode = 'anvoyages',
  actorRef,
  className,
  onApplied,
  onError,
}) => {
  const [action, setAction] = useState<DirectControlAction>('OPTION_RATE');
  const [tenant, setTenant] = useState(tenantId);
  const [externalPropertyId, setExternalPropertyId] = useState('');
  const [externalOptionId, setExternalOptionId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [adultPrice, setAdultPrice] = useState('');
  const [childPrice, setChildPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [inventoryQuantity, setInventoryQuantity] = useState('');
  const [inventoryDate, setInventoryDate] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [closed, setClosed] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleMonths, setRuleMonths] = useState('');
  const [rulePercent, setRulePercent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const requestPreview = useMemo(() => buildPayload(), [
    action,
    tenant,
    channelCode,
    actorRef,
    externalPropertyId,
    externalOptionId,
    basePrice,
    adultPrice,
    childPrice,
    costPrice,
    inventoryQuantity,
    inventoryDate,
    totalUnits,
    closed,
    ruleName,
    ruleMonths,
    rulePercent,
  ]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPreview),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok || body?.ok === false) {
        throw new Error(body?.error || `Direct apply failed with HTTP ${response.status}`);
      }

      setMessage({ type: 'success', text: 'Applied to AnVoyages' });
      onApplied?.(body);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      setMessage({ type: 'error', text: normalized.message });
      onError?.(normalized);
    } finally {
      setLoading(false);
    }
  }

  function buildPayload() {
    const base = compactObject({
      action,
      tenantId: tenant,
      channelCode,
      actorRef,
    });

    if (action === 'INVENTORY') {
      return {
        ...base,
        externalOptionId,
        block: compactObject({
          date: inventoryDate,
          totalUnits: toNumber(totalUnits),
          closed,
        }),
      };
    }

    const ratePayload = compactObject({
      basePrice: toNumber(basePrice),
      adultPrice: toNumber(adultPrice),
      childPrice: toNumber(childPrice),
    });
    const rules = buildRules();

    if (action === 'PROPERTY_RATE') {
      return {
        ...base,
        externalPropertyId,
        baseRate: ratePayload,
        rules,
      };
    }

    return {
      ...base,
      externalOptionId,
      baseRate: ratePayload,
      costPrice: toNumber(costPrice),
      inventoryQuantity: toNumber(inventoryQuantity),
      rules,
    };
  }

  function buildRules() {
    const percent = toNumber(rulePercent);
    if (!ruleName && !ruleMonths && percent === undefined) return [];

    return [
      compactObject({
        name: ruleName || 'Direct ERP rule',
        ruleType: 'SEASONAL',
        adjustmentType: 'PERCENT_INCREASE',
        months: parseMonths(ruleMonths),
        adjustmentPercent: percent,
      }),
    ];
  }

  const showRateFields = action !== 'INVENTORY';
  const showOptionFields = action === 'OPTION_RATE' || action === 'INVENTORY';
  const showPropertyFields = action === 'PROPERTY_RATE';

  return (
    <form
      onSubmit={submit}
      className={clsx('rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm', className)}
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold">Direct Price and Inventory Control</h3>
          <p className="text-sm text-slate-500">TravelOps {'->'} AnVoyages</p>
        </div>
        <div className="inline-flex rounded-md border border-slate-200 p-1">
          {actions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAction(item.id)}
              className={clsx(
                'rounded px-3 py-1.5 text-sm font-medium transition',
                action === item.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Field label="Tenant">
          <input value={tenant} onChange={(event) => setTenant(event.target.value)} className={inputClass} />
        </Field>

        {showPropertyFields && (
          <Field label="Property ID">
            <input
              value={externalPropertyId}
              onChange={(event) => setExternalPropertyId(event.target.value)}
              className={inputClass}
            />
          </Field>
        )}

        {showOptionFields && (
          <Field label="Option ID">
            <input
              value={externalOptionId}
              onChange={(event) => setExternalOptionId(event.target.value)}
              className={inputClass}
            />
          </Field>
        )}

        {showRateFields && (
          <>
            <Field label="Base Price">
              <input value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className={inputClass} />
            </Field>
            <Field label="Adult Price">
              <input value={adultPrice} onChange={(event) => setAdultPrice(event.target.value)} className={inputClass} />
            </Field>
            <Field label="Child Price">
              <input value={childPrice} onChange={(event) => setChildPrice(event.target.value)} className={inputClass} />
            </Field>
          </>
        )}

        {action === 'OPTION_RATE' && (
          <>
            <Field label="Cost Price">
              <input value={costPrice} onChange={(event) => setCostPrice(event.target.value)} className={inputClass} />
            </Field>
            <Field label="Inventory Qty">
              <input
                value={inventoryQuantity}
                onChange={(event) => setInventoryQuantity(event.target.value)}
                className={inputClass}
              />
            </Field>
          </>
        )}

        {action === 'INVENTORY' && (
          <>
            <Field label="Date">
              <input
                type="date"
                value={inventoryDate}
                onChange={(event) => setInventoryDate(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Total Units">
              <input value={totalUnits} onChange={(event) => setTotalUnits(event.target.value)} className={inputClass} />
            </Field>
            <label className="flex h-[66px] items-end gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={closed}
                onChange={(event) => setClosed(event.target.checked)}
                className="mb-2 h-4 w-4 rounded border-slate-300"
              />
              <span className="pb-1.5">Closed</span>
            </label>
          </>
        )}
      </div>

      {showRateFields && (
        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
          <Field label="Rule Name">
            <input value={ruleName} onChange={(event) => setRuleName(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Months">
            <input
              value={ruleMonths}
              onChange={(event) => setRuleMonths(event.target.value)}
              placeholder="6,7,8"
              className={inputClass}
            />
          </Field>
          <Field label="Percent Increase">
            <input value={rulePercent} onChange={(event) => setRulePercent(event.target.value)} className={inputClass} />
          </Field>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
        {message ? (
          <div
            className={clsx(
              'inline-flex items-center gap-2 text-sm font-medium',
              message.type === 'success' ? 'text-emerald-700' : 'text-red-700',
            )}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{message.text}</span>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{endpoint}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>Apply</span>
        </button>
      </div>
    </form>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const inputClass =
  'mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200';

function Field({ label, children }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function toNumber(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseMonths(value: string) {
  const months = value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 12);

  return months.length > 0 ? months : undefined;
}

function compactObject<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}

export default TravelDirectChannelControl;
