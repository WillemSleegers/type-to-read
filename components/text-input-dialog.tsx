"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { SAMPLE_TEXTS } from "@/lib/constants"
import { countWords } from "@/lib/utils"

interface TextInputDialogProps {
  onTextSubmit: (text: string) => void
  textButton?: boolean
  onClose?: () => void
}

export function TextInputDialog({
  onTextSubmit,
  textButton = false,
  onClose,
}: TextInputDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "paste" | "file" | "sample"
  >("paste")
  // Separate text state for each tab
  const [pasteText, setPasteText] = useState("")
  const [fileText, setFileText] = useState("")
  const [selectedSample, setSelectedSample] = useState<string>("")
  const [selectedFileName, setSelectedFileName] = useState<string>("")

  const handleSubmit = () => {
    let finalText = ""
    if (activeTab === "sample") {
      finalText = selectedSample
    } else if (activeTab === "paste") {
      finalText = pasteText
    } else if (activeTab === "file") {
      finalText = fileText
    }

    if (finalText.trim()) {
      onTextSubmit(finalText.trim())
      setOpen(false)
      setPasteText("")
      setFileText("")
      setSelectedSample("")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setFileText(content)
      }
      reader.onerror = () => {
        setSelectedFileName("")
        setFileText("")
      }
      reader.readAsText(file)
    }
  }

  const handleSampleSelect = (sampleText: string) => {
    setSelectedSample(sampleText)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {textButton ? (
          <Button
            variant="ghost"
            size="sm"
            className="bg-accent dark:bg-accent/50 hover:bg-accent/80 dark:hover:bg-accent/70 font-semibold"
          >
            Load text
          </Button>
        ) : (
          <Button variant="ghost" size="lg" className="size-14">
            <FileText className="size-6" />
            <span className="sr-only">Load Text</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl h-[600px] flex flex-col"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onClose?.()
        }}
      >
        <DialogHeader>
          <DialogTitle>Load Text</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeTab === "paste" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("paste")}
            >
              Paste
            </Button>
            <Button
              variant={activeTab === "file" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("file")}
            >
              File
            </Button>
            <Button
              variant={activeTab === "sample" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("sample")}
            >
              Samples
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {activeTab === "paste" && (
              <div className="flex flex-col h-full gap-2 sm:gap-3 overflow-hidden">
                <Textarea
                  id="text-input"
                  placeholder="Paste the text you want to read..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="resize-none flex-1 min-h-0"
                />
                <p className="text-sm text-muted-foreground flex-shrink-0">
                  {countWords(pasteText)} words
                </p>
              </div>
            )}

            {activeTab === "file" && (
              <div className="flex flex-col h-full gap-2 sm:gap-3">
                <div className="space-y-2 sm:space-y-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      className="gap-2"
                      type="button"
                    >
                      <FileText className="h-4 w-4" />
                      Choose File
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedFileName || "No file chosen"}
                    </span>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supports .txt and .md files
                  </p>
                </div>
                <div className="flex flex-col flex-1 gap-2 min-h-0 overflow-hidden">
                  {fileText && (
                    <>
                      <Textarea
                        value={fileText}
                        onChange={(e) => setFileText(e.target.value)}
                        className="resize-none flex-1 min-h-0"
                      />
                      <p className="text-sm text-muted-foreground">
                        {countWords(fileText)} words
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "sample" && (
              <div className="h-full flex flex-col overflow-hidden">
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {SAMPLE_TEXTS.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleSelect(sample.text)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedSample === sample.text
                          ? "bg-secondary border-primary"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div className="font-semibold text-base">{sample.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {sample.text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 sm:mt-2">
                        {countWords(sample.text)} words
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 sm:pt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                activeTab === "sample"
                  ? !selectedSample
                  : activeTab === "paste"
                  ? !pasteText.trim()
                  : activeTab === "file"
                  ? !fileText.trim()
                  : true
              }
            >
              Start Reading
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
