/*
Contains the utility functions for the app.
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string (Indian Rupees by default)
 * @param amount The amount to format
 * @param currency The currency symbol to use (default: '₹')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "₹"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount

  // Handle invalid numbers
  if (isNaN(num)) return `${currency}0.00`

  // Format as Indian Rupees (INR) with 2 decimal places
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
    .format(num)
    .replace("₹", currency)
}

/**
 * Formats a date string to a more readable format
 * @param date The date string or Date object
 * @param formatStr The format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  formatStr: string = "MMM d, yyyy"
): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      // @ts-ignore - This is valid but TypeScript doesn't recognize it
      formatMatcher: "best fit"
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

/**
 * Formats a date to a time string
 * @param date The date string or Date object
 * @returns Formatted time string (e.g., '2:30 PM')
 */
export function formatTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting time:", error)
    return "Invalid time"
  }
}

/**
 * Truncates text to a specified length and adds an ellipsis if needed
 * @param text The text to truncate
 * @param maxLength The maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Generates a random ID of specified length
 * @param length The length of the ID to generate (default: 8)
 * @returns A random alphanumeric string
 */
export function generateId(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The string in title case
 */
export function toTitleCase(str: string): string {
  if (!str) return ""
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  )
}

/**
 * Formats a phone number to a standard format
 * @param phone The phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  // Remove all non-digit characters
  const cleaned = ("" + phone).replace(/\D/g, "")

  // Check if the number has an international code
  if (cleaned.length > 10) {
    // Format as international number
    return `+${cleaned.substring(0, cleaned.length - 10)} ${cleaned.substring(cleaned.length - 10, cleaned.length - 5)} ${cleaned.substring(cleaned.length - 5)}`
  } else if (cleaned.length === 10) {
    // Format as standard Indian mobile number
    return `${cleaned.substring(0, 5)} ${cleaned.substring(5)}`
  }

  // Return as is if it doesn't match expected formats
  return phone
}
