import { useState } from 'react'

const PRESETS = ['1', '5', '10', '25']

interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function TipAmountPicker({ value, onChange, disabled }: Props) {
  const [custom, setCustom] = useState(false)

  function pick(amount: string) {
    setCustom(false)
    onChange(amount)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-brew-muted">Pick a tip amount (XLM)</p>
      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            disabled={disabled}
            onClick={() => pick(p)}
            className={`chip ${!custom && value === p ? 'chip-active' : ''}`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={disabled}
          onClick={() => {
            setCustom(true)
            onChange('')
          }}
          className={`chip ${custom ? 'chip-active' : ''}`}
        >
          ✎
        </button>
      </div>
      {custom && (
        <input
          type="number"
          min="0.0000001"
          step="0.0000001"
          inputMode="decimal"
          placeholder="Custom amount"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="input"
        />
      )}
    </div>
  )
}
