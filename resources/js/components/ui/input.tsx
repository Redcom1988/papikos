import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps =
  | (Omit<React.InputHTMLAttributes<HTMLInputElement>, "rows" | "as"> & { rows?: null; as?: "input" | null })
  | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { as: "textarea"; rows?: number | null })

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const { className, as = null, rows = null, maxLength, ...rest } = props as any
    const [value, setValue] = React.useState(rest.value ?? rest.defaultValue ?? "")

    // Sync local value with controlled value prop
    React.useEffect(() => {
      if (rest.value !== undefined) {
        setValue(rest.value)
      }
    }, [rest.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value)
      if (rest.onChange) rest.onChange(e)
    }
    const showIndicator = typeof maxLength === "number" && maxLength > 0
    const count = typeof value === "string" ? value.length : 0
    return (
      <div className="relative w-full">
        {as === "textarea" || rows !== null ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows ?? undefined}
            maxLength={maxLength}
            data-slot="input"
            className={cn(
              "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className
            )}
            value={value}
            onChange={handleChange}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={(rest as React.InputHTMLAttributes<HTMLInputElement>).type}
            maxLength={maxLength}
            data-slot="input"
            className={cn(
              "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className
            )}
            value={value}
            onChange={handleChange}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {showIndicator && (
          <span className="absolute right-2 bottom-1 text-xs text-muted-foreground select-none pointer-events-none bg-transparent px-1">
            {count}/{maxLength}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
