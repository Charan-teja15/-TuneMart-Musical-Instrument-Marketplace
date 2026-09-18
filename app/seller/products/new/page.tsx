"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockCategories } from "@/lib/mock-data"
import { Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.string().min(1, "Category required"),
  brand: z.string().min(1, "Brand required"),
  model: z.string().min(1, "Model required"),
  price: z.coerce.number().min(100, "Price too low"),
  condition: z.enum(["new", "used", "refurbished"]),
  quantity: z.coerce.number().min(1),
  location: z.string().min(2),
  description: z.string().min(20, "Description too short"),
})

type FormData = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])
  const [isUsed, setIsUsed] = useState(false)
  const [conditionReport, setConditionReport] = useState({
    overall: "good",
    body: "good",
    neck: "good",
    strings: "good",
    electronics: "good",
    cosmetic: "good",
    damageDetails: "",
  })

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { condition: "new", quantity: 1 } as any
  })

  const condition = watch("condition")

  const onSubmit = (data: any) => {
    console.log(data, images, conditionReport)
    alert("Product created successfully! (Mock - would save to Supabase)")
    router.push("/seller/products")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file)
      setImages(prev => [...prev, url])
    })
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-[22px] font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input {...register("name")} placeholder="Fender Stratocaster..." className="mt-1" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select {...register("category")} className="mt-1">
                  <option value="">Select category</option>
                  {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </Select>
                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <Label>Condition *</Label>
                <Select {...register("condition")} onChange={(e) => { setValue("condition", e.target.value as any); setIsUsed(e.target.value === "used") }} className="mt-1">
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </Select>
              </div>
              <div>
                <Label>Brand *</Label>
                <Input {...register("brand")} placeholder="Fender" className="mt-1" />
                {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>}
              </div>
              <div>
                <Label>Model *</Label>
                <Input {...register("model")} placeholder="American Pro II" className="mt-1" />
                {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>}
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" {...register("price")} placeholder="125000" className="mt-1" />
                {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input type="number" {...register("quantity")} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Location *</Label>
                <Input {...register("location")} placeholder="Mumbai, MH" className="mt-1" />
                {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-[#E7E5E4] rounded-[20px] p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-[#A8A29E]" />
              <p className="text-sm font-medium">Upload product images</p>
              <p className="text-xs text-[#78716C] mt-1">PNG, JPG up to 5MB each • Max 8 images</p>
              <Input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mt-4 max-w-xs mx-auto" />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-[#F8F7F4] border border-[#E7E5E4]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {(isUsed || condition === "used") && (
          <Card className="rounded-[20px] border-amber-200 bg-amber-50/50">
            <CardHeader><CardTitle className="text-base">Used Instrument Condition Report *</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {["overall", "body", "neck", "strings", "electronics", "cosmetic"].map(field => (
                  <div key={field}>
                    <Label className="capitalize">{field} Condition</Label>
                    <Select value={(conditionReport as any)[field]} onChange={(e) => setConditionReport({ ...conditionReport, [field]: e.target.value })} className="mt-1">
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </Select>
                  </div>
                ))}
              </div>
              <div>
                <Label>Damage Details</Label>
                <Textarea value={conditionReport.damageDetails} onChange={(e) => setConditionReport({ ...conditionReport, damageDetails: e.target.value })} placeholder="Describe any damage, scratches, mods..." className="mt-1" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[20px]">
          <CardHeader><CardTitle className="text-base">Description & Specs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Description *</Label>
              <Textarea {...register("description")} placeholder="Detailed description..." className="mt-1 min-h-[120px]" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Body Material</Label><Input placeholder="Alder" className="mt-1" /></div>
              <div><Label>Neck Material</Label><Input placeholder="Maple" className="mt-1" /></div>
              <div><Label>Weight</Label><Input placeholder="3.6 kg" className="mt-1" /></div>
              <div><Label>Year</Label><Input placeholder="2023" className="mt-1" /></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" className="flex-1 h-12">Publish Product</Button>
          <Button type="button" variant="outline" size="lg" className="h-12" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
