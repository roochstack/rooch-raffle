'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

export interface RadioCardOption {
  value: string;
  id?: string;
  emoji?: string;
  disabled?: boolean;
  label: string;
  description?: string;
  title?: string;
}

export interface RadioCardGroupProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroup>, 'value' | 'onValueChange'> {
  options: RadioCardOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'simple' | 'detailed';
  disabled?: boolean;
}

export function RadioCardGroup({
  options,
  value,
  onValueChange,
  variant = 'simple',
  className,
  disabled,
  ...props
}: RadioCardGroupProps) {
  return (
    <RadioGroup
      className={cn('flex', className)}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      {...props}
    >
      {options.map((option) => {
        const id = option.id || `radio-card-${option.value}`;
        const isDisabled = disabled || option.disabled;
        return (
          <React.Fragment key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={id}
              className="sr-only"
              disabled={isDisabled}
            />
            <Label
              htmlFor={id}
              className={cn(
                'flex min-w-[124px] cursor-pointer items-start justify-start space-x-2 rounded-lg border py-2 pl-3 pr-4 transition-all',
                value === option.value
                  ? 'border-primary'
                  : isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-primary',
                isDisabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {option.emoji && <div className="text-sm">{option.emoji}</div>}
              {variant === 'simple' && (
                <div className="text-sm">{option.label}</div>
              )}
              {variant === 'detailed' && (
                <div>
                  <div className="text-sm font-bold">{option.title || option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              )}
            </Label>
          </React.Fragment>
        );
      })}
    </RadioGroup>
  );
} 