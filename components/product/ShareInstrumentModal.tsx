"use client"
import { useState } from "react"
import { Share2, Copy, Check, MessageSquare, Send, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareInstrumentProps {
  title: string
  price: string
  url?: string
}

export function ShareInstrumentButtons({
  title,
  price,
  url
}: ShareInstrumentProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? (url || window.location.href) : ""
  const shareText = `Check out this ${title} (${price}) on TuneMart — India's verified musical gear marketplace!`

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      setCopied(false)
    }
  }

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageSquare,
      textColor: "text-[#25D366]",
      bgHover: "hover:bg-[#25D366]/10",
      borderColor: "border-[#25D366]/30",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    },
    {
      name: "X (Twitter)",
      icon: Send,
      textColor: "text-[#0F0F12]",
      bgHover: "hover:bg-black/5",
      borderColor: "border-[#E7E5E4]",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Facebook",
      icon: Globe,
      textColor: "text-[#1877F2]",
      bgHover: "hover:bg-[#1877F2]/10",
      borderColor: "border-[#1877F2]/30",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "LinkedIn",
      icon: Globe,
      textColor: "text-[#0A66C2]",
      bgHover: "hover:bg-[#0A66C2]/10",
      borderColor: "border-[#0A66C2]/30",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Telegram",
      icon: Send,
      textColor: "text-[#229ED9]",
      bgHover: "hover:bg-[#229ED9]/10",
      borderColor: "border-[#229ED9]/30",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ]

  return (
    <div className="rounded-[20px] border border-[#E7E5E4] bg-[#FAF9F6] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#0F0F12] flex items-center gap-1.5 uppercase tracking-wider">
          <Share2 className="h-3.5 w-3.5 text-[#FF6B00]" />
          Share Instrument
        </span>
        <span className="text-[11px] text-[#78716C]">Social & Direct Link</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {socialLinks.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${item.name}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border ${item.borderColor} ${item.bgHover} text-xs font-medium ${item.textColor} transition-all shadow-2xs hover:scale-105 active:scale-95`}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span>{item.name}</span>
          </a>
        ))}

        <button
          type="button"
          onClick={handleCopyLink}
          className={`ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-[#0F0F12] text-white hover:bg-[#292524] active:scale-95"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function ShareInstrumentButton({
  title,
  price,
  url
}: ShareInstrumentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? (url || window.location.href) : ""
  const shareText = `Check out this ${title} (${price}) on TuneMart — Musical Instrument Marketplace!`

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      setCopied(false)
    }
  }

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} | TuneMart`,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch {
        // user dismissed or native share unsupported
      }
    }
    setIsOpen(true)
  }

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: MessageSquare,
      color: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`
    },
    {
      name: "X (Twitter)",
      icon: Send,
      color: "bg-black/5 text-[#0F0F12] hover:bg-black/10 border-black/20",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Facebook",
      icon: Globe,
      color: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border-[#1877F2]/30",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "LinkedIn",
      icon: Globe,
      color: "bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 border-[#0A66C2]/30",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20 border-[#229ED9]/30",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }
  ]

  return (
    <>
      <button
        type="button"
        aria-label="Share instrument"
        onClick={handleNativeShare}
        className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-[#292524] hover:text-[#FF6B00] shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-[#E7E5E4]"
        title="Share Instrument"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E7E5E4] space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold tracking-tight text-[#0F0F12]">Share Instrument</h3>
                <p className="text-xs text-[#78716C] line-clamp-1">{title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#78716C] hover:bg-[#F5F5F4] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Social Share Grid */}
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all text-center hover:scale-105 active:scale-95 ${item.color}`}
                  title={`Share on ${item.name}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-none text-[#44403C]">{item.name.split(" ")[0]}</span>
                </a>
              ))}
            </div>

            {/* Copy Link Input Bar */}
            <div className="space-y-2 pt-2 border-t border-[#F5F5F4]">
              <label className="text-xs font-semibold text-[#44403C]">Direct Instrument Link</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-[#F8F7F4] border border-[#E7E5E4] text-xs font-mono text-[#57534E] select-all focus:outline-hidden"
                />
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className={`h-11 px-4 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                    copied
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-[#0F0F12] text-white hover:bg-[#27272A]"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-white" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

