import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { MaterialFormModal } from '../modals/MaterialFormModal';
import { Material } from '../WarehouseContext';

export function MaterialCreationSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Material['category']>('safety');

  const categories = [
    { id: 'safety', label: 'Safety Equipment', description: 'Personal protective equipment and safety gear' },
    { id: 'ftth', label: 'FTTH Equipment', description: 'Fiber-to-the-home installation equipment' },
    { id: 'fttx', label: 'FTTX Components', description: 'Fiber-to-the-x network components' },
    { id: 'company-assets', label: 'Company Assets', description: 'Laptops, tools, and company equipment' },
  ] as const;

  const handleAddMaterial = (category: Material['category']) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Material Creation</h2>
        <p className="text-muted-foreground">Add new materials and equipment to your inventory</p>
      </div>

      <Tabs defaultValue="safety" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add {category.label}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the button below to add new {category.label.toLowerCase()} to your inventory.
                  </p>
                  <Button onClick={() => handleAddMaterial(category.id)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New {category.label}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
}