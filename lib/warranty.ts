export const WARRANTY_OPTIONS = [
  { value: "no-warranty", label: "No Warranty" },
  { value: "1-month", label: "1 Month" },
  { value: "3-months", label: "3 Months" },
  { value: "6-months", label: "6 Months" },
  { value: "1-year", label: "1 Year" },
  { value: "2-years", label: "2 Years" },
  { value: "3-years", label: "3 Years" },
  { value: "4-years", label: "4 Years" },
  { value: "5-years", label: "5 Years" },
] as const

export const DEFAULT_WARRANTY = "no-warranty"

export function getWarrantyLabel(value?: string | null) {
  return WARRANTY_OPTIONS.find((option) => option.value === value)?.label ?? "No Warranty"
}
