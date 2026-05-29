"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePipelineStage, removeFromBoard } from "@/server/actions/shortlists";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PIPELINE_STAGE_LABELS } from "@/config/enums";
import { Trash2 } from "lucide-react";

interface BoardItemActionsProps {
  itemId: string;
  boardId: string;
  modelProfileId: string;
  currentStage: string;
  locale: string;
}

const stageOptions = (lang: "it" | "en") =>
  Object.entries(PIPELINE_STAGE_LABELS).map(([value, labels]) => ({
    value,
    label: labels[lang],
  }));

export function BoardItemActions({ itemId, boardId, modelProfileId, currentStage, locale }: BoardItemActionsProps) {
  const lang = (locale === "en" ? "en" : "it") as "it" | "en";
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStageChange = async (stage: string) => {
    if (stage === currentStage) return;
    setLoading(true);
    await updatePipelineStage(itemId, stage);
    setLoading(false);
    router.refresh();
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeFromBoard(boardId, modelProfileId);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        options={stageOptions(lang)}
        value={currentStage}
        onValueChange={handleStageChange}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={loading}
        className="text-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
