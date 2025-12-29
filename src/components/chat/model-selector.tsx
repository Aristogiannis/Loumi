'use client';

import { useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Sparkles, Zap, Brain } from 'lucide-react';
import type { ModelId } from '@/types/models';
import { models } from '@/lib/ai/providers';
import { useChatStore } from '@/stores/chat-store';
import { cn } from '@/lib/utils';

const providerIcons: Record<string, React.ReactNode> = {
  openai: <Sparkles className="h-3.5 w-3.5 text-green-500" />,
  anthropic: <Brain className="h-3.5 w-3.5 text-orange-500" />,
  google: <Zap className="h-3.5 w-3.5 text-blue-500" />,
};

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
};

export function ModelSelector() {
  const { currentModel, setCurrentModel, isStreaming } = useChatStore();

  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, (typeof models)[ModelId][]> = {};
    Object.values(models).forEach((model) => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider]!.push(model);
    });
    return grouped;
  }, []);

  const currentModelConfig = models[currentModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 gap-1.5 px-2 text-sm font-medium"
          disabled={isStreaming}
        >
          {providerIcons[currentModelConfig.provider]}
          <span className="max-w-[120px] truncate">{currentModelConfig.name}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {Object.entries(modelsByProvider).map(([provider, providerModels], index) => (
          <div key={provider}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="flex items-center gap-2">
              {providerIcons[provider]}
              {providerLabels[provider]}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {providerModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onSelect={() => setCurrentModel(model.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                  {currentModel === model.id && <Check className="h-4 w-4 text-loumi-500" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for header
export function ModelSelectorCompact() {
  const { currentModel, setCurrentModel, isStreaming } = useChatStore();

  const modelsByProvider = useMemo(() => {
    const grouped: Record<string, (typeof models)[ModelId][]> = {};
    Object.values(models).forEach((model) => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider]!.push(model);
    });
    return grouped;
  }, []);

  const currentModelConfig = models[currentModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={isStreaming}
        >
          {providerIcons[currentModelConfig.provider]}
          <span>{currentModelConfig.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {Object.entries(modelsByProvider).map(([provider, providerModels], index) => (
          <div key={provider}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
              {providerIcons[provider]}
              {providerLabels[provider]}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {providerModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onSelect={() => setCurrentModel(model.id)}
                  className={cn(
                    'flex items-center justify-between text-sm',
                    currentModel === model.id && 'bg-accent'
                  )}
                >
                  <span>{model.name}</span>
                  {currentModel === model.id && <Check className="h-3.5 w-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
