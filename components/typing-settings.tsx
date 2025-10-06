import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface TypingSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  includePeriods: boolean
  onIncludePeriodsChange: (value: boolean) => void
  includePunctuation: boolean
  onIncludePunctuationChange: (value: boolean) => void
  includeCapitalization: boolean
  onIncludeCapitalizationChange: (value: boolean) => void
  onClose?: () => void
}

export function TypingSettings({
  open,
  onOpenChange,
  fontSize,
  onFontSizeChange,
  includePeriods,
  onIncludePeriodsChange,
  includePunctuation,
  onIncludePunctuationChange,
  includeCapitalization,
  onIncludeCapitalizationChange,
  onClose,
}: TypingSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent onCloseAutoFocus={(e) => {
        e.preventDefault()
        onClose?.()
      }}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your typing experience
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
            <Slider
              id="font-size"
              min={16}
              max={48}
              step={2}
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="periods" className="cursor-pointer">
              Include Periods
            </Label>
            <Switch
              id="periods"
              checked={includePeriods}
              onCheckedChange={onIncludePeriodsChange}
            />
          </div>
          <p className="text-xs text-muted-foreground -mt-4">
            When off, removes all periods (. characters)
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="punctuation" className="cursor-pointer">
              Include Punctuation
            </Label>
            <Switch
              id="punctuation"
              checked={includePunctuation}
              onCheckedChange={onIncludePunctuationChange}
            />
          </div>
          <p className="text-xs text-muted-foreground -mt-4">
            When off, removes commas, quotes, apostrophes, and other symbols
          </p>

          <div className="flex items-center justify-between">
            <Label htmlFor="capitalization" className="cursor-pointer">
              Include Capitalization
            </Label>
            <Switch
              id="capitalization"
              checked={includeCapitalization}
              onCheckedChange={onIncludeCapitalizationChange}
            />
          </div>
          <p className="text-xs text-muted-foreground -mt-4">
            When off, converts all text to lowercase
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
