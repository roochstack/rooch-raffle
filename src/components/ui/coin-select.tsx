"use client";

import { Check, ArrowDownUp as ArrowDownUpIcon } from "lucide-react";
import { formatUnits } from "@/utils/kit";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { FormControl } from "./form";
import { CoinLabel } from "../coin-label";

export interface CoinData {
  coinType: string;
  name: string;
  balance: bigint;
  decimals: number;
  iconString?: string;
}

interface CoinSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  coinBalances: CoinData[];
  isLoading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultText?: string;
  name?: string;
  form?: UseFormReturn<any>;
}

export function CoinSelect({
  value,
  onValueChange,
  coinBalances,
  isLoading = false,
  placeholder = "选择货币",
  searchPlaceholder = "搜索货币",
  noResultText = "未找到货币",
  name,
  form,
}: CoinSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (coinType: string) => {
    if (form && name) {
      form.setValue(name, coinType);
    }
    if (onValueChange) {
      onValueChange(coinType);
    }
    setOpen(false);
  };

  const selectedCoin = coinBalances.find((coin) => coin.coinType === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'flex w-full justify-between',
              !value && 'font-normal text-muted-foreground'
            )}
          >
            {value && selectedCoin ? (
              <CoinLabel {...selectedCoin} />
            ) : isLoading ? (
              "加载中..."
            ) : (
              placeholder
            )}
            <ArrowDownUpIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{noResultText}</CommandEmpty>
            <CommandGroup>
              {coinBalances.map((coin) => (
                <CommandItem
                  value={coin.name}
                  key={coin.coinType}
                  onSelect={() => handleSelect(coin.coinType)}
                >
                  <div className="flex w-full">
                    {coin.iconString && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: coin.iconString,
                        }}
                        className="mr-2 h-4 w-4"
                      />
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <div className="leading-none">{coin.name}</div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatUnits(coin.balance, coin.decimals)}
                      </div>
                    </div>

                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        coin.coinType === value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 