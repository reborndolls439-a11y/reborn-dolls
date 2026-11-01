"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-charcoal-800 mb-1.5 font-body"
          >
            {label}
            {props.required && (
              <span className="text-bloom-rose ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white px-4 py-2 text-sm font-body text-charcoal placeholder:text-taupe-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-bloom-rose-300 focus:border-bloom-rose",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-charcoal-50",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              error
                ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                : "border-charcoal-200 hover:border-charcoal-300",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-taupe",
                onRightIconClick ? "cursor-pointer hover:text-charcoal transition-colors" : "pointer-events-none"
              )}
              tabIndex={onRightIconClick ? 0 : -1}
              aria-label={onRightIconClick ? "Toggle" : undefined}
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-red-500 font-body">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-taupe font-body">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Textarea ────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-charcoal-800 mb-1.5 font-body"
          >
            {label}
            {props.required && (
              <span className="text-bloom-rose ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border bg-white px-4 py-3 text-sm font-body text-charcoal placeholder:text-taupe-400",
            "transition-all duration-200 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-bloom-rose-300 focus:border-bloom-rose",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-400 focus:ring-red-300 focus:border-red-400"
              : "border-charcoal-200 hover:border-charcoal-300",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-500 font-body">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-taupe font-body">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// ─── Select ──────────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-charcoal-800 mb-1.5 font-body"
          >
            {label}
            {props.required && <span className="text-bloom-rose ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white px-4 py-2 text-sm font-body text-charcoal",
            "transition-all duration-200 cursor-pointer appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-bloom-rose-300 focus:border-bloom-rose",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-400"
              : "border-charcoal-200 hover:border-charcoal-300",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-500 font-body">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-taupe font-body">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Input, Textarea, Select };
