import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, PackagePlus } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { AuthContext } from "../contexts/AuthContext";

const categories = [
	"Safety Equipment",
	"Solar Equipment",
	"Company Assets",
	"Office Supplies",
];

export const AddStockForm = ({ onStockAdded }) => {
	const { toast } = useToast();
	const { user } = useContext(AuthContext) || {};
	const [newItem, setNewItem] = useState({
		itemName: "",
		itemCode: "",
		quantity: "",
		unit: "pcs",
		reorderLevel: "",
		category: "",
		unitPrice: "",
		notes: "",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewItem((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name, value) => {
		setNewItem((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!newItem.itemName || !newItem.quantity || !newItem.category) {
			toast({
				title: "Validation Error",
				description:
					"Please fill in all required fields: Item Name, Quantity, and Category.",
				variant: "destructive",
			});
			return;
		}

			const newStockItem = {
			...newItem,
			quantity: parseInt(newItem.quantity, 10),
			reorderLevel: parseInt(newItem.reorderLevel, 10) || 0,
			unitPrice: parseFloat(newItem.unitPrice) || 0,
			createdAt: Timestamp.now(),
				receivingDate: Timestamp.now(),
			receivedBy: user?.id || "",
			companyId: user?.companyId || "",
		};

		try {
				const docRef = await addDoc(collection(db, "solar_warehouse"), newStockItem);
				onStockAdded({ id: docRef.id, ...newStockItem });
			toast({
				title: "Stock Added Successfully",
				description: `${newItem.itemName} has been added to the inventory and synced to the database.`,
				className: "bg-green-500 text-white",
			});
			setNewItem({
				itemName: "",
				itemCode: "",
				quantity: "",
				unit: "pcs",
				reorderLevel: "",
				category: "",
				unitPrice: "",
				notes: "",
			});
		} catch (err) {
			toast({
				title: "Database Error",
				description: "Failed to add item to Firestore. Please try again.",
				variant: "destructive",
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<PackagePlus className="h-5 w-5" />
					<span>Add New Stock / Equipment</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					{/* Column 1 */}
					<div className="space-y-4">
						<div>
							<Label htmlFor="itemName">
								Item Name{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="itemName"
								name="itemName"
								value={newItem.itemName}
								onChange={handleInputChange}
								placeholder="e.g., Hard Hats"
								required
							/>
						</div>
						<div>
							<Label htmlFor="itemCode">Item Code / SKU</Label>
							<Input
								id="itemCode"
								name="itemCode"
								value={newItem.itemCode}
								onChange={handleInputChange}
								placeholder="e.g., HH001"
							/>
						</div>
						<div>
							<Label htmlFor="category">
								Category{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select
								name="category"
								onValueChange={(value) =>
									handleSelectChange("category", value)
								}
								value={newItem.category}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Column 2 */}
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="quantity">
									Quantity{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="quantity"
									name="quantity"
									type="number"
									value={newItem.quantity}
									onChange={handleInputChange}
									placeholder="e.g., 100"
									required
								/>
							</div>
							<div>
								<Label htmlFor="unit">Unit</Label>
								<Input
									id="unit"
									name="unit"
									value={newItem.unit}
									onChange={handleInputChange}
									placeholder="e.g., pcs, rolls"
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="reorderLevel">Re-order Level</Label>
								<Input
									id="reorderLevel"
									name="reorderLevel"
									type="number"
									value={newItem.reorderLevel}
									onChange={handleInputChange}
									placeholder="e.g., 20"
								/>
							</div>
							<div>
								<Label htmlFor="unitPrice">Unit Price (KES)</Label>
								<Input
									id="unitPrice"
									name="unitPrice"
									type="number"
									value={newItem.unitPrice}
									onChange={handleInputChange}
									placeholder="e.g., 1500"
								/>
							</div>
						</div>
					</div>

					{/* Full-width Notes */}
					<div className="md:col-span-2">
						<Label htmlFor="notes">Notes / Description</Label>
						<Textarea
							id="notes"
							name="notes"
							value={newItem.notes}
							onChange={handleInputChange}
							placeholder="Add any relevant details..."
						/>
					</div>

					{/* Submit Button */}
					<div className="md:col-span-2 flex justify-end">
						<Button type="submit" className="w-full md:w-auto">
							<PlusCircle className="h-4 w-4 mr-2" />
							Add Item to Inventory
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
