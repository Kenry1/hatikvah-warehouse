import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PackageMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface IssueStockPayload {
  materialId: string;
  siteName: string;
  requestedBy: string;
  quantity: number;
  notes?: string;
}

interface IssueStockFormProps {
  materials: Array<{ id: string; itemName?: string; itemCode?: string; unit?: string; quantity?: number }>;
  onIssue: (payload: IssueStockPayload) => Promise<void> | void;
}

export const IssueStockForm = ({ materials, onIssue }: IssueStockFormProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ materialId: "", siteName: "", requestedBy: "", quantity: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const options = useMemo(() => materials.map(m => ({
    id: m.id,
    label: `${m.itemName || "Unnamed"}${m.itemCode ? ` (${m.itemCode})` : ""}`,
    quantity: m.quantity || 0,
    unit: m.unit || "",
  })), [materials]);

  const selected = options.find(o => o.id === form.materialId);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materialId || !form.siteName || !form.requestedBy || !form.quantity) {
      toast({ title: "Missing fields", description: "Please fill material, site, requested by and quantity.", variant: "destructive" });
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast({ title: "Invalid quantity", description: "Enter a positive number.", variant: "destructive" });
      return;
    }
    if (selected && qty > selected.quantity) {
      toast({ title: "Insufficient stock", description: `Only ${selected.quantity} ${selected.unit || ""} available.`, variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await onIssue({ materialId: form.materialId, siteName: form.siteName, requestedBy: form.requestedBy, quantity: qty, notes: form.notes || undefined });
      toast({ title: "Issued", description: "Stock issued successfully.", className: "bg-green-500 text-white" });
      setForm({ materialId: "", siteName: "", requestedBy: "", quantity: "", notes: "" });
    } catch (e) {
      toast({ title: "Failed to issue", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageMinus className="h-5 w-5" />
          <span>Issue Stock / Equipment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Material</Label>
              <Select value={form.materialId} onValueChange={(v) => setForm(prev => ({ ...prev, materialId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {options.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && (
                <p className="text-xs text-muted-foreground mt-1">Available: {selected.quantity} {selected.unit}</p>
              )}
            </div>
            <div>
              <Label>Site Name</Label>
              <Input name="siteName" value={form.siteName} onChange={onChange} placeholder="e.g., Solar Farm A" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Requested By</Label>
              <Input name="requestedBy" value={form.requestedBy} onChange={onChange} placeholder="Person requesting" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input name="quantity" type="number" value={form.quantity} onChange={onChange} placeholder="e.g., 5" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={submitting}>
                  Issue
                </Button>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea name="notes" value={form.notes} onChange={onChange} placeholder="Optional notes" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
