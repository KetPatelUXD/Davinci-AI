'use client';
import { useId, useState } from 'react';
import { Card } from '../layout/Card';
import { Panel } from '../layout/Panel';
import { SwitchRow } from '../inputs/Switch';
import { Select } from '../inputs/Select';
import { NumberField } from '../inputs/NumberField';
import { SideToggle, type OrderSide } from '../actions/SideToggle';
import { Button } from '../actions/Button';
import { useTheme } from '../../foundations/ThemeProvider';
import { formatNumber } from '../../utils/format';
import { cn } from '../../utils/cn';

export interface Order {
  side: OrderSide;
  type: string;
  quantity: number;
  limitPrice: number;
  goodTillCancelled: boolean;
  notional: number;
  fees: number;
}

export interface OrderTicketProps {
  /** Symbol shown in the header: "Quick ticket · NSC1". */
  symbol: string;
  defaultSide?: OrderSide;
  defaultQuantity?: number;
  defaultPrice?: number;
  quantityUnit?: string;
  currency?: string;
  /** Fee as a fraction of notional (0.000195 = 1.95 bp). */
  feeRate?: number;
  orderTypes?: { id: string; label: string }[];
  onSubmit?: (order: Order) => void;
  /** Wrap in a Card (default). Set false to embed in your own surface. */
  card?: boolean;
  className?: string;
}

/**
 * Quick order ticket: header row with a GTC switch, a panel holding side toggle, order type, quantity and limit price,
 * notional/fee summary and an xl CTA whose colour and label follow the side ("Place buy order" / "Place sell order").
 */
export function OrderTicket({
  symbol, defaultSide = 'buy', defaultQuantity = 25000, defaultPrice = 84.6, quantityUnit = 'bbl', currency = 'USD', feeRate = 0.000195035,
  orderTypes = [{ id: 'limit', label: 'Limit' }, { id: 'market', label: 'Market' }, { id: 'stop', label: 'Stop' }], onSubmit, card = true, className,
}: OrderTicketProps) {
  const { locale } = useTheme();
  const [side, setSide] = useState<OrderSide>(defaultSide);
  const [type, setType] = useState(orderTypes[0]!.id);
  const [qty, setQty] = useState(defaultQuantity);
  const [price, setPrice] = useState(defaultPrice);
  const [gtc, setGtc] = useState(true);
  const id = useId();
  const notional = (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(price) ? price : 0);
  const fees = notional * feeRate;
  const money = (n: number) => formatNumber(n, { currency: 'USD', locale });
  const body = (
    <div className={cn('dv-ticket', className)}>
      <SwitchRow title={`Quick ticket · ${symbol}`} hint="GTC" switchLabel="Good till cancelled" isSelected={gtc} onChange={setGtc} />
      <Panel className="dv-ticket__panel">
        <SideToggle value={side} onChange={setSide} />
        <Select label="Order type" items={orderTypes} selectedKey={type} onSelectionChange={(k) => k && setType(String(k))} />
        <div className="dv-ticket__pair">
          <NumberField label="Quantity" value={qty} onChange={setQty} minValue={0} step={1000} suffix={quantityUnit} hideSteppers formatOptions={{ maximumFractionDigits: 0 }} />
          <NumberField label="Limit price" value={price} onChange={setPrice} minValue={0} step={0.05} suffix={currency} hideSteppers formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} isDisabled={type === 'market'} />
        </div>
      </Panel>
      <dl className="dv-ticket__sum dv:tabular-nums" aria-describedby={id}>
        <div><dt>Notional</dt><dd>{money(notional)}</dd></div>
        <div><dt>Est. fees</dt><dd>{money(fees)}</dd></div>
      </dl>
      <Button
        size="xl"
        fullWidth
        intent={side === 'buy' ? 'positive' : 'negative'}
        onPress={() => onSubmit?.({ side, type, quantity: qty, limitPrice: price, goodTillCancelled: gtc, notional, fees })}
      >
        {side === 'buy' ? 'Place buy order' : 'Place sell order'}
      </Button>
      <span id={id} className="dv:sr-only">Sample ticket with fictional data. Orders are not sent anywhere.</span>
    </div>
  );
  return card ? <Card aria-label={`Quick ticket ${symbol}`}>{body}</Card> : body;
}
