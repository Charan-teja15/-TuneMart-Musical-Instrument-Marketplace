"use client"
import { useState, useEffect } from "react"
import { mockSellers, mockProducts } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, MessageCircle } from "lucide-react"

interface Msg { id: string; from: string; text: string; time: string }

export default function MessagesPage() {
  const [conversations] = useState([
    { id: "1", seller: mockSellers[0], product: mockProducts[0], last: "Is this still available?", unread: 2 },
    { id: "2", seller: mockSellers[1], product: mockProducts[1], last: "Can you share more photos?", unread: 0 },
  ])
  const [selected, setSelected] = useState(conversations[0])
  const [messages, setMessages] = useState<Msg[]>([
    { id: "1", from: "them", text: "Hi, is the Fender Strat still available?", time: "10:30 AM" },
    { id: "2", from: "me", text: "Yes, it's available! Mint condition.", time: "10:32 AM" },
    { id: "3", from: "them", text: "Is this still available?", time: "10:35 AM" },
  ])
  const [input, setInput] = useState("")

  const send = () => {
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now().toString(), from: "me", text: input, time: new Date().toLocaleTimeString() }])
    setInput("")
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Messages</h1>
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 h-[70vh]">
        <Card className="rounded-[20px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E7E5E4] font-semibold">Conversations</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <button key={c.id} onClick={() => setSelected(c)} className={`w-full text-left p-4 border-b border-[#F5F5F4] hover:bg-[#F8F7F4] flex gap-3 ${selected.id === c.id ? "bg-[#F3F1EB]" : ""}`}>
                <img src={c.seller.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{c.seller.shopName}</div>
                  <div className="text-xs text-[#78716C] truncate">{c.product.name}</div>
                  <div className="text-xs mt-1 truncate">{c.last}</div>
                </div>
                {c.unread > 0 && <div className="h-5 w-5 rounded-full bg-[#FF6B00] text-white text-[10px] flex items-center justify-center">{c.unread}</div>}
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center text-sm text-[#78716C]">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-[#A8A29E]" />
                No messages yet
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-[20px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E7E5E4] flex items-center gap-3">
            <img src={selected.seller.avatar} alt="" className="h-8 w-8 rounded-full" />
            <div>
              <div className="font-medium text-sm">{selected.seller.shopName}</div>
              <div className="text-xs text-[#78716C]">{selected.product.name}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFCF8]">
            {messages.map(m => (
              <div key={m.id} className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "ml-auto bg-[#0F0F12] text-white rounded-br-sm" : "bg-white border border-[#E7E5E4] rounded-bl-sm"}`}>
                {m.text}
                <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-white/60" : "text-[#A8A29E]"}`}>{m.time}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#E7E5E4] flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && send()} />
            <Button size="icon" onClick={send} className="rounded-full"><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
