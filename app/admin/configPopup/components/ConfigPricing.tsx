"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function ConfigPricing() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cấu hình giá</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Tính năng cấu hình giá đang được phát triển.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng quay lại sau.
          </p>
        </div>
      )}
    </div>
  );
} 