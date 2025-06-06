"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";

// Định nghĩa schema cho form
const holidayFormSchema = z.object({
  date: z.string().min(1, "Vui lòng chọn ngày"),
  holidayName: z.string().min(1, "Vui lòng nhập tên ngày lễ"),
  description: z.string().optional(),
  isRecurringYearly: z.boolean().default(false),
});

type HolidayFormValues = z.infer<typeof holidayFormSchema>;

// Interface cho dữ liệu ngày lễ
interface HolidayDate {
  id: number;
  date: string;
  holidayName: string;
  description: string | null;
  isRecurringYearly: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    id: number;
    email: string;
    fullName: string;
  } | null;
}

export default function ConfigHolidays() {
  const [holidays, setHolidays] = useState<HolidayDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<HolidayDate | null>(null);

  // Form cho thêm mới
  const addForm = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      holidayName: "",
      description: "",
      isRecurringYearly: false,
    },
  });

  // Form cho chỉnh sửa
  const editForm = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      holidayName: "",
      description: "",
      isRecurringYearly: false,
    },
  });

  // Hàm lấy danh sách ngày lễ
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/price-config/holidays");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ngày lễ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchHolidays();
  }, []);

  // Xử lý thêm mới ngày lễ
  const handleAddHoliday = async (values: HolidayFormValues) => {
    try {
      const formData = new FormData();
      formData.append("date", values.date);
      formData.append("holidayName", values.holidayName);
      if (values.description) {
        formData.append("description", values.description);
      }
      formData.append("isRecurringYearly", values.isRecurringYearly.toString());

      const response = await fetch("/api/admin/price-config/holidays", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã thêm ngày lễ mới",
      });

      setIsAddDialogOpen(false);
      addForm.reset();
      fetchHolidays();
    } catch (error) {
      console.error("Error adding holiday:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm ngày lễ",
        variant: "destructive",
      });
    }
  };

  // Xử lý cập nhật ngày lễ
  const handleEditHoliday = async (values: HolidayFormValues) => {
    if (!currentHoliday) return;

    try {
      const formData = new FormData();
      formData.append("holidayName", values.holidayName);
      if (values.description) {
        formData.append("description", values.description);
      }
      formData.append("isRecurringYearly", values.isRecurringYearly.toString());

      const response = await fetch(`/api/admin/price-config/holidays/${currentHoliday.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật ngày lễ",
      });

      setIsEditDialogOpen(false);
      setCurrentHoliday(null);
      fetchHolidays();
    } catch (error) {
      console.error("Error updating holiday:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật ngày lễ",
        variant: "destructive",
      });
    }
  };

  // Xử lý xóa ngày lễ
  const handleDeleteHoliday = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ngày lễ này không?")) return;

    try {
      const response = await fetch(`/api/admin/price-config/holidays/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã xóa ngày lễ",
      });

      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa ngày lễ",
        variant: "destructive",
      });
    }
  };

  // Mở dialog chỉnh sửa và điền dữ liệu
  const openEditDialog = (holiday: HolidayDate) => {
    setCurrentHoliday(holiday);
    editForm.setValue("date", holiday.date);
    editForm.setValue("holidayName", holiday.holidayName);
    editForm.setValue("description", holiday.description || "");
    editForm.setValue("isRecurringYearly", holiday.isRecurringYearly);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Quản lý ngày lễ</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchHolidays}
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
                Thêm ngày lễ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm ngày lễ mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin ngày lễ mới
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(handleAddHoliday)}
                  className="space-y-4"
                >
                  <FormField
                    control={addForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="holidayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên ngày lễ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên ngày lễ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập mô tả cho ngày lễ này"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="isRecurringYearly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Lặp lại hàng năm</FormLabel>
                          <FormDescription>
                            Ngày lễ này sẽ được lặp lại vào cùng ngày hàng năm
                          </FormDescription>
                        </div>
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
      ) : holidays.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Chưa có ngày lễ nào. Hãy thêm ngày lễ mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holidays.map((holiday) => (
            <Card key={holiday.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    {holiday.holidayName}
                  </CardTitle>
                  {holiday.isRecurringYearly && (
                    <Badge>Lặp lại hàng năm</Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Cập nhật lúc:{" "}
                  {new Date(holiday.updatedAt).toLocaleString("vi-VN")}
                  {holiday.updatedBy && (
                    <span> bởi {holiday.updatedBy.fullName}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label>Ngày:</Label>
                    <p className="text-sm font-medium">
                      {new Date(holiday.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {holiday.description && (
                    <div>
                      <Label>Mô tả:</Label>
                      <p className="text-sm text-muted-foreground break-words">
                        {holiday.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(holiday)}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Sửa
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteHoliday(holiday.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Xóa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog chỉnh sửa */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ngày lễ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho ngày lễ {currentHoliday?.holidayName}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditHoliday)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Không thể thay đổi ngày của ngày lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="holidayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên ngày lễ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên ngày lễ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả cho ngày lễ này"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isRecurringYearly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Lặp lại hàng năm</FormLabel>
                      <FormDescription>
                        Ngày lễ này sẽ được lặp lại vào cùng ngày hàng năm
                      </FormDescription>
                    </div>
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