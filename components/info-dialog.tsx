"use client"

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InfoDialogProps {
  onClose?: () => void
}

export function InfoDialog({ onClose }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="size-4" />
          <span className="sr-only">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onClose?.()
        }}
      >
        <DialogHeader>
          <DialogTitle>Type to Read</DialogTitle>
          <DialogDescription>
            Practice typing while reading content you actually want to read.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Instead of typing random sentences, paste in an article, book
            chapter, or any text you&apos;d like to read — and improve your
            typing at the same time.
          </p>

          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="space-y-1.5 text-muted-foreground list-disc pl-4">
              <li>Paste your own text, upload a file, or pick a sample</li>
              <li>Real-time highlighting as you type — green for correct, red for errors</li>
              <li>Auto-scrolling text that keeps your current position centered</li>
              <li>WPM, accuracy, and error stats when you finish</li>
              <li>Adjustable font size</li>
              <li>Toggle punctuation, periods, and capitalization for easier practice</li>
              <li>Dark and light mode</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
