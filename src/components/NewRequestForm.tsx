import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Package, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { sites } from "../lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
// (already imported above)
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, runTransaction, doc } from "firebase/firestore";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const formSchema = z.object({
  siteName: z.string().min(1, "Please enter a site name"),
  siteId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
  items: z.array(z.object({
    materialId: z.string().min(1, "Please select a material"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })).min(1, "Please add at least one item"),
});

interface NewRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRequestForm({ open, onOpenChange }: NewRequestFormProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<Array<{ materialId: string; quantity: string }>>([
    { materialId: "", quantity: "" }
  ]);
  const [siteSearchOpen, setSiteSearchOpen] = useState(false);
  const [siteSearchValue, setSiteSearchValue] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [allSites, setAllSites] = useState<string[]>([]);
  const { user } = useContext(AuthContext) || {};

  useEffect(() => {
    async function fetchMaterialsAndStock() {
      // Fetch all materials from Firestore solar_warehouse
      const snapshot = await getDocs(collection(db, "solar_warehouse"));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllMaterials(items);
      setStockLevels(items);
    }
    fetchMaterialsAndStock();
    async function fetchSitesFromRequests() {
      try {
        const snapshot = await getDocs(collection(db, "material_requests"));
        // Get unique site names from requests
        const siteNames = Array.from(new Set(snapshot.docs.map(doc => doc.data().siteName).filter(Boolean)));
        setAllSites(siteNames);
      } catch (err) {
        console.error("Error fetching site names from material_requests:", err);
      }
    }
    fetchSitesFromRequests();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: "",
      siteId: "",
      priority: "medium",
      notes: "",
  items: [{ materialId: "", quantity: "" }],
    },
  });

  const addItem = () => {
  const newItems = [...items, { materialId: "", quantity: "" }];
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue('items', newItems);
    }
  };

  const updateItem = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], quantity: String(value) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
    // Convert quantity to number for form value
    form.setValue('items', newItems.map(i => ({ ...i, quantity: i.quantity === "" ? 0 : Number(i.quantity) })));
  };

  const getAvailableStock = (materialId: string) => {
  const stock = stockLevels.find(s => s.id === materialId);
  // Prefer availableQuantity; fall back to quantity for legacy docs
  return stock ? (stock.availableQuantity ?? stock.quantity ?? 0) : 0;
  };

  const getMaterialInfo = (materialId: string) => {
    return allMaterials.find(m => m.id === materialId);
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => {
      const material = getMaterialInfo(item.materialId);
      return total + (material ? material.unitPrice * item.quantity : 0);
    }, 0);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent submission if any requested quantity exceeds available stock
    const exceedsStock = values.items.some(item => {
      const available = getAvailableStock(item.materialId);
      return item.quantity > available;
    });
    if (exceedsStock) {
      toast({
        title: "Stock Error",
        description: "Requested quantity exceeds available stock for one or more items.",
        variant: "destructive",
      });
      return;
    }
    // Check if site exists in allSites (from Firestore, all users)
    const existingSite = allSites.find(s => 
  s.toLowerCase() === values.siteName.toLowerCase()
    );
    let siteInfo;
    if (existingSite) {
      siteInfo = {
        id: `site-${Date.now()}`,
        name: existingSite,
        location: "Location TBD",
        contactPerson: "Contact TBD",
        phone: "Phone TBD",
        active: true
      };
      console.log("Appending request to existing site:", existingSite);
    } else {
      // Create new site
      siteInfo = {
        id: `site-${Date.now()}`,
        name: values.siteName,
        location: values.siteId || "Location TBD",
        contactPerson: "Contact TBD",
        phone: "Phone TBD",
        active: true
      };
      console.log("Creating new site:", siteInfo);
    }
    const newRequest = {
      ...values,
      siteId: siteInfo.id,
      siteName: siteInfo.name,
      createdAt: new Date().toISOString(),
      requestedBy: user?.id || "",
      requestedByUsername: user?.username || "",
      requestorRole: user?.role || "",
      status: "pending" as const,
      approver: "", // to be filled when approved
      approverRole: "", // to be filled when approved
      requestDate: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "material_requests"), newRequest);
      // Deduct requested quantities from solar_warehouse inventory using Firestore transactions
      // Firestore requires that all reads inside a transaction are completed before any writes.
      // First perform all reads, then perform updates.
      await runTransaction(db, async (transaction) => {
        const refs = values.items.map((item) => doc(db, "solar_warehouse", item.materialId));
        // Read all documents first
        const snaps = await Promise.all(refs.map((ref) => transaction.get(ref)));

        // Validate existence
        snaps.forEach((materialDocSnap, idx) => {
          if (!materialDocSnap.exists()) {
            throw new Error(`Material with ID ${values.items[idx].materialId} does not exist.`);
          }
        });

        // Now perform updates
        snaps.forEach((materialDocSnap, idx) => {
          const item = values.items[idx];
          const data = materialDocSnap.data();
          const currentQty = (data.availableQuantity ?? data.quantity ?? data.available ?? 0) as number;
          const newQty = Math.max(currentQty - item.quantity, 0);
          const ref = refs[idx];

          // Update the most relevant field(s) present in the document so UI remains consistent.
          const updatePayload: any = {};
          if (Object.prototype.hasOwnProperty.call(data, 'availableQuantity')) {
            updatePayload.availableQuantity = newQty;
          }
          if (Object.prototype.hasOwnProperty.call(data, 'quantity')) {
            updatePayload.quantity = newQty;
          }
          // Fallback: write availableQuantity if neither field exists
          if (Object.keys(updatePayload).length === 0) {
            updatePayload.availableQuantity = newQty;
          }

          transaction.update(ref, updatePayload);
        });
      });
      toast({
        title: existingSite ? "Request Added to Existing Site" : "New Site & Request Created",
        description: `Request for ${siteInfo.name} has been submitted successfully and saved to Firestore. Inventory updated atomically.`,
      });
      // Reset form
      form.reset();
      setItems([{ materialId: "", quantity: 1 }]);
      setSiteSearchValue("");
      setSelectedSite("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Firestore Error",
        description: `Failed to save request: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleSiteSelect = (siteName: string, siteLocation?: string) => {
    setSiteSearchValue(siteName);
    setSelectedSite(siteName);
    setSiteSearchOpen(false);
    // Update form values
    form.setValue("siteName", siteName);
    if (siteLocation) {
      form.setValue("siteId", siteLocation);
    }
  };

  const filteredSites = allSites.filter(site =>
    site.toLowerCase().includes(siteSearchValue.toLowerCase())
  );

  // Filter materials by selected category and sort alphabetically
  const filteredMaterials = allMaterials
    .filter(m => selectedCategory ? m.category === selectedCategory : true)
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Material Request</DialogTitle>
          <DialogDescription>
            Submit a new material request for a construction site.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Site Name</FormLabel>
                    <Popover open={siteSearchOpen} onOpenChange={setSiteSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={siteSearchOpen}
                            className="justify-between font-normal"
                          >
                            {siteSearchValue || "Type to search or create new site..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Type site name..." 
                            value={siteSearchValue}
                            onValueChange={(value) => {
                              setSiteSearchValue(value);
                              field.onChange(value);
                            }}
                          />
                          <CommandList>
                            {filteredSites.length > 0 ? (
                              <CommandGroup heading="Existing Sites">
                                {filteredSites.map((site) => (
                                  <CommandItem
                                    key={site}
                                    value={site}
                                    onSelect={() => {
                                      handleSiteSelect(site);
                                      field.onChange(site);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center">
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedSite === site ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <div>
                                          <div className="font-medium">{site}</div>
                                        </div>
                                      </div>
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            ) : siteSearchValue ? (
                              <CommandEmpty>
                                <div className="p-4 text-center">
                                  <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                  <p className="font-medium">Create new site "{siteSearchValue}"</p>
                                  <p className="text-sm text-muted-foreground">This will create a new site entry</p>
                                  <Button
                                    className="mt-2"
                                    onClick={() => {
                                      handleSiteSelect(siteSearchValue);
                                    }}
                                    size="sm"
                                  >
                                    Create Site
                                  </Button>
                                </div>
                              </CommandEmpty>
                            ) : (
                              <CommandEmpty>
                                Type to search existing sites or create a new one...
                              </CommandEmpty>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Type to search existing sites or create a new one
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {siteSearchValue && !allSites.find(s => s.toLowerCase() === siteSearchValue.toLowerCase()) && (
                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter Site ID..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the site
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Requested Materials</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Item {index + 1}</span>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        onValueChange={value => setSelectedCategory(value)}
                        value={selectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...new Set(allMaterials.map(m => String(m.category)))].sort().map((cat: string) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Material</label>
                      <Select
                        onValueChange={(value) => updateItem(index, 'materialId', value)}
                        value={item.materialId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredMaterials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.itemName} - {material.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Quantity</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                      />
                    </div>
                  </div>

                  {item.materialId && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>Available stock:</span>
                        <Badge variant={getAvailableStock(item.materialId) >= item.quantity ? "default" : "destructive"}>
                          {getAvailableStock(item.materialId)} {getMaterialInfo(item.materialId)?.unit}
                        </Badge>
                      </div>
                      <div className="font-medium">
                        KSh {((getMaterialInfo(item.materialId)?.unitPrice || 0) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or special requirements..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Estimated Cost:</span>
                <span>KSh {calculateTotalCost().toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
