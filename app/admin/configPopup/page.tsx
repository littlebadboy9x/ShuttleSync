"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Clock, Calendar, DollarSign } from "lucide-react";

// Components
import ConfigGeneral from "./components/ConfigGeneral";
import ConfigCourts from "./components/ConfigCourts";
import ConfigTimeSlots from "./components/ConfigTimeSlots";
import ConfigPricing from "./components/ConfigPricing";
import ConfigHolidays from "./components/ConfigHolidays";

interface ConfigPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigPopup({ isOpen, onClose }: ConfigPopupProps) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Cấu hình hệ thống
          </DialogTitle>
          <DialogDescription>
            Quản lý các cấu hình cho hệ thống ShuttleSync
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Chung</span>
            </TabsTrigger>
            <TabsTrigger value="courts" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Sân</span>
            </TabsTrigger>
            <TabsTrigger value="timeslots" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Khung giờ</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Giá</span>
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Ngày lễ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình chung</CardTitle>
                <CardDescription>
                  Quản lý các cấu hình chung của hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigGeneral />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình sân</CardTitle>
                <CardDescription>
                  Quản lý cấu hình sân cầu lông
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigCourts />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeslots" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình khung giờ</CardTitle>
                <CardDescription>
                  Quản lý cấu hình khung giờ cho sân
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigTimeSlots />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình giá</CardTitle>
                <CardDescription>
                  Quản lý cấu hình giá cho từng khung giờ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigPricing />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình ngày lễ</CardTitle>
                <CardDescription>
                  Quản lý các ngày lễ và ngày đặc biệt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConfigHolidays />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
