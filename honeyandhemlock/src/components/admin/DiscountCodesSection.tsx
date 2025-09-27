import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Tag } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  usageCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const DiscountCodesSection: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([
    {
      id: '1',
      code: 'LAUNCH2024',
      percentage: 20,
      usageCount: 5,
      maxUses: 100,
      expiresAt: '2024-12-31',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      code: 'EARLY50',
      percentage: 50,
      usageCount: 2,
      maxUses: 10,
      expiresAt: '2024-10-31',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      code: 'FRIEND10',
      percentage: 10,
      usageCount: 15,
      maxUses: null,
      expiresAt: null,
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      code: 'HONEY25',
      percentage: 25,
      usageCount: 8,
      maxUses: 50,
      expiresAt: '2024-11-30',
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    percentage: 10,
    maxUses: '',
    expiresAt: ''
  });

  const { toast } = useToast();

  const handleAddCode = () => {
    if (!newCode.code || newCode.percentage <= 0 || newCode.percentage > 100) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid code and percentage (1-100)",
        variant: "destructive"
      });
      return;
    }

    const newDiscountCode: DiscountCode = {
      id: Date.now().toString(),
      code: newCode.code.toUpperCase(),
      percentage: newCode.percentage,
      usageCount: 0,
      maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : null,
      expiresAt: newCode.expiresAt || null,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDiscountCodes([...discountCodes, newDiscountCode]);
    setNewCode({ code: '', percentage: 10, maxUses: '', expiresAt: '' });
    setIsAddDialogOpen(false);

    toast({
      title: "Code Created",
      description: `Discount code ${newDiscountCode.code} has been created successfully.`,
    });
  };

  const handleToggleStatus = (id: string) => {
    setDiscountCodes(codes =>
      codes.map(code =>
        code.id === id ? { ...code, isActive: !code.isActive } : code
      )
    );

    const code = discountCodes.find(c => c.id === id);
    toast({
      title: code?.isActive ? "Code Deactivated" : "Code Activated",
      description: `${code?.code} has been ${code?.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const handleDeleteCode = (id: string) => {
    const code = discountCodes.find(c => c.id === id);
    setDiscountCodes(codes => codes.filter(c => c.id !== id));

    toast({
      title: "Code Deleted",
      description: `Discount code ${code?.code} has been deleted.`,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Code ${code} copied to clipboard.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#282828] border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-portfolio-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FFD62F]" />
            Discount Codes
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[#FFD62F] text-black hover:bg-[#FFD62F]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Code
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#282828] border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-portfolio-white">Create New Discount Code</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new discount code for script submissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-portfolio-white">Code</Label>
                  <Input
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                    placeholder="e.g., SUMMER20"
                    className="bg-portfolio-black border-gray-600 text-portfolio-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-portfolio-white">Discount Percentage</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newCode.percentage}
                    onChange={(e) => setNewCode({ ...newCode, percentage: parseInt(e.target.value) || 0 })}
                    className="bg-portfolio-black border-gray-600 text-portfolio-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-portfolio-white">Max Uses (Optional)</Label>
                  <Input
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="bg-portfolio-black border-gray-600 text-portfolio-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-portfolio-white">Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={newCode.expiresAt}
                    onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                    className="bg-portfolio-black border-gray-600 text-portfolio-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCode}
                  className="bg-[#FFD62F] text-black hover:bg-[#FFD62F]/90"
                >
                  Create Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-[#323232]">
                <TableHead className="text-gray-400">Code</TableHead>
                <TableHead className="text-gray-400">Discount</TableHead>
                <TableHead className="text-gray-400">Usage</TableHead>
                <TableHead className="text-gray-400">Expires</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map((code) => (
                <TableRow key={code.id} className="border-gray-700 hover:bg-[#323232]">
                  <TableCell className="font-mono text-portfolio-white">
                    <div className="flex items-center gap-2">
                      {code.code}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyCode(code.code)}
                        className="h-6 w-6 p-0 hover:bg-gray-700"
                      >
                        <Copy className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-portfolio-white">{code.percentage}%</TableCell>
                  <TableCell className="text-portfolio-white">
                    {code.usageCount} {code.maxUses ? `/ ${code.maxUses}` : ''}
                  </TableCell>
                  <TableCell className="text-portfolio-white">
                    {code.expiresAt || 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={code.isActive ? "default" : "secondary"}
                      className={code.isActive ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-300"}
                    >
                      {code.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(code.id)}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700"
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCode(code.id)}
                        className="bg-red-900/20 text-red-400 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountCodesSection;