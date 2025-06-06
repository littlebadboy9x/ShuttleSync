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

// Định nghĩa schema cho form
const configFormSchema = z.object({
  key: z.string().min(1, "Vui lòng nhập khóa cấu hình"),
  value: z.string().min(1, "Vui lòng nhập giá trị"),
  description: z.string().optional(),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

// Interface cho dữ liệu cấu hình
interface Configuration {
  id: number;
  configKey: string;
  configValue: string;
  description: string | null;
  updatedAt: string;
  updatedBy: {
    id: number;
    email: string;
    fullName: string;
  } | null;
}

export default function ConfigGeneral() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<Configuration | null>(null);

  // Form cho thêm mới
  const addForm = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  // Form cho chỉnh sửa
  const editForm = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  // Hàm lấy danh sách cấu hình
  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/config");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setConfigurations(data);
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách cấu hình",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchConfigurations();
  }, []);

  // Xử lý thêm mới cấu hình
  const handleAddConfig = async (values: ConfigFormValues) => {
    try {
      const formData = new FormData();
      formData.append("key", values.key);
      formData.append("value", values.value);
      if (values.description) {
        formData.append("description", values.description);
      }

      const response = await fetch("/api/admin/config", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã thêm cấu hình mới",
      });

      setIsAddDialogOpen(false);
      addForm.reset();
      fetchConfigurations();
    } catch (error) {
      console.error("Error adding configuration:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm cấu hình",
        variant: "destructive",
      });
    }
  };

  // Xử lý cập nhật cấu hình
  const handleEditConfig = async (values: ConfigFormValues) => {
    if (!currentConfig) return;

    try {
      const formData = new FormData();
      formData.append("value", values.value);
      if (values.description) {
        formData.append("description", values.description);
      }

      const response = await fetch(`/api/admin/config/${currentConfig.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật cấu hình",
      });

      setIsEditDialogOpen(false);
      setCurrentConfig(null);
      fetchConfigurations();
    } catch (error) {
      console.error("Error updating configuration:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cấu hình",
        variant: "destructive",
      });
    }
  };

  // Xử lý xóa cấu hình
  const handleDeleteConfig = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa cấu hình này không?")) return;

    try {
      const response = await fetch(`/api/admin/config/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Thành công",
        description: "Đã xóa cấu hình",
      });

      fetchConfigurations();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa cấu hình",
        variant: "destructive",
      });
    }
  };

  // Mở dialog chỉnh sửa và điền dữ liệu
  const openEditDialog = (config: Configuration) => {
    setCurrentConfig(config);
    editForm.setValue("key", config.configKey);
    editForm.setValue("value", config.configValue);
    editForm.setValue("description", config.description || "");
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Danh sách cấu hình</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchConfigurations}
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
                <DialogTitle>Thêm cấu hình mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin cấu hình mới cho hệ thống
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(handleAddConfig)}
                  className="space-y-4"
                >
                  <FormField
                    control={addForm.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Khóa cấu hình</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập khóa cấu hình" {...field} />
                        </FormControl>
                        <FormDescription>
                          Khóa cấu hình phải là duy nhất
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập giá trị" {...field} />
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
                            placeholder="Nhập mô tả cho cấu hình này"
                            {...field}
                          />
                        </FormControl>
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
      ) : configurations.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Chưa có cấu hình nào. Hãy thêm cấu hình mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configurations.map((config) => (
            <Card key={config.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  {config.configKey}
                </CardTitle>
                <CardDescription className="text-xs">
                  Cập nhật lúc:{" "}
                  {new Date(config.updatedAt).toLocaleString("vi-VN")}
                  {config.updatedBy && (
                    <span> bởi {config.updatedBy.fullName}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label>Giá trị:</Label>
                    <p className="text-sm font-medium break-words">
                      {config.configValue}
                    </p>
                  </div>
                  {config.description && (
                    <div>
                      <Label>Mô tả:</Label>
                      <p className="text-sm text-muted-foreground break-words">
                        {config.description}
                      </p>
                    </div>
                  )}
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteConfig(config.id)}
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
            <DialogTitle>Chỉnh sửa cấu hình</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho cấu hình {currentConfig?.configKey}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditConfig)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khóa cấu hình</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập khóa cấu hình"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Không thể thay đổi khóa cấu hình
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập giá trị" {...field} />
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
                        placeholder="Nhập mô tả cho cấu hình này"
                        {...field}
                      />
                    </FormControl>
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