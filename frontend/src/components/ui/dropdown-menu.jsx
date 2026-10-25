import { Menu } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"

function DropdownMenu(props) {
  return <Menu.Root {...props} />
}

function DropdownMenuTrigger({ className, ...props }) {
  return <Menu.Trigger className={cn("outline-none", className)} {...props} />
}

function DropdownMenuContent({ className, children, side = "bottom", align = "end", sideOffset = 6, ...props }) {
  return (
    <Menu.Portal>
      <Menu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <Menu.Popup
          className={cn(
            "min-w-[11rem] rounded-xl border border-border-strong/70 bg-paper p-1 outline-none",
            "shadow-[var(--shadow-float)]",
            "origin-[var(--transform-origin)] transition-[transform,opacity] duration-100",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuItem({ className, variant = "default", ...props }) {
  return (
    <Menu.Item
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] outline-none transition-colors duration-100",
        "data-[highlighted]:bg-foreground/[0.05]",
        variant === "destructive" ? "text-destructive data-[highlighted]:bg-destructive/10" : "text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
