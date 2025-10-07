"use client"

import { useState } from "react"
import { FileText, Type, Link as LinkIcon, Loader2 } from "lucide-react"
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
    "paste" | "file" | "url" | "sample"
  >("paste")
  // Separate text state for each tab
  const [pasteText, setPasteText] = useState("")
  const [fileText, setFileText] = useState("")
  const [urlText, setUrlText] = useState("")
  const [selectedSample, setSelectedSample] = useState<string>("")
  const [url, setUrl] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState("")
  const [selectedFileName, setSelectedFileName] = useState<string>("")

  const handleSubmit = () => {
    let finalText = ""
    if (activeTab === "sample") {
      finalText = selectedSample
    } else if (activeTab === "paste") {
      finalText = pasteText
    } else if (activeTab === "file") {
      finalText = fileText
    } else if (activeTab === "url") {
      finalText = urlText
    }

    if (finalText.trim()) {
      onTextSubmit(finalText.trim())
      setOpen(false)
      setPasteText("")
      setFileText("")
      setUrlText("")
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
      reader.readAsText(file)
    }
  }

  const handleSampleSelect = (sampleText: string) => {
    setSelectedSample(sampleText)
  }

  const handleUrlExtract = async () => {
    if (!url.trim()) return

    setIsExtracting(true)
    setExtractError("")

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setExtractError(data.error || "Failed to extract text")
        return
      }

      setUrlText(data.content)
      setExtractError("")
    } catch {
      setExtractError("Network error. Please check your connection.")
    } finally {
      setIsExtracting(false)
    }
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
        className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          onClose?.()
        }}
      >
        <DialogHeader>
          <DialogTitle>Load Text</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "paste" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("paste")}
              className="gap-2"
            >
              <Type className="h-4 w-4" />
              Paste
            </Button>
            <Button
              variant={activeTab === "file" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("file")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              File
            </Button>
            <Button
              variant={activeTab === "url" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("url")}
              className="gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              URL
            </Button>
            <Button
              variant={activeTab === "sample" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("sample")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Samples
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-col min-h-[300px]">
            {activeTab === "paste" && (
              <div className="flex flex-col flex-1 gap-3">
                <Textarea
                  id="text-input"
                  placeholder="Paste the text you want to read..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="resize-none flex-1"
                />
                <p className="text-sm text-muted-foreground">
                  {pasteText.split(/\s+/).filter((w) => w.length > 0).length}{" "}
                  words
                </p>
              </div>
            )}

            {activeTab === "url" && (
              <div className="flex flex-col flex-1 gap-4">
                <div className="space-y-3">
                  <div className="flex flex-1 gap-2">
                    <input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
                      disabled={isExtracting}
                    />
                    <Button
                      onClick={handleUrlExtract}
                      disabled={!url.trim() || isExtracting}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        "Extract"
                      )}
                    </Button>
                  </div>
                  {extractError && (
                    <p className="text-sm text-destructive">{extractError}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Paste a URL to automatically extract readable text
                  </p>
                </div>
                {urlText && (
                  <div className="flex flex-col flex-1 gap-2">
                    <Textarea
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                      className="resize-none flex-1"
                    />
                    <p className="text-sm text-muted-foreground">
                      {urlText.split(/\s+/).filter((w) => w.length > 0).length}{" "}
                      words
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "file" && (
              <div className="flex flex-col flex-1 gap-4">
                <div className="space-y-3">
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
                {fileText && (
                  <div className="flex flex-col flex-1 gap-2">
                    <Textarea
                      value={fileText}
                      onChange={(e) => setFileText(e.target.value)}
                      className="resize-none flex-1"
                    />
                    <p className="text-sm text-muted-foreground">
                      {fileText.split(/\s+/).filter((w) => w.length > 0).length}{" "}
                      words
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "sample" && (
              <div className="space-y-3">
                <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
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
                      <div className="font-semibold">{sample.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {sample.text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {sample.text.split(/\s+/).length} words
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
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
                  : activeTab === "url"
                  ? !urlText.trim()
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
