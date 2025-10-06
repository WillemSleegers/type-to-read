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
  includePunctuation: boolean
  onIncludePunctuationChange: (value: boolean) => void
  includeCapitalization: boolean
  onIncludeCapitalizationChange: (value: boolean) => void
}

export function TypingSettings({
  open,
  onOpenChange,
  fontSize,
  onFontSizeChange,
  includePunctuation,
  onIncludePunctuationChange,
  includeCapitalization,
  onIncludeCapitalizationChange,
}: TypingSettingsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            <Label htmlFor="punctuation" className="cursor-pointer">
              Include All Punctuation
            </Label>
            <Switch
              id="punctuation"
              checked={includePunctuation}
              onCheckedChange={onIncludePunctuationChange}
            />
          </div>
          <p className="text-xs text-muted-foreground -mt-4">
            When off, removes symbols like apostrophes and quotes (keeps periods and commas)
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
