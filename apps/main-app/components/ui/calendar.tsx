"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = [] as Array<any>;

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isSelected = selected && date.toDateString() === selected.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <Button
        key={day}
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        className={cn(
          "h-9 w-9 p-0 font-normal",
          isToday && "border border-primary",
          !isSelected && "hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => onSelect?.(date)}
      >
        {day}
      </Button>
    );
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          ←
        </Button>
        <div className="font-medium">
          {currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          →
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["P", "P", "S", "C", "P", "C", "C"].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground h-9 flex items-center justify-center">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}

export function DatePicker({ value, onChange, placeholder }: {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange?.(date.toISOString());
    setIsOpen(false);
  };

  const handleQuickSelect = (days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    setSelectedDate(futureDate);
    onChange?.(futureDate.toISOString());
  };

  const handleMonthSelect = (months: number) => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);
    setSelectedDate(futureDate);
    onChange?.(futureDate.toISOString());
  };

  const handleYearSelect = (years: number) => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + years);
    setSelectedDate(futureDate);
    onChange?.(futureDate.toISOString());
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || "YYYY-MM-DDTHH:mm:ss.sssZ"}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          📅
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(1)}
              >
                +1 Gün
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(7)}
              >
                +7 Gün
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMonthSelect(1)}
              >
                +1 Ay
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleYearSelect(1)}
              >
                +1 Yıl
              </Button>
            </div>
            <Calendar
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
}