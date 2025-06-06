"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, RefreshCw, Pencil, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Định nghĩa schema cho form
const timeSlotConfigFormSchema = z.object({
  slotDurationMinutes: z.number().min(5, "Thời lượng tối thiểu là 5 phút").max(240, "Thời lượng tối đa là 240 phút"),
  startTimeFirstSlot: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  endTimeLastSlot: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
  maxSlotsPerDay: z.number().min(1, "Số lượng slot tối thiểu là 1"),
  effectiveFrom: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  effectiveTo: z.string().optional(),
});

type TimeSlotConfigFormValues = z.infer<typeof timeSlotConfigFormSchema>;

// Interface cho dữ liệu cấu hình khung giờ
interface TimeSlotConfig {
  id: number;
  slotDurationMinutes: number;
  startTimeFirstSlot: string;
  endTimeLastSlot: string;
  maxSlotsPerDay: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    id: number;
    email: string;
    fullName: string;
  } | null;
}

export default function ConfigTimeSlots() {
  const [timeSlotConfigs, setTimeSlotConfigs] = useState<TimeSlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<TimeSlotConfig | null>(null);

  // Form cho thêm mới
  const addForm = useForm<TimeSlotConfigFormValues>({
    resolver: zodResolver(timeSlotConfigFormSchema),
    defaultValues: {
      slotDurationMinutes: 60,
      startTimeFirstSlot: "08:00",
      endTimeLastSlot: "22:00",
      maxSlotsPerDay: 14,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: "",
    },
  });

  // Form cho chỉnh sửa
  const editForm = useForm<TimeSlotConfigFormValues>({
    resolver: zodResolver(timeSlotConfigFormSchema),
    defaultValues: {
      slotDurationMinutes: 60,
      startTimeFirstSlot: "08:00",
      endTimeLastSlot: "22:00",
      maxSlotsPerDay: 14,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: "",
    },
  });

  // Hàm lấy danh sách cấu hình khung giờ
  const fetchTimeSlotConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/price-config/timeslot-configs");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setTimeSlotConfigs(data);
    } catch (error) {
      console.error("Error fetching time slot configurations:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách cấu hình khung giờ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchTimeSlotConfigs();
  }, []);

  // Xử lý thêm mới cấu hình khung giờ
  const handleAddTimeSlotConfig = async (values: TimeSlotConfigFormValues) => {
    try {
      const formData = new FormData();
      formData.append("slotDurationMinutes", values.slotDurationMinutes.toString());
      formData.append("startTimeFirstSlot", values.startTimeFirstSlot);
      formData.append("endTimeLastSlot", values.endTimeLastSlot);
      formData.append("maxSlotsPerDay", values.maxSlotsPerDay.toString());
      formData.append("effectiveFrom", values.effectiveFrom);
      if (values.effectiveTo) {
        formData.append("effectiveTo", values.effectiveTo);
      }

      const response = await fetch("/api/admin/price-config/timeslot-configs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã thêm cấu hình khung giờ mới",
      });

      setIsAddDialogOpen(false);
      addForm.reset();
      fetchTimeSlotConfigs();
    } catch (error) {
      console.error("Error adding time slot configuration:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm cấu hình khung giờ",
        variant: "destructive",
      });
    }
  };

  // Xử lý cập nhật cấu hình khung giờ
  const handleEditTimeSlotConfig = async (values: TimeSlotConfigFormValues) => {
    if (!currentConfig) return;

    try {
      const formData = new FormData();
      formData.append("slotDurationMinutes", values.slotDurationMinutes.toString());
      formData.append("startTimeFirstSlot", values.startTimeFirstSlot);
      formData.append("endTimeLastSlot", values.endTimeLastSlot);
      formData.append("maxSlotsPerDay", values.maxSlotsPerDay.toString());
      formData.append("effectiveFrom", values.effectiveFrom);
      if (values.effectiveTo) {
        formData.append("effectiveTo", values.effectiveTo);
      }

      const response = await fetch(`/api/admin/price-config/timeslot-configs/${currentConfig.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật cấu hình khung giờ",
      });

      setIsEditDialogOpen(false);
      setCurrentConfig(null);
      fetchTimeSlotConfigs();
    } catch (error) {
      console.error("Error updating time slot configuration:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cấu hình khung giờ",
        variant: "destructive",
      });
    }
  };

  // Xử lý vô hiệu hóa cấu hình khung giờ
  const handleDeactivateTimeSlotConfig = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa cấu hình khung giờ này không?")) return;

    try {
      const response = await fetch(`/api/admin/price-config/timeslot-configs/${id}/deactivate`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã vô hiệu hóa cấu hình khung giờ",
      });

      fetchTimeSlotConfigs();
    } catch (error) {
      console.error("Error deactivating time slot configuration:", error);
      toast({
        title: "Lỗi",
        description: "Không thể vô hiệu hóa cấu hình khung giờ",
        variant: "destructive",
      });
    }
  };

  // Mở dialog chỉnh sửa và điền dữ liệu
  const openEditDialog = (config: TimeSlotConfig) => {
    setCurrentConfig(config);
    editForm.setValue("slotDurationMinutes", config.slotDurationMinutes);
    editForm.setValue("startTimeFirstSlot", config.startTimeFirstSlot);
    editForm.setValue("endTimeLastSlot", config.endTimeLastSlot);
    editForm.setValue("maxSlotsPerDay", config.maxSlotsPerDay);
    editForm.setValue("effectiveFrom", config.effectiveFrom);
    editForm.setValue("effectiveTo", config.effectiveTo || "");
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cấu hình khung giờ</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchTimeSlotConfigs}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Làm mới
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm cấu hình
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm cấu hình khung giờ mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin cấu hình khung giờ mới
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(handleAddTimeSlotConfig)}
                  className="space-y-4"
                >
                  <FormField
                    control={addForm.control}
                    name="slotDurationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời lượng mỗi slot (phút)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Nhập thời lượng" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="startTimeFirstSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ bắt đầu</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="endTimeLastSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giờ kết thúc</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="maxSlotsPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng slot tối đa mỗi ngày</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Nhập số lượng slot" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="effectiveFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu hiệu lực</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="effectiveTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc hiệu lực (tùy chọn)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Để trống nếu không có ngày kết thúc
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="submit">Lưu</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : timeSlotConfigs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Chưa có cấu hình khung giờ nào. Hãy thêm cấu hình mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {timeSlotConfigs.map((config) => (
            <Card key={config.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Cấu hình #{config.id}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Cập nhật lúc:{" "}
                      {new Date(config.updatedAt).toLocaleString("vi-VN")}
                      {config.updatedBy && (
                        <span> bởi {config.updatedBy.fullName}</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={config.isActive ? "default" : "secondary"}>
                    {config.isActive ? "Đang hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Thời lượng mỗi slot:</Label>
                    <p className="text-sm font-medium">
                      {config.slotDurationMinutes} phút
                    </p>
                  </div>
                  <div>
                    <Label>Số lượng slot tối đa:</Label>
                    <p className="text-sm font-medium">
                      {config.maxSlotsPerDay}
                    </p>
                  </div>
                  <div>
                    <Label>Giờ bắt đầu:</Label>
                    <p className="text-sm font-medium">
                      {config.startTimeFirstSlot}
                    </p>
                  </div>
                  <div>
                    <Label>Giờ kết thúc:</Label>
                    <p className="text-sm font-medium">
                      {config.endTimeLastSlot}
                    </p>
                  </div>
                  <div>
                    <Label>Ngày bắt đầu hiệu lực:</Label>
                    <p className="text-sm font-medium">
                      {new Date(config.effectiveFrom).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <Label>Ngày kết thúc hiệu lực:</Label>
                    <p className="text-sm font-medium">
                      {config.effectiveTo
                        ? new Date(config.effectiveTo).toLocaleDateString("vi-VN")
                        : "Không giới hạn"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(config)}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Sửa
                </Button>
                {config.isActive && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeactivateTimeSlotConfig(config.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Vô hiệu hóa
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog chỉnh sửa */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cấu hình khung giờ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho cấu hình #{currentConfig?.id}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditTimeSlotConfig)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="slotDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng mỗi slot (phút)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Nhập thời lượng" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="startTimeFirstSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="endTimeLastSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ kết thúc</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="maxSlotsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng slot tối đa mỗi ngày</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Nhập số lượng slot" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu hiệu lực</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="effectiveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc hiệu lực (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Để trống nếu không có ngày kết thúc
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 